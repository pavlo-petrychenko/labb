# Performance Comparison: PostgreSQL vs MongoDB

This document presents the performance comparison results between PostgreSQL and MongoDB for various database operations in the Educational Platform.

## Performance Test Results

The following performance summary shows the results of running various database operations on both PostgreSQL and MongoDB with a dataset of 10,000+ records.

![Performance Summary](./perfomance-screen.png)

## Summary Statistics

Based on the performance tests:

- **PostgreSQL Average**: 9.33ms
- **MongoDB Average**: 3.60ms
- **Performance Difference**: MongoDB is 61.43% faster on average

## Test Operations

### 1. Get User with Roles
- **PostgreSQL (Stored Procedure)**: 2ms
- **PostgreSQL (View)**: 1ms
- **MongoDB (Aggregation)**: 9ms

### 2. Get Course Statistics
- **PostgreSQL (Stored Procedure)**: 46ms
- **MongoDB (Aggregation)**: 1ms

### 3. Get Student Enrollments
- **PostgreSQL (View)**: 2ms
- **MongoDB (Aggregation)**: 5ms

### 4. Get Assignment Submissions
- **PostgreSQL (View)**: 2ms
- **MongoDB (Aggregation)**: 2ms

### 5. Bulk Insert (100 records)
- **PostgreSQL**: 3ms
- **MongoDB**: 1ms

## Observations

1. **MongoDB excels** at aggregation queries and bulk operations
2. **PostgreSQL views** provide excellent performance for read operations
3. **Stored procedures** in PostgreSQL can be slower for complex aggregations compared to MongoDB
4. **Bulk inserts** are faster in MongoDB for this workload

## Running Performance Tests

To run the performance comparison tests:

```bash
npm run build
node dist/scripts/performance-comparison.js
```

The script will:
1. Clear existing test data
2. Populate databases with 10,000+ records
3. Run performance tests on various operations
4. Display a summary table with results

## Test Data

The performance tests use:
- 10,000 users (50 teachers, 50 admins, 9,900 students)
- 100 courses
- 300-500 modules
- 600-1,200 lessons
- 600-2,400 assignments
- 20,000-40,000 enrollments
- 10,000+ submissions
- 7,000+ grades
