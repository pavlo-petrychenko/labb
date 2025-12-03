import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { connectMongoDB, getMongoDB } from '../config/mongodb';

interface PerformanceResult {
  operation: string;
  database: 'PostgreSQL' | 'MongoDB';
  duration: number;
  recordCount: number;
}

class PerformanceComparison {
  private results: PerformanceResult[] = [];
  private testUserIds: number[] = [];
  private testCourseIds: number[] = [];
  private testAssignmentIds: number[] = [];

  async initialize() {
    await AppDataSource.initialize();
    await connectMongoDB();
  }

  async cleanup() {
    await AppDataSource.destroy();
  }

  // Populate databases with test data (10k+ records)
  async populateTestData(): Promise<{ userIds: number[]; courseIds: number[]; assignmentIds: number[] }> {
    console.log('\n=== Populating Test Data (10,000+ records) ===');
    const startTime = Date.now();
    
    // Clear existing test data
    await this.clearTestData();

    // PostgreSQL: Insert roles
    await AppDataSource.query(`
      INSERT INTO roles (name) VALUES 
      ('student'), ('teacher'), ('admin')
      ON CONFLICT (name) DO NOTHING
    `);

    const roles = await AppDataSource.query('SELECT id, name FROM roles');
    const studentRole = roles.find((r: any) => r.name === 'student');
    const teacherRole = roles.find((r: any) => r.name === 'teacher');
    const adminRole = roles.find((r: any) => r.name === 'admin');

    // PostgreSQL: Insert 10,000 users in batches
    console.log('Creating 10,000 users...');
    const totalUsers = 10000;
    const batchSize = 500;
    const userRoles: { userId: number; roleId: number }[] = [];
    const allUserIds: number[] = [];
    const studentUserIds: number[] = [];
    const teacherUserIds: number[] = [];
    const adminUserIds: number[] = [];

    for (let batch = 0; batch < totalUsers / batchSize; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, totalUsers);
      const values: string[] = [];
      
      for (let i = batchStart; i < batchEnd; i++) {
        const userType = i < 50 ? 'teacher' : i < 100 ? 'admin' : 'student';
        values.push(`('user${i}@example.com', 'hash${i}', 'User ${i}')`);
      }
      
      const usersResult = await AppDataSource.query(`
        INSERT INTO users (email, password_hash, full_name) VALUES ${values.join(',')}
        RETURNING id, email
      `);
      
      for (const user of usersResult) {
        allUserIds.push(user.id);
        const userIndex = parseInt(user.email.match(/\d+/)?.[0] || '0');
        
        if (userIndex < 50) {
          teacherUserIds.push(user.id);
          userRoles.push({ userId: user.id, roleId: teacherRole.id });
        } else if (userIndex < 100) {
          adminUserIds.push(user.id);
          userRoles.push({ userId: user.id, roleId: adminRole.id });
        } else {
          studentUserIds.push(user.id);
          userRoles.push({ userId: user.id, roleId: studentRole.id });
        }
      }
      
      if ((batch + 1) % 5 === 0) {
        console.log(`  Created ${(batch + 1) * batchSize} users...`);
      }
    }

    this.testUserIds = allUserIds;

    // PostgreSQL: Batch insert user roles
    console.log('Assigning roles to users...');
    for (let i = 0; i < userRoles.length; i += batchSize) {
      const batch = userRoles.slice(i, i + batchSize);
      const values = batch.map(ur => `(${ur.userId}, ${ur.roleId}, NOW())`).join(',');
      await AppDataSource.query(`
        INSERT INTO user_roles (user_id, role_id, granted_at) VALUES ${values}
      `);
    }

    // PostgreSQL: Create 100 courses
    console.log('Creating 100 courses...');
    const totalCourses = 100;
    const courseValues: string[] = [];
    for (let i = 0; i < totalCourses; i++) {
      const teacherId = teacherUserIds[i % teacherUserIds.length];
      courseValues.push(`('Course ${i + 1}', 'Description for course ${i + 1}', ${teacherId})`);
    }
    
    const coursesResult = await AppDataSource.query(`
      INSERT INTO courses (title, description, teacher_id) VALUES ${courseValues.join(',')}
      RETURNING id, title, teacher_id
    `);
    this.testCourseIds = coursesResult.map((c: any) => c.id);

    // PostgreSQL: Create modules for each course (3-5 modules per course)
    console.log('Creating modules and lessons...');
    const allModules: any[] = [];
    const allLessons: any[] = [];
    const allAssignments: any[] = [];

    for (const course of coursesResult) {
      const moduleCount = 3 + Math.floor(Math.random() * 3); // 3-5 modules
      const moduleValues: string[] = [];
      
      for (let m = 0; m < moduleCount; m++) {
        moduleValues.push(`(${course.id}, 'Module ${m + 1}', ${m + 1})`);
      }
      
      const modulesResult = await AppDataSource.query(`
        INSERT INTO modules (course_id, title, order_index) VALUES ${moduleValues.join(',')}
        RETURNING id, course_id
      `);
      allModules.push(...modulesResult);

      // Create lessons for each module (2-4 lessons per module)
      for (const module of modulesResult) {
        const lessonCount = 2 + Math.floor(Math.random() * 3); // 2-4 lessons
        const lessonValues: string[] = [];
        
        for (let l = 0; l < lessonCount; l++) {
          lessonValues.push(`(${module.id}, 'Lesson ${l + 1}', 'Content for lesson ${l + 1}')`);
        }
        
        const lessonsResult = await AppDataSource.query(`
          INSERT INTO lessons (module_id, title, content) VALUES ${lessonValues.join(',')}
          RETURNING id, module_id
        `);
        allLessons.push(...lessonsResult);

        // Create assignments for each lesson (1-2 assignments per lesson)
        for (const lesson of lessonsResult) {
          const assignmentCount = 1 + Math.floor(Math.random() * 2); // 1-2 assignments
          const assignmentValues: string[] = [];
          
          for (let a = 0; a < assignmentCount; a++) {
            const daysOffset = 7 + Math.floor(Math.random() * 21);
            assignmentValues.push(`(${lesson.id}, 'Assignment ${a + 1}', 'Description', NOW() + INTERVAL '${daysOffset} days')`);
          }
          
          const assignmentsResult = await AppDataSource.query(`
            INSERT INTO assignments (lesson_id, title, description, due_date) VALUES ${assignmentValues.join(',')}
            RETURNING id, lesson_id
          `);
          allAssignments.push(...assignmentsResult);
        }
      }
    }

    this.testAssignmentIds = allAssignments.map((a: any) => a.id);
    console.log(`  Created ${allModules.length} modules, ${allLessons.length} lessons, ${allAssignments.length} assignments`);

    // PostgreSQL: Create enrollments (each student enrolled in 2-5 random courses)
    console.log('Creating enrollments...');
    const enrollmentValues: string[] = [];
    for (const studentId of studentUserIds) {
      const enrollmentCount = 2 + Math.floor(Math.random() * 4); // 2-5 courses
      const enrolledCourses = new Set<number>();
      
      while (enrolledCourses.size < enrollmentCount) {
        const randomCourse = coursesResult[Math.floor(Math.random() * coursesResult.length)];
        enrolledCourses.add(randomCourse.id);
      }
      
      for (const courseId of enrolledCourses) {
        enrollmentValues.push(`(${studentId}, ${courseId}, NOW(), 'active')`);
      }
    }

    // Insert enrollments in batches
    for (let i = 0; i < enrollmentValues.length; i += batchSize) {
      const batch = enrollmentValues.slice(i, i + batchSize);
      await AppDataSource.query(`
        INSERT INTO enrollments (student_id, course_id, enrolled_at, status) VALUES ${batch.join(',')}
      `);
    }
    console.log(`  Created ${enrollmentValues.length} enrollments`);

    // PostgreSQL: Create submissions (30-50% of assignments have submissions)
    console.log('Creating submissions...');
    const submissionValues: string[] = [];
    const submissionData: any[] = [];
    
    for (const assignment of allAssignments) {
      // Get students enrolled in courses that contain this assignment
      const lesson = allLessons.find(l => l.id === assignment.lesson_id);
      const module = allModules.find(m => m.id === lesson?.module_id);
      const course = coursesResult.find((c: any) => c.id === module?.course_id);
      
      if (course && Math.random() < 0.4) { // 40% chance of submission
        // Get random students enrolled in this course
        const enrolledStudents = studentUserIds.filter((_, idx) => {
          // Simulate: check if student is enrolled (simplified)
          return Math.random() < 0.3; // 30% of students submit
        }).slice(0, Math.floor(Math.random() * 5) + 1); // 1-5 submissions per assignment
        
        for (const studentId of enrolledStudents) {
          submissionValues.push(`(${assignment.id}, ${studentId}, 'Submission content for assignment ${assignment.id}', NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')`);
          submissionData.push({ assignmentId: assignment.id, studentId });
        }
      }
    }

    // Insert submissions in batches
    let submissionsResult: any[] = [];
    for (let i = 0; i < submissionValues.length; i += batchSize) {
      const batch = submissionValues.slice(i, i + batchSize);
      const result = await AppDataSource.query(`
        INSERT INTO submissions (assignment_id, student_id, content, submitted_at) VALUES ${batch.join(',')}
        RETURNING id, assignment_id, student_id
      `);
      submissionsResult.push(...result);
    }
    console.log(`  Created ${submissionsResult.length} submissions`);

    // PostgreSQL: Create grades for 70% of submissions
    console.log('Creating grades...');
    const gradeValues: string[] = [];
    const gradeData: Array<{ submissionId: number; grade: number; gradedBy: number }> = [];
    const gradedSubmissions = submissionsResult.filter(() => Math.random() < 0.7);
    
    for (const submission of gradedSubmissions) {
      const teacherId = teacherUserIds[Math.floor(Math.random() * teacherUserIds.length)];
      const gradeInt = 60 + Math.floor(Math.random() * 40); // Grade between 60-100
      const gradeDecimal = Math.floor(Math.random() * 10);
      const grade = parseFloat(`${gradeInt}.${gradeDecimal}`);
      gradeValues.push(`(${submission.id}, ${teacherId}, ${grade}, NOW() - INTERVAL '${Math.floor(Math.random() * 10)} days')`);
      gradeData.push({ submissionId: submission.id, grade, gradedBy: teacherId });
    }

    // Insert grades in batches
    for (let i = 0; i < gradeValues.length; i += batchSize) {
      const batch = gradeValues.slice(i, i + batchSize);
      await AppDataSource.query(`
        INSERT INTO grades (submission_id, graded_by, grade, graded_at) VALUES ${batch.join(',')}
      `);
    }
    console.log(`  Created ${gradeValues.length} grades`);

    // MongoDB: Populate users collection
    console.log('Populating MongoDB...');
    const db = getMongoDB();
    const mongoUsers = [];
    for (let i = 0; i < allUserIds.length; i++) {
      mongoUsers.push({
        userId: allUserIds[i],
        email: `user${i}@example.com`,
        fullName: `User ${i}`,
        createdAt: new Date(),
      });
    }

    // Insert MongoDB users in batches
    for (let i = 0; i < mongoUsers.length; i += batchSize) {
      await db.collection('users').insertMany(mongoUsers.slice(i, i + batchSize));
    }

    // MongoDB: Populate user_roles collection
    const mongoUserRoles = userRoles.map(ur => ({
      userId: ur.userId,
      roleName: ur.roleId === studentRole.id ? 'student' : ur.roleId === teacherRole.id ? 'teacher' : 'admin',
      grantedAt: new Date(),
    }));
    for (let i = 0; i < mongoUserRoles.length; i += batchSize) {
      await db.collection('user_roles').insertMany(mongoUserRoles.slice(i, i + batchSize));
    }

    // MongoDB: Populate courses collection
    const mongoCourses = coursesResult.map((c: any) => ({
      courseId: c.id,
      title: c.title,
      createdAt: new Date(),
    }));
    await db.collection('courses').insertMany(mongoCourses);

    // MongoDB: Populate course_analytics collection
    const mongoAnalytics = coursesResult.map((c: any) => {
      const enrolledCount = enrollmentValues.filter(e => e.includes(`(${c.id},`)).length;
      const courseAssignments = allAssignments.filter(a => {
        const lesson = allLessons.find(l => l.id === a.lesson_id);
        const module = allModules.find(m => m.id === lesson?.module_id);
        return module?.course_id === c.id;
      });
      const courseSubmissions = submissionsResult.filter(s => 
        courseAssignments.some(a => a.id === s.assignment_id)
      );
      
      return {
        courseId: c.id,
        date: new Date(),
        studentCount: enrolledCount,
        assignmentCount: courseAssignments.length,
        submissionCount: courseSubmissions.length,
        averageGrade: 75 + Math.random() * 20,
        views: Math.floor(Math.random() * 1000) + 100,
        interactions: Math.floor(Math.random() * 2000) + 200,
        completionRate: 0.5 + Math.random() * 0.4,
        metadata: { source: 'test' },
      };
    });
    await db.collection('course_analytics').insertMany(mongoAnalytics);

    // MongoDB: Populate student_learning_paths collection
    const mongoLearningPaths = [];
    for (const studentId of studentUserIds.slice(0, 5000)) { // Limit to 5000 for performance
      const enrolledCourses = coursesResult.filter((_: any, idx: number) => Math.random() < 0.3).slice(0, 5);
      for (const course of enrolledCourses) {
        const courseModules = allModules.filter(m => m.course_id === course.id);
        const learningPath = courseModules.slice(0, 3).map(module => {
          const moduleLessons = allLessons.filter(l => l.module_id === module.id);
          return {
            moduleId: module.id,
            lessonId: moduleLessons[0]?.id || null,
            completed: Math.random() < 0.6,
            timeSpent: Math.floor(Math.random() * 7200) + 600,
            lastAccessed: new Date(),
          };
        });
        
        mongoLearningPaths.push({
          studentId,
          courseId: course.id,
          enrollmentId: course.id * 1000 + studentId,
          enrolledAt: new Date(),
          status: 'active',
          learningPath,
          preferences: { theme: 'light', notifications: true },
        });
      }
    }
    
    for (let i = 0; i < mongoLearningPaths.length; i += batchSize) {
      await db.collection('student_learning_paths').insertMany(mongoLearningPaths.slice(i, i + batchSize));
    }

    // MongoDB: Populate submissions collection
    const mongoSubmissions = submissionsResult.map((s: any) => ({
      submissionId: s.id,
      assignmentId: s.assignment_id,
      studentId: s.student_id,
      content: `Submission content for assignment ${s.assignment_id}`,
      submittedAt: new Date(),
    }));
    for (let i = 0; i < mongoSubmissions.length; i += batchSize) {
      await db.collection('submissions').insertMany(mongoSubmissions.slice(i, i + batchSize));
    }

    // MongoDB: Populate grades collection
    const mongoGrades = gradeData.map((gd) => ({
      submissionId: gd.submissionId,
      grade: gd.grade,
      gradedBy: gd.gradedBy,
      gradedAt: new Date(),
    }));
    for (let i = 0; i < mongoGrades.length; i += batchSize) {
      await db.collection('grades').insertMany(mongoGrades.slice(i, i + batchSize));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✓ Created ${allUserIds.length} users`);
    console.log(`✓ Created ${coursesResult.length} courses`);
    console.log(`✓ Created ${allModules.length} modules`);
    console.log(`✓ Created ${allLessons.length} lessons`);
    console.log(`✓ Created ${allAssignments.length} assignments`);
    console.log(`✓ Created ${enrollmentValues.length} enrollments`);
    console.log(`✓ Created ${submissionsResult.length} submissions`);
    console.log(`✓ Created ${gradeValues.length} grades`);
    console.log(`✓ Populated MongoDB collections`);
    console.log(`\nTotal time: ${duration}s`);

    return {
      userIds: this.testUserIds,
      courseIds: this.testCourseIds,
      assignmentIds: this.testAssignmentIds,
    };
  }

  // Clear test data (optional - for clean runs)
  async clearTestData(): Promise<void> {
    console.log('Clearing existing test data...');
    const db = getMongoDB();
    
    // Clear MongoDB collections
    await db.collection('users').deleteMany({});
    await db.collection('user_roles').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('course_analytics').deleteMany({});
    await db.collection('student_learning_paths').deleteMany({});
    await db.collection('submissions').deleteMany({});
    await db.collection('grades').deleteMany({});

    // Clear PostgreSQL test data (be careful not to delete all data)
    // Delete in correct order to respect foreign key constraints
    // First, get test user IDs to use in subsequent deletes
    const testUserIds = await AppDataSource.query(`
      SELECT id FROM users WHERE email LIKE '%@example.com'
    `);
    const userIdList = testUserIds.length > 0 
      ? testUserIds.map((u: any) => u.id).join(',')
      : null;

    if (userIdList) {
      await AppDataSource.query(`
        -- Delete notifications for test users
        DELETE FROM notifications WHERE user_id IN (${userIdList});
        
        -- Delete comments for test users
        DELETE FROM comments WHERE user_id IN (${userIdList});
        
        -- Delete audit logs for test users
        DELETE FROM audit_logs WHERE changed_by IN (${userIdList});
        
        -- Delete attendance records for test users
        DELETE FROM attendance WHERE student_id IN (${userIdList});
        
        -- Delete grades (already handled by submission deletion, but be safe)
        DELETE FROM grades WHERE graded_by IN (${userIdList})
          OR submission_id IN (
            SELECT id FROM submissions WHERE student_id IN (${userIdList})
          );
        
        -- Delete submissions for test users
        DELETE FROM submissions WHERE student_id IN (${userIdList})
          OR content LIKE 'Submission content%';
        
        -- Delete enrollments for test users
        DELETE FROM enrollments WHERE student_id IN (${userIdList})
          OR enrolled_at > NOW() - INTERVAL '24 hours';
        
        -- Delete assignments (will cascade or handle updated_by)
        DELETE FROM assignments WHERE title LIKE 'Assignment%'
          OR updated_by IN (${userIdList});
        
        -- Delete lessons
        DELETE FROM lessons WHERE title LIKE 'Lesson%'
          OR updated_by IN (${userIdList});
        
        -- Delete course materials
        DELETE FROM course_materials WHERE updated_by IN (${userIdList});
        
        -- Delete modules
        DELETE FROM modules WHERE title LIKE 'Module%'
          OR updated_by IN (${userIdList});
        
        -- Delete courses (handle both teacher_id and updated_by)
        DELETE FROM courses WHERE title LIKE 'Course%' 
          OR title IN ('Introduction to Programming', 'Advanced Algorithms')
          OR teacher_id IN (${userIdList})
          OR updated_by IN (${userIdList});
        
        -- Delete user roles for test users
        DELETE FROM user_roles WHERE user_id IN (${userIdList});
        
        -- Finally, delete test users
        DELETE FROM users WHERE email LIKE '%@example.com';
      `);
    } else {
      // Fallback: delete by patterns if no users found
      await AppDataSource.query(`
        DELETE FROM notifications WHERE user_id IN (
          SELECT id FROM users WHERE email LIKE '%@example.com'
        );
        DELETE FROM comments WHERE user_id IN (
          SELECT id FROM users WHERE email LIKE '%@example.com'
        );
        DELETE FROM audit_logs WHERE changed_by IN (
          SELECT id FROM users WHERE email LIKE '%@example.com'
        );
        DELETE FROM attendance WHERE student_id IN (
          SELECT id FROM users WHERE email LIKE '%@example.com'
        );
        DELETE FROM grades WHERE submission_id IN (
          SELECT id FROM submissions WHERE content LIKE 'Submission content%'
        );
        DELETE FROM submissions WHERE content LIKE 'Submission content%';
        DELETE FROM enrollments WHERE enrolled_at > NOW() - INTERVAL '24 hours';
        DELETE FROM assignments WHERE title LIKE 'Assignment%';
        DELETE FROM lessons WHERE title LIKE 'Lesson%';
        DELETE FROM modules WHERE title LIKE 'Module%';
        DELETE FROM courses WHERE title LIKE 'Course%' 
          OR title IN ('Introduction to Programming', 'Advanced Algorithms');
        DELETE FROM user_roles WHERE user_id IN (
          SELECT id FROM users WHERE email LIKE '%@example.com'
        );
        DELETE FROM users WHERE email LIKE '%@example.com';
      `);
    }
    console.log('✓ Test data cleared');
  }

  // Test 1: User with roles query
  async testUserWithRoles(userId: number): Promise<void> {
    console.log('\n=== Test 1: Get User with Roles ===');

    // PostgreSQL - Using stored procedure
    const pgStart = Date.now();
    const pgResult = await AppDataSource.query('SELECT * FROM get_user_with_roles($1)', [userId]);
    const pgDuration = Date.now() - pgStart;
    this.results.push({
      operation: 'Get User with Roles',
      database: 'PostgreSQL',
      duration: pgDuration,
      recordCount: pgResult.length,
    });
    console.log(`PostgreSQL (Stored Procedure): ${pgDuration}ms`);

    // PostgreSQL - Using view
    const pgViewStart = Date.now();
    const pgViewResult = await AppDataSource.query(
      'SELECT * FROM v_active_users_with_roles WHERE id = $1',
      [userId]
    );
    const pgViewDuration = Date.now() - pgViewStart;
    this.results.push({
      operation: 'Get User with Roles (View)',
      database: 'PostgreSQL',
      duration: pgViewDuration,
      recordCount: pgViewResult.length,
    });
    console.log(`PostgreSQL (View): ${pgViewDuration}ms`);

    // MongoDB - Simulating same data structure
    const mongoStart = Date.now();
    const db = getMongoDB();
    const mongoResult = await db.collection('users').aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'user_roles',
          localField: 'userId',
          foreignField: 'userId',
          as: 'roles',
        },
      },
      {
        $project: {
          id: '$userId',
          email: 1,
          fullName: 1,
          roles: '$roles.roleName',
        },
      },
    ]).toArray();
    const mongoDuration = Date.now() - mongoStart;
    this.results.push({
      operation: 'Get User with Roles',
      database: 'MongoDB',
      duration: mongoDuration,
      recordCount: mongoResult.length,
    });
    console.log(`MongoDB (Aggregation): ${mongoDuration}ms`);
  }

  // Test 2: Course statistics
  async testCourseStatistics(courseId: number): Promise<void> {
    console.log('\n=== Test 2: Get Course Statistics ===');

    // PostgreSQL - Using stored procedure
    const pgStart = Date.now();
    const pgResult = await AppDataSource.query('SELECT * FROM get_course_statistics($1)', [courseId]);
    const pgDuration = Date.now() - pgStart;
    this.results.push({
      operation: 'Get Course Statistics',
      database: 'PostgreSQL',
      duration: pgDuration,
      recordCount: pgResult.length,
    });
    console.log(`PostgreSQL (Stored Procedure): ${pgDuration}ms`);

    // MongoDB - Using aggregation
    const mongoStart = Date.now();
    const db = getMongoDB();
    const mongoResult = await db.collection('course_analytics').aggregate([
      { $match: { courseId } },
      {
        $group: {
          _id: '$courseId',
          totalStudents: { $sum: '$studentCount' },
          totalAssignments: { $sum: '$assignmentCount' },
          totalSubmissions: { $sum: '$submissionCount' },
          averageGrade: { $avg: '$averageGrade' },
        },
      },
    ]).toArray();
    const mongoDuration = Date.now() - mongoStart;
    this.results.push({
      operation: 'Get Course Statistics',
      database: 'MongoDB',
      duration: mongoDuration,
      recordCount: mongoResult.length,
    });
    console.log(`MongoDB (Aggregation): ${mongoDuration}ms`);
  }

  // Test 3: Student enrollments with course info
  async testStudentEnrollments(studentId: number): Promise<void> {
    console.log('\n=== Test 3: Get Student Enrollments ===');

    // PostgreSQL - Using view
    const pgStart = Date.now();
    const pgResult = await AppDataSource.query(
      'SELECT * FROM v_student_enrollments WHERE student_id = $1',
      [studentId]
    );
    const pgDuration = Date.now() - pgStart;
    this.results.push({
      operation: 'Get Student Enrollments',
      database: 'PostgreSQL',
      duration: pgDuration,
      recordCount: pgResult.length,
    });
    console.log(`PostgreSQL (View): ${pgDuration}ms`);

    // MongoDB - Using aggregation
    const mongoStart = Date.now();
    const db = getMongoDB();
    const mongoResult = await db.collection('student_learning_paths').aggregate([
      { $match: { studentId } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: 'courseId',
          as: 'courseInfo',
        },
      },
      {
        $project: {
          enrollmentId: 1,
          studentId: 1,
          courseId: 1,
          courseTitle: { $arrayElemAt: ['$courseInfo.title', 0] },
          enrolledAt: 1,
          status: 1,
        },
      },
    ]).toArray();
    const mongoDuration = Date.now() - mongoStart;
    this.results.push({
      operation: 'Get Student Enrollments',
      database: 'MongoDB',
      duration: mongoDuration,
      recordCount: mongoResult.length,
    });
    console.log(`MongoDB (Aggregation): ${mongoDuration}ms`);
  }

  // Test 4: Assignment submissions with grades
  async testAssignmentSubmissions(assignmentId: number): Promise<void> {
    console.log('\n=== Test 4: Get Assignment Submissions ===');

    // PostgreSQL - Using view
    const pgStart = Date.now();
    const pgResult = await AppDataSource.query(
      'SELECT * FROM v_assignment_submissions WHERE assignment_id = $1',
      [assignmentId]
    );
    const pgDuration = Date.now() - pgStart;
    this.results.push({
      operation: 'Get Assignment Submissions',
      database: 'PostgreSQL',
      duration: pgDuration,
      recordCount: pgResult.length,
    });
    console.log(`PostgreSQL (View): ${pgDuration}ms`);

    // MongoDB - Using aggregation
    const mongoStart = Date.now();
    const db = getMongoDB();
    const mongoResult = await db.collection('submissions').aggregate([
      { $match: { assignmentId } },
      {
        $lookup: {
          from: 'grades',
          localField: 'submissionId',
          foreignField: 'submissionId',
          as: 'grades',
        },
      },
      {
        $project: {
          assignmentId: 1,
          submissionId: 1,
          studentId: 1,
          submittedAt: 1,
          grade: { $arrayElemAt: ['$grades.grade', 0] },
          gradedAt: { $arrayElemAt: ['$grades.gradedAt', 0] },
        },
      },
    ]).toArray();
    const mongoDuration = Date.now() - mongoStart;
    this.results.push({
      operation: 'Get Assignment Submissions',
      database: 'MongoDB',
      duration: mongoDuration,
      recordCount: mongoResult.length,
    });
    console.log(`MongoDB (Aggregation): ${mongoDuration}ms`);
  }

  // Test 5: Bulk insert performance
  async testBulkInsert(count: number = 100): Promise<void> {
    console.log(`\n=== Test 5: Bulk Insert (${count} records) ===`);

    // PostgreSQL - Batch insert
    const pgStart = Date.now();
    const pgValues = Array.from({ length: count }, (_, i) => 
      `('test${i}@example.com', 'hash${i}', 'Test User ${i}')`
    ).join(',');
    await AppDataSource.query(
      `INSERT INTO users (email, password_hash, full_name) VALUES ${pgValues}`
    );
    const pgDuration = Date.now() - pgStart;
    this.results.push({
      operation: `Bulk Insert (${count} records)`,
      database: 'PostgreSQL',
      duration: pgDuration,
      recordCount: count,
    });
    console.log(`PostgreSQL: ${pgDuration}ms`);

    // MongoDB - Bulk insert
    const mongoStart = Date.now();
    const db = getMongoDB();
    const mongoDocs = Array.from({ length: count }, (_, i) => ({
      userId: 1000 + i,
      email: `test${i}@example.com`,
      fullName: `Test User ${i}`,
      createdAt: new Date(),
    }));
    await db.collection('users').insertMany(mongoDocs);
    const mongoDuration = Date.now() - mongoStart;
    this.results.push({
      operation: `Bulk Insert (${count} records)`,
      database: 'MongoDB',
      duration: mongoDuration,
      recordCount: count,
    });
    console.log(`MongoDB: ${mongoDuration}ms`);
  }

  printSummary(): void {
    console.log('\n=== Performance Summary ===');
    console.table(this.results);

    // Calculate averages
    const pgResults = this.results.filter(r => r.database === 'PostgreSQL');
    const mongoResults = this.results.filter(r => r.database === 'MongoDB');

    const pgAvg = pgResults.reduce((sum, r) => sum + r.duration, 0) / pgResults.length;
    const mongoAvg = mongoResults.reduce((sum, r) => sum + r.duration, 0) / mongoResults.length;

    console.log(`\nPostgreSQL Average: ${pgAvg.toFixed(2)}ms`);
    console.log(`MongoDB Average: ${mongoAvg.toFixed(2)}ms`);
    console.log(`Difference: ${((mongoAvg - pgAvg) / pgAvg * 100).toFixed(2)}%`);
  }
}

// Run performance tests
async function runPerformanceTests() {
  const comparison = new PerformanceComparison();

  try {
    await comparison.initialize();

    // Populate databases with test data
    const testData = await comparison.populateTestData();

    // Run tests with generated test IDs
    if (testData.userIds.length > 0 && testData.courseIds.length > 0 && testData.assignmentIds.length > 0) {
      await comparison.testUserWithRoles(testData.userIds[0]);
      await comparison.testCourseStatistics(testData.courseIds[0]);
      await comparison.testStudentEnrollments(testData.userIds[1]); // Use a student ID
      await comparison.testAssignmentSubmissions(testData.assignmentIds[0]);
      await comparison.testBulkInsert(100);

      comparison.printSummary();
    } else {
      console.error('Failed to populate test data. Cannot run performance tests.');
    }
  } catch (error) {
    console.error('Error running performance tests:', error);
  } finally {
    await comparison.cleanup();
  }
}

if (require.main === module) {
  runPerformanceTests();
}

export { PerformanceComparison };

