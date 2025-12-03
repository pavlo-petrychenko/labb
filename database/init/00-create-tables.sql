-- Create tables for Educational Platform
-- This script creates all tables before stored procedures, triggers, and views

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  deleted_at TIMESTAMP,
  updated_at TIMESTAMP,
  updated_by INT REFERENCES users(id)
);

-- Table: roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Table: user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT REFERENCES users(id),
  role_id INT REFERENCES roles(id),
  granted_at TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- Table: courses
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id INT REFERENCES users(id),
  deleted_at TIMESTAMP,
  updated_at TIMESTAMP,
  updated_by INT REFERENCES users(id)
);

-- Table: modules
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id),
  title VARCHAR(255),
  order_index INT,
  deleted_at TIMESTAMP,
  updated_at TIMESTAMP,
  updated_by INT REFERENCES users(id)
);

-- Table: lessons
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  module_id INT REFERENCES modules(id),
  title VARCHAR(255),
  content TEXT,
  deleted_at TIMESTAMP,
  updated_at TIMESTAMP,
  updated_by INT REFERENCES users(id)
);

-- Table: assignments
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id),
  title VARCHAR(255),
  description TEXT,
  due_date TIMESTAMP,
  deleted_at TIMESTAMP,
  updated_at TIMESTAMP,
  updated_by INT REFERENCES users(id)
);

-- Table: submissions
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES assignments(id),
  student_id INT REFERENCES users(id),
  content TEXT,
  submitted_at TIMESTAMP
);

-- Table: grades
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  graded_by INT REFERENCES users(id),
  submission_id INT REFERENCES submissions(id),
  grade NUMERIC(5,2),
  graded_at TIMESTAMP
);

-- Table: enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id),
  course_id INT REFERENCES courses(id),
  enrolled_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active'
);

-- Table: course_materials
CREATE TABLE IF NOT EXISTS course_materials (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id),
  file_url TEXT,
  type VARCHAR(50),
  deleted_at TIMESTAMP,
  updated_at TIMESTAMP,
  updated_by INT REFERENCES users(id)
);

-- Table: attendance
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id),
  student_id INT REFERENCES users(id),
  status VARCHAR(10),
  recorded_at TIMESTAMP
);

-- Table: comments
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  entity_type VARCHAR(50),
  entity_id INT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  entity_name VARCHAR(50),
  entity_id INT,
  action VARCHAR(50),
  changed_by INT REFERENCES users(id),
  changed_at TIMESTAMP
);

