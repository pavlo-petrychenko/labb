# Educational Platform API

A comprehensive educational platform backend built with Express, TypeScript, PostgreSQL, MongoDB, and TypeORM.

## Features

- **15+ Entities**: Users, roles, courses, modules, lessons, assignments, submissions, grades, enrollments, course materials, attendance, comments, notifications, audit logs
- **Soft Delete**: Multiple entities support soft delete with `deleted_at` field
- **Audit Fields**: `updated_at` and `updated_by` fields for tracking changes
- **Repository Pattern**: Base repository with specialized repositories
- **Unit of Work Pattern**: Transaction management for multiple entities
- **Stored Procedures**: 10+ stored procedures for business logic
- **Triggers**: 7 triggers for automatic field updates
- **Views**: 4 views for complex queries
- **Indexes**: 10+ indexes (B-tree, hash, GIN) for performance
- **NoSQL Integration**: MongoDB for analytics, activities, and learning paths
- **Performance Comparison**: Scripts to compare SQL vs NoSQL performance

## Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository** 

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start databases with Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Configure environment variables**:
   Create a `.env` file (see `.env.example`):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=educational_platform
   
   MONGO_URI=mongodb://admin:admin123@localhost:27017/educational_platform?authSource=admin
   
   PORT=3000
   NODE_ENV=development
   ```

5. **Run the application**:
   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`

## API Endpoints

### Users

- `GET /api/users` - Get all active users (uses view)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/roles` - Get user with roles (uses stored procedure)
- `POST /api/users` - Create user
- `DELETE /api/users/:id` - Soft delete user (uses stored procedure)

### Courses

- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/:id/details` - Get course details (uses view)
- `GET /api/courses/:id/statistics` - Get course statistics (uses stored procedure)
- `GET /api/courses/teacher/:teacherId` - Get teacher courses (uses stored procedure)
- `POST /api/courses` - Create course
- `DELETE /api/courses/:id` - Soft delete course (uses stored procedure)

### Enrollments

- `POST /api/enrollments` - Enroll student in course (uses stored procedure + Unit of Work)
- `GET /api/enrollments/student/:studentId` - Get student enrollments (uses view)
- `GET /api/enrollments/student/:studentId/course/:courseId/progress` - Get student progress (uses stored procedure)

### Submissions

- `POST /api/submissions` - Submit assignment (uses stored procedure)
- `GET /api/submissions/assignment/:assignmentId` - Get assignment submissions (uses view)
- `POST /api/submissions/grade` - Grade submission (uses stored procedure)

### Health Check

- `GET /health` - Health check endpoint

## Database Features

### Stored Procedures (10)

1. `soft_delete_user(user_id, deleted_by)`
2. `soft_delete_course(course_id, deleted_by)`
3. `get_user_with_roles(user_id)`
4. `enroll_student_in_course(student_id, course_id)`
5. `submit_assignment(assignment_id, student_id, content)`
6. `grade_submission(submission_id, grader_id, grade)`
7. `get_course_statistics(course_id)`
8. `update_entity_with_audit(table_name, entity_id, updated_by)`
9. `get_student_progress(student_id, course_id)`
10. `get_teacher_courses(teacher_id)`

### Triggers (7)

1. `trigger_update_users_updated_at` - Auto-update `updated_at` on users
2. `trigger_update_courses_updated_at` - Auto-update `updated_at` on courses
3. `trigger_update_modules_updated_at` - Auto-update `updated_at` on modules
4. `trigger_update_lessons_updated_at` - Auto-update `updated_at` on lessons
5. `trigger_update_assignments_updated_at` - Auto-update `updated_at` on assignments
6. `trigger_update_course_materials_updated_at` - Auto-update `updated_at` on course materials
7. `trigger_notify_on_grade` - Create notification when grade is submitted

### Views (4)

1. `v_active_users_with_roles` - Active users with aggregated roles
2. `v_course_details` - Course details with statistics
3. `v_student_enrollments` - Student enrollments with course info
4. `v_assignment_submissions` - Assignment submissions with grades

### Indexes (10+)

- **B-tree indexes**: `users.email`, `courses.teacher_id`, composite indexes
- **Hash index**: `user_roles.user_id`
- **GIN index**: `comments.content` (full-text search)
- **Partial indexes**: Multiple indexes with WHERE clauses

## NoSQL Integration (MongoDB)

MongoDB is used for:

1. **User Activities**: High-volume activity logging
2. **Course Analytics**: Flexible analytics data
3. **Student Learning Paths**: Document-based learning progress

## Performance Comparison

Run performance comparison tests:

```bash
npm run build
node dist/scripts/performance-comparison.js
```
