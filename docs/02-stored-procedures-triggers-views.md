## Stored Procedures (10)

### 1. `soft_delete_user(user_id INT, deleted_by INT)`
- **Purpose**: Soft delete a user and log to audit
- **Usage**: `SELECT soft_delete_user(1, 2);`
- **Returns**: VOID

### 2. `soft_delete_course(course_id INT, deleted_by INT)`
- **Purpose**: Soft delete a course and log to audit
- **Usage**: `SELECT soft_delete_course(1, 2);`
- **Returns**: VOID

### 3. `get_user_with_roles(user_id INT)`
- **Purpose**: Get user with all assigned roles
- **Usage**: `SELECT * FROM get_user_with_roles(1);`
- **Returns**: Table with user info and roles array

### 4. `enroll_student_in_course(p_student_id INT, p_course_id INT)`
- **Purpose**: Enroll student in course with audit logging
- **Usage**: `SELECT enroll_student_in_course(1, 2);`
- **Returns**: Enrollment ID

### 5. `submit_assignment(p_assignment_id INT, p_student_id INT, p_content TEXT)`
- **Purpose**: Submit assignment with audit logging
- **Usage**: `SELECT submit_assignment(1, 2, 'Assignment content');`
- **Returns**: Submission ID

### 6. `grade_submission(p_submission_id INT, p_grader_id INT, p_grade NUMERIC)`
- **Purpose**: Grade a submission with audit logging
- **Usage**: `SELECT grade_submission(1, 2, 85.5);`
- **Returns**: Grade ID

### 7. `get_course_statistics(p_course_id INT)`
- **Purpose**: Get comprehensive course statistics
- **Usage**: `SELECT * FROM get_course_statistics(1);`
- **Returns**: Table with student count, assignment count, submission count, average grade

### 8. `update_entity_with_audit(p_table_name VARCHAR, p_entity_id INT, p_updated_by INT)`
- **Purpose**: Generic function to update any entity with audit logging
- **Usage**: `SELECT update_entity_with_audit('courses', 1, 2);`
- **Returns**: VOID

### 9. `get_student_progress(p_student_id INT, p_course_id INT)`
- **Purpose**: Get student progress in a course
- **Usage**: `SELECT * FROM get_student_progress(1, 2);`
- **Returns**: Table with lesson counts, assignment counts, average grade

### 10. `get_teacher_courses(p_teacher_id INT)`
- **Purpose**: Get all courses for a teacher with statistics
- **Usage**: `SELECT * FROM get_teacher_courses(1);`
- **Returns**: Table with course info, student count, module count

## Triggers (7)

### 1. `trigger_update_users_updated_at`
- **Table**: `users`
- **Event**: BEFORE UPDATE
- **Purpose**: Automatically set `updated_at` to current timestamp

### 2. `trigger_update_courses_updated_at`
- **Table**: `courses`
- **Event**: BEFORE UPDATE
- **Purpose**: Automatically set `updated_at` to current timestamp

### 3. `trigger_update_modules_updated_at`
- **Table**: `modules`
- **Event**: BEFORE UPDATE
- **Purpose**: Automatically set `updated_at` to current timestamp

### 4. `trigger_update_lessons_updated_at`
- **Table**: `lessons`
- **Event**: BEFORE UPDATE
- **Purpose**: Automatically set `updated_at` to current timestamp

### 5. `trigger_update_assignments_updated_at`
- **Table**: `assignments`
- **Event**: BEFORE UPDATE
- **Purpose**: Automatically set `updated_at` to current timestamp

### 6. `trigger_update_course_materials_updated_at`
- **Table**: `course_materials`
- **Event**: BEFORE UPDATE
- **Purpose**: Automatically set `updated_at` to current timestamp

### 7. `trigger_notify_on_grade`
- **Table**: `grades`
- **Event**: AFTER INSERT
- **Purpose**: Automatically create notification when a grade is submitted

## Views (4)

### 1. `v_active_users_with_roles`
- **Purpose**: Get all active users with their roles aggregated
- **Usage**: `SELECT * FROM v_active_users_with_roles;`
- **Columns**: `id`, `email`, `full_name`, `updated_at`, `updated_by`, `roles` (array)

### 2. `v_course_details`
- **Purpose**: Get course details with aggregated statistics
- **Usage**: `SELECT * FROM v_course_details WHERE id = 1;`
- **Columns**: Course info + `student_count`, `module_count`, `lesson_count`, `teacher_name`

### 3. `v_student_enrollments`
- **Purpose**: Get student enrollments with course info and statistics
- **Usage**: `SELECT * FROM v_student_enrollments WHERE student_id = 1;`
- **Columns**: Enrollment info + course details + `submission_count`, `average_grade`

### 4. `v_assignment_submissions`
- **Purpose**: Get assignment submissions with grades and grader info
- **Usage**: `SELECT * FROM v_assignment_submissions WHERE assignment_id = 1;`
- **Columns**: Assignment + submission + grade + student + grader info

## Usage in Code

All stored procedures and views are used through the Repository pattern and Unit of Work pattern:

```typescript
// Using stored procedure
const userWithRoles = await userRepository.getUserWithRoles(userId);

// Using view
const courseDetails = await courseRepository.getCourseDetails(courseId);

// Using stored procedure in transaction
const enrollmentId = await unitOfWork.enrollments.enrollStudent(studentId, courseId);
```

