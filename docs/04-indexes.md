### 1. B-tree Indexes
#### Examples:

1. **`idx_users_email`** (Partial Index)
   ```sql
   CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
   ```
   - Purpose: Fast email lookups for active users only
   - Type: B-tree with WHERE clause

2. **`idx_courses_teacher_id`** (Partial Index)
   ```sql
   CREATE INDEX idx_courses_teacher_id ON courses(teacher_id) WHERE deleted_at IS NULL;
   ```
   - Purpose: Fast filtering by teacher for active courses

3. **`idx_enrollments_student_course`** (Composite Index)
   ```sql
   CREATE INDEX idx_enrollments_student_course 
   ON enrollments(student_id, course_id) WHERE status = 'active';
   ```
   - Purpose: Optimize joins and lookups for active enrollments

4. **`idx_submissions_assignment_student`** (Composite Index)
   ```sql
   CREATE INDEX idx_submissions_assignment_student 
   ON submissions(assignment_id, student_id);
   ```
   - Purpose: Fast lookups of student submissions for assignments

5. **`idx_grades_submission_id`**
   ```sql
   CREATE INDEX idx_grades_submission_id ON grades(submission_id);
   ```
   - Purpose: Fast joins between submissions and grades

6. **`idx_audit_logs_entity_changed`** (Composite with DESC)
   ```sql
   CREATE INDEX idx_audit_logs_entity_changed 
   ON audit_logs(entity_name, changed_at DESC);
   ```
   - Purpose: Optimize audit log queries by entity and time

7. **`idx_notifications_user_read`** (Partial Index)
   ```sql
   CREATE INDEX idx_notifications_user_read 
   ON notifications(user_id, is_read) WHERE is_read = false;
   ```
   - Purpose: Fast queries for unread notifications

8. **`idx_modules_course_order`** (Composite Partial Index)
   ```sql
   CREATE INDEX idx_modules_course_order 
   ON modules(course_id, order_index) WHERE deleted_at IS NULL;
   ```
   - Purpose: Optimize ordered retrieval of modules

### 2. Hash Indexes
#### Example:

1. **`idx_user_roles_user_id_hash`**
   ```sql
   CREATE INDEX idx_user_roles_user_id_hash 
   ON user_roles USING hash(user_id);
   ```
   - Purpose: Very fast lookups of user roles by user_id
   - Type: Hash index

### 3. GIN (Generalized Inverted Index) Indexes
#### Example:

1. **`idx_comments_content_gin`** (Full-text Search)
   ```sql
   CREATE INDEX idx_comments_content_gin 
   ON comments USING gin(to_tsvector('english', content)) 
   WHERE deleted_at IS NULL;
   ```
   - Purpose: Fast full-text search in comments
   - Type: GIN index with text search vector


## Partial Indexes

Many indexes use WHERE clauses to create partial indexes:
- Only index active/non-deleted records
- Reduces index size
- Improves query performance for filtered queries

Examples:
- `WHERE deleted_at IS NULL` - Only index active records
- `WHERE status = 'active'` - Only index active enrollments
- `WHERE is_read = false` - Only index unread notifications

## Composite Indexes

Multiple columns in single index:
- Optimize queries filtering/joining on multiple columns
- Column order matters (most selective first)

Examples:
- `(student_id, course_id)` - For enrollment lookups
- `(assignment_id, student_id)` - For submission lookups
- `(entity_name, changed_at DESC)` - For audit log queries

