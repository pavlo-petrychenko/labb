-- Initialize database schema
-- This file contains stored procedures, triggers, views, and indexes

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- 1. Procedure to soft delete a user
CREATE OR REPLACE FUNCTION soft_delete_user(user_id INT, deleted_by INT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET deleted_at = NOW(), 
        updated_at = NOW(), 
        updated_by = deleted_by
    WHERE id = user_id AND deleted_at IS NULL;
    
    INSERT INTO audit_logs (entity_name, entity_id, action, changed_by, changed_at)
    VALUES ('users', user_id, 'DELETE', deleted_by, NOW());
END;
$$ LANGUAGE plpgsql;

-- 2. Procedure to soft delete a course
CREATE OR REPLACE FUNCTION soft_delete_course(course_id INT, deleted_by INT)
RETURNS VOID AS $$
BEGIN
    UPDATE courses 
    SET deleted_at = NOW(), 
        updated_at = NOW(), 
        updated_by = deleted_by
    WHERE id = course_id AND deleted_at IS NULL;
    
    INSERT INTO audit_logs (entity_name, entity_id, action, changed_by, changed_at)
    VALUES ('courses', course_id, 'DELETE', deleted_by, NOW());
END;
$$ LANGUAGE plpgsql;

-- 3. Procedure to get user with roles
CREATE OR REPLACE FUNCTION get_user_with_roles(p_user_id INT)
RETURNS TABLE (
    id INT,
    email VARCHAR,
    full_name VARCHAR,
    roles TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        ARRAY_AGG(r.name::TEXT) FILTER (WHERE r.name IS NOT NULL)::TEXT[] as roles
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id = p_user_id AND u.deleted_at IS NULL
    GROUP BY u.id, u.email, u.full_name;
END;
$$ LANGUAGE plpgsql;

-- 4. Procedure to enroll student in course
CREATE OR REPLACE FUNCTION enroll_student_in_course(
    p_student_id INT,
    p_course_id INT
)
RETURNS INT AS $$
DECLARE
    enrollment_id INT;
BEGIN
    INSERT INTO enrollments (student_id, course_id, enrolled_at, status)
    VALUES (p_student_id, p_course_id, NOW(), 'active')
    ON CONFLICT DO NOTHING
    RETURNING id INTO enrollment_id;
    
    IF enrollment_id IS NULL THEN
        SELECT id INTO enrollment_id 
        FROM enrollments 
        WHERE student_id = p_student_id AND course_id = p_course_id;
    END IF;
    
    INSERT INTO audit_logs (entity_name, entity_id, action, changed_by, changed_at)
    VALUES ('enrollments', enrollment_id, 'CREATE', p_student_id, NOW());
    
    RETURN enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Procedure to submit assignment
CREATE OR REPLACE FUNCTION submit_assignment(
    p_assignment_id INT,
    p_student_id INT,
    p_content TEXT
)
RETURNS INT AS $$
DECLARE
    submission_id INT;
BEGIN
    INSERT INTO submissions (assignment_id, student_id, content, submitted_at)
    VALUES (p_assignment_id, p_student_id, p_content, NOW())
    RETURNING id INTO submission_id;
    
    INSERT INTO audit_logs (entity_name, entity_id, action, changed_by, changed_at)
    VALUES ('submissions', submission_id, 'CREATE', p_student_id, NOW());
    
    RETURN submission_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Procedure to grade submission
CREATE OR REPLACE FUNCTION grade_submission(
    p_submission_id INT,
    p_grader_id INT,
    p_grade NUMERIC
)
RETURNS INT AS $$
DECLARE
    grade_id INT;
BEGIN
    INSERT INTO grades (submission_id, graded_by, grade, graded_at)
    VALUES (p_submission_id, p_grader_id, p_grade, NOW())
    RETURNING id INTO grade_id;
    
    INSERT INTO audit_logs (entity_name, entity_id, action, changed_by, changed_at)
    VALUES ('grades', grade_id, 'CREATE', p_grader_id, NOW());
    
    RETURN grade_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Procedure to get course statistics
CREATE OR REPLACE FUNCTION get_course_statistics(p_course_id INT)
RETURNS TABLE (
    total_students BIGINT,
    total_assignments BIGINT,
    total_submissions BIGINT,
    average_grade NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT e.student_id)::BIGINT as total_students,
        COUNT(DISTINCT a.id)::BIGINT as total_assignments,
        COUNT(DISTINCT s.id)::BIGINT as total_submissions,
        COALESCE(AVG(g.grade), 0)::NUMERIC as average_grade
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
    LEFT JOIN modules m ON c.id = m.course_id AND m.deleted_at IS NULL
    LEFT JOIN lessons l ON m.id = l.module_id AND l.deleted_at IS NULL
    LEFT JOIN assignments a ON l.id = a.lesson_id AND a.deleted_at IS NULL
    LEFT JOIN submissions s ON a.id = s.assignment_id
    LEFT JOIN grades g ON s.id = g.submission_id
    WHERE c.id = p_course_id AND c.deleted_at IS NULL
    GROUP BY c.id;
END;
$$ LANGUAGE plpgsql;

-- 8. Procedure to update entity with audit
CREATE OR REPLACE FUNCTION update_entity_with_audit(
    p_table_name VARCHAR,
    p_entity_id INT,
    p_updated_by INT
)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE %I SET updated_at = NOW(), updated_by = $1 WHERE id = $2', p_table_name)
    USING p_updated_by, p_entity_id;
    
    INSERT INTO audit_logs (entity_name, entity_id, action, changed_by, changed_at)
    VALUES (p_table_name, p_entity_id, 'UPDATE', p_updated_by, NOW());
END;
$$ LANGUAGE plpgsql;

-- 9. Procedure to get student progress
CREATE OR REPLACE FUNCTION get_student_progress(
    p_student_id INT,
    p_course_id INT
)
RETURNS TABLE (
    total_lessons BIGINT,
    completed_lessons BIGINT,
    total_assignments BIGINT,
    submitted_assignments BIGINT,
    average_grade NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.id)::BIGINT as total_lessons,
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN l.id END)::BIGINT as completed_lessons,
        COUNT(DISTINCT a.id)::BIGINT as total_assignments,
        COUNT(DISTINCT s.id)::BIGINT as submitted_assignments,
        COALESCE(AVG(g.grade), 0)::NUMERIC as average_grade
    FROM courses c
    JOIN modules m ON c.id = m.course_id AND m.deleted_at IS NULL
    JOIN lessons l ON m.id = l.module_id AND l.deleted_at IS NULL
    LEFT JOIN assignments a ON l.id = a.lesson_id AND a.deleted_at IS NULL
    LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = p_student_id
    LEFT JOIN grades g ON s.id = g.submission_id
    LEFT JOIN attendance att ON l.id = att.lesson_id AND att.student_id = p_student_id
    WHERE c.id = p_course_id 
      AND c.deleted_at IS NULL
      AND EXISTS (
          SELECT 1 FROM enrollments e 
          WHERE e.student_id = p_student_id 
            AND e.course_id = p_course_id 
            AND e.status = 'active'
      );
END;
$$ LANGUAGE plpgsql;

-- 10. Procedure to get teacher courses
CREATE OR REPLACE FUNCTION get_teacher_courses(p_teacher_id INT)
RETURNS TABLE (
    course_id INT,
    course_title VARCHAR,
    student_count BIGINT,
    module_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as course_id,
        c.title as course_title,
        COUNT(DISTINCT e.student_id)::BIGINT as student_count,
        COUNT(DISTINCT m.id)::BIGINT as module_count
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
    LEFT JOIN modules m ON c.id = m.course_id AND m.deleted_at IS NULL
    WHERE c.teacher_id = p_teacher_id AND c.deleted_at IS NULL
    GROUP BY c.id, c.title;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- 1. Trigger to automatically update updated_at on users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- 2. Trigger to automatically update updated_at on courses
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_courses_updated_at();

-- 3. Trigger to automatically update updated_at on modules
CREATE OR REPLACE FUNCTION update_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW
    EXECUTE FUNCTION update_modules_updated_at();

-- 4. Trigger to automatically update updated_at on lessons
CREATE OR REPLACE FUNCTION update_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_lessons_updated_at();

-- 5. Trigger to automatically update updated_at on assignments
CREATE OR REPLACE FUNCTION update_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_assignments_updated_at();

-- 6. Trigger to automatically update updated_at on course_materials
CREATE OR REPLACE FUNCTION update_course_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_materials_updated_at
    BEFORE UPDATE ON course_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_course_materials_updated_at();

-- 7. Trigger to create notification on grade submission
CREATE OR REPLACE FUNCTION notify_on_grade()
RETURNS TRIGGER AS $$
DECLARE
    student_user_id INT;
BEGIN
    SELECT s.student_id INTO student_user_id
    FROM submissions s
    WHERE s.id = NEW.submission_id;
    
    INSERT INTO notifications (user_id, message, is_read, created_at)
    VALUES (
        student_user_id,
        'Your submission has been graded: ' || NEW.grade,
        false,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_grade
    AFTER INSERT ON grades
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_grade();

-- ============================================
-- VIEWS
-- ============================================

-- 1. View for active users with roles
CREATE OR REPLACE VIEW v_active_users_with_roles AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.updated_at,
    u.updated_by,
    ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.full_name, u.updated_at, u.updated_by;

-- 2. View for course details with statistics
CREATE OR REPLACE VIEW v_course_details AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.teacher_id,
    u.full_name as teacher_name,
    COUNT(DISTINCT e.student_id) as student_count,
    COUNT(DISTINCT m.id) as module_count,
    COUNT(DISTINCT l.id) as lesson_count,
    c.updated_at,
    c.updated_by
FROM courses c
LEFT JOIN users u ON c.teacher_id = u.id
LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
LEFT JOIN modules m ON c.id = m.course_id AND m.deleted_at IS NULL
LEFT JOIN lessons l ON m.id = l.module_id AND l.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.title, c.description, c.teacher_id, u.full_name, c.updated_at, c.updated_by;

-- 3. View for student enrollments with course info
CREATE OR REPLACE VIEW v_student_enrollments AS
SELECT 
    e.id as enrollment_id,
    e.student_id,
    u.email as student_email,
    u.full_name as student_name,
    e.course_id,
    c.title as course_title,
    e.enrolled_at,
    e.status,
    COUNT(DISTINCT s.id) as submission_count,
    COALESCE(AVG(g.grade), 0) as average_grade
FROM enrollments e
JOIN users u ON e.student_id = u.id
JOIN courses c ON e.course_id = c.id
LEFT JOIN modules m ON c.id = m.course_id AND m.deleted_at IS NULL
LEFT JOIN lessons l ON m.id = l.module_id AND l.deleted_at IS NULL
LEFT JOIN assignments a ON l.id = a.lesson_id AND a.deleted_at IS NULL
LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
LEFT JOIN grades g ON s.id = g.submission_id
WHERE e.status = 'active' AND c.deleted_at IS NULL
GROUP BY e.id, e.student_id, u.email, u.full_name, e.course_id, c.title, e.enrolled_at, e.status;

-- 4. View for assignment submissions with grades
CREATE OR REPLACE VIEW v_assignment_submissions AS
SELECT 
    a.id as assignment_id,
    a.title as assignment_title,
    a.due_date,
    s.id as submission_id,
    s.student_id,
    u.full_name as student_name,
    s.submitted_at,
    g.id as grade_id,
    g.grade,
    g.graded_at,
    g.graded_by as grader_id,
    grader.full_name as grader_name
FROM assignments a
LEFT JOIN submissions s ON a.id = s.assignment_id
LEFT JOIN users u ON s.student_id = u.id
LEFT JOIN grades g ON s.id = g.submission_id
LEFT JOIN users grader ON g.graded_by = grader.id
WHERE a.deleted_at IS NULL;

-- ============================================
-- INDEXES
-- ============================================

-- 1. B-tree index on users email (for fast lookups)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- 2. B-tree index on courses teacher_id (for filtering by teacher)
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id) WHERE deleted_at IS NULL;

-- 3. B-tree index on enrollments student_id and course_id (composite, for joins)
CREATE INDEX IF NOT EXISTS idx_enrollments_student_course ON enrollments(student_id, course_id) WHERE status = 'active';

-- 4. B-tree index on submissions assignment_id and student_id (composite)
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_student ON submissions(assignment_id, student_id);

-- 5. B-tree index on grades submission_id (for joining with submissions)
CREATE INDEX IF NOT EXISTS idx_grades_submission_id ON grades(submission_id);

-- 6. Hash index on user_roles (for fast role lookups)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_hash ON user_roles USING hash(user_id);

-- 7. B-tree index on audit_logs entity_name and changed_at (for audit queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_changed ON audit_logs(entity_name, changed_at DESC);

-- 8. B-tree index on notifications user_id and is_read (for filtering unread)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read) WHERE is_read = false;

-- 9. GIN index on comments content (for full-text search)
CREATE INDEX IF NOT EXISTS idx_comments_content_gin ON comments USING gin(to_tsvector('english', content)) WHERE deleted_at IS NULL;

-- 10. B-tree index on modules course_id and order_index (for ordered retrieval)
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules(course_id, order_index) WHERE deleted_at IS NULL;

