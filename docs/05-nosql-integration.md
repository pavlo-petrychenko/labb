MongoDB is used for:
1. **User Activity Logs**: High-volume, time-series data
2. **Course Analytics**: Flexible schema for analytics data
3. **Student Learning Paths**: Document-based learning progress tracking

These use cases benefit from MongoDB's:
- Flexible schema
- High write performance
- Document-based storage
- Easy horizontal scaling

## MongoDB Collections

### 1. `user_activities`

Stores user activity logs with flexible metadata:

```typescript
interface UserActivity {
  userId: number;
  activityType: string; // 'USER_CREATED', 'LOGIN', 'COURSE_VIEWED', etc.
  timestamp: Date;
  metadata: Record<string, any>; // Flexible metadata
}
```

**Use Case**: High-volume activity logging that doesn't need relational integrity.

**Example Document**:
```json
{
  "userId": 1,
  "activityType": "COURSE_VIEWED",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "courseId": 5,
    "duration": 120,
    "device": "mobile"
  }
}
```

### 2. `course_analytics`

Stores course analytics with time-series data:

```typescript
interface CourseAnalytics {
  courseId: number;
  date: Date;
  views: number;
  interactions: number;
  completionRate: number;
  metadata: Record<string, any>;
}
```

**Use Case**: Analytics data that changes frequently and has flexible schema.

**Example Document**:
```json
{
  "courseId": 1,
  "date": "2024-01-15T00:00:00Z",
  "views": 150,
  "interactions": 45,
  "completionRate": 0.75,
  "metadata": {
    "popularModules": [1, 3, 5],
    "avgTimeSpent": 3600
  }
}
```

### 3. `student_learning_paths`

Stores student learning progress as documents:

```typescript
interface StudentLearningPath {
  studentId: number;
  courseId: number;
  learningPath: Array<{
    moduleId: number;
    lessonId: number;
    completed: boolean;
    timeSpent: number;
    lastAccessed: Date;
  }>;
  preferences: Record<string, any>;
}
```

**Use Case**: Complex nested data structure that's easier to store as a document.

**Example Document**:
```json
{
  "studentId": 1,
  "courseId": 2,
  "learningPath": [
    {
      "moduleId": 1,
      "lessonId": 1,
      "completed": true,
      "timeSpent": 1800,
      "lastAccessed": "2024-01-15T10:00:00Z"
    }
  ],
  "preferences": {
    "learningStyle": "visual",
    "difficulty": "intermediate"
  }
}
```
