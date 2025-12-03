## Entities

### 1. Users
- **Purpose**: Stores user accounts (students, teachers, admins)
- **Soft Delete**: Yes (`deleted_at`)
- **Audit Fields**: `updated_at`, `updated_by`
- **Key Fields**: `id`, `email` (unique), `password_hash`, `full_name`

### 2. Roles
- **Purpose**: Defines user roles (student, teacher, admin)
- **Key Fields**: `id`, `name` (unique)

### 3. UserRoles
- **Purpose**: Many-to-many relationship between users and roles
- **Key Fields**: `user_id`, `role_id` (composite primary key)

### 4. Courses
- **Purpose**: Educational courses
- **Soft Delete**: Yes (`deleted_at`)
- **Audit Fields**: `updated_at`, `updated_by`
- **Relationships**: Belongs to User (teacher)

### 5. Modules
- **Purpose**: Course modules/chapters
- **Soft Delete**: Yes (`deleted_at`)
- **Audit Fields**: `updated_at`, `updated_by`
- **Relationships**: Belongs to Course

### 6. Lessons
- **Purpose**: Individual lessons within modules
- **Soft Delete**: Yes (`deleted_at`)
- **Audit Fields**: `updated_at`, `updated_by`
- **Relationships**: Belongs to Module

### 7. Assignments
- **Purpose**: Assignments for lessons
- **Soft Delete**: Yes (`deleted_at`)
- **Audit Fields**: `updated_at`, `updated_by`
- **Relationships**: Belongs to Lesson

### 8. Submissions
- **Purpose**: Student assignment submissions
- **Relationships**: Belongs to Assignment and User (student)

### 9. Grades
- **Purpose**: Grades for submissions
- **Relationships**: Belongs to Submission and User (grader)

### 10. Enrollments
- **Purpose**: Student course enrollments
- **Key Fields**: `status` (active/inactive)

### 11. CourseMaterials
- **Purpose**: Course materials/files
- **Soft Delete**: Yes (`deleted_at`)
- **Audit Fields**: `updated_at`, `updated_by`
- **Relationships**: Belongs to Course

### 12. Attendance
- **Purpose**: Lesson attendance records
- **Relationships**: Belongs to Lesson and User (student)

### 13. Comments
- **Purpose**: Comments on various entities (polymorphic)
- **Soft Delete**: Yes (`deleted_at`)
- **Key Fields**: `entity_type`, `entity_id` (polymorphic)

### 14. Notifications
- **Purpose**: User notifications
- **Key Fields**: `is_read` (boolean)

### 15. AuditLogs
- **Purpose**: Audit trail for all entity changes
- **Relationships**: Belongs to User (changed_by)

## Relationships Summary

- Users ↔ Roles: Many-to-many (via UserRoles)
- Users → Courses: One-to-many (teacher)
- Users → Enrollments: One-to-many (student)
- Courses → Modules: One-to-many
- Modules → Lessons: One-to-many
- Lessons → Assignments: One-to-many
- Assignments → Submissions: One-to-many
- Submissions → Grades: One-to-many
- Users → Submissions: One-to-many (student)
- Users → Grades: One-to-many (grader)

## Indexes

1. **B-tree indexes**: `users.email`, `courses.teacher_id`, `enrollments(student_id, course_id)`, etc.
2. **Hash index**: `user_roles.user_id`
3. **GIN index**: `comments.content` (full-text search)
4. **Composite indexes**: Multiple fields for optimized joins

## Soft Delete Implementation

Entities with soft delete:
- Users
- Courses
- Modules
- Lessons
- Assignments
- CourseMaterials
- Comments

Soft delete is implemented using `deleted_at` timestamp field. Queries automatically filter out soft-deleted records using WHERE clauses.

## Audit Fields

Entities with audit fields:
- Users: `updated_at`, `updated_by`
- Courses: `updated_at`, `updated_by`
- Modules: `updated_at`, `updated_by`
- Lessons: `updated_at`, `updated_by`
- Assignments: `updated_at`, `updated_by`
- CourseMaterials: `updated_at`, `updated_by`

All changes are also logged in the `audit_logs` table for complete audit trail.

