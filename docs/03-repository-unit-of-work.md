## Repository Pattern

### Base Repository

The `BaseRepository<T>` class provides common CRUD operations:

```typescript
class BaseRepository<T> {
  findById(id: number): Promise<T | null>
  findAll(options?: FindManyOptions<T>): Promise<T[]>
  create(entity: DeepPartial<T>): Promise<T>
  update(id: number, entity: Partial<T>): Promise<T | null>
  delete(id: number): Promise<boolean>
  softDelete(id: number, deletedBy: number): Promise<boolean>
  findBy(where: FindOptionsWhere<T>): Promise<T[]>
  findOneBy(where: FindOptionsWhere<T>): Promise<T | null>
}
```

### Specialized Repositories

#### UserRepository
- `findByEmail(email: string)`: Find user by email
- `getUserWithRoles(userId: number)`: Uses stored procedure `get_user_with_roles`
- `softDeleteUser(userId: number, deletedBy: number)`: Uses stored procedure `soft_delete_user`

#### CourseRepository
- `getCourseDetails(courseId: number)`: Uses view `v_course_details`
- `getCourseStatistics(courseId: number)`: Uses stored procedure `get_course_statistics`
- `getTeacherCourses(teacherId: number)`: Uses stored procedure `get_teacher_courses`
- `softDeleteCourse(courseId: number, deletedBy: number)`: Uses stored procedure `soft_delete_course`

#### EnrollmentRepository
- `enrollStudent(studentId: number, courseId: number)`: Uses stored procedure `enroll_student_in_course`
- `getStudentEnrollments(studentId: number)`: Uses view `v_student_enrollments`

#### SubmissionRepository
- `submitAssignment(assignmentId: number, studentId: number, content: string)`: Uses stored procedure `submit_assignment`
- `getAssignmentSubmissions(assignmentId: number)`: Uses view `v_assignment_submissions`

#### GradeRepository
- `gradeSubmission(submissionId: number, graderId: number, grade: number)`: Uses stored procedure `grade_submission`

## Unit of Work Pattern

The `UnitOfWork` class manages transactions and coordinates multiple repositories:

```typescript
class UnitOfWork {
  get users(): UserRepository
  get courses(): CourseRepository
  get enrollments(): EnrollmentRepository
  get submissions(): SubmissionRepository
  get grades(): GradeRepository
  
  async beginTransaction(): Promise<void>
  async commit(): Promise<void>
  async rollback(): Promise<void>
  async release(): Promise<void>
}
```

## Data Flow

1. Controller receives request
2. Controller uses UnitOfWork
3. UnitOfWork coordinates multiple repositories
4. Repositories use stored procedures/views
5. All operations in single transaction
6. Commit or rollback based on success/failure

