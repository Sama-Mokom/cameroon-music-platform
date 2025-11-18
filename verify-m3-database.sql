-- Milestone 3 Database Verification Script
-- Run this in XAMPP phpMyAdmin to verify all tables and data

USE cameroon_music_db;

-- Show all tables
SHOW TABLES;

-- Verify artist_profiles table structure
DESCRIBE artist_profiles;

-- Verify verifications table exists
DESCRIBE verifications;

-- Verify admin user exists
SELECT id, name, email, role, isEmailVerified, createdAt
FROM users
WHERE role = 'ADMIN';

-- Count users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Check if artist_profiles has new columns
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cameroon_music_db'
  AND TABLE_NAME = 'artist_profiles'
ORDER BY ORDINAL_POSITION;

-- Check verifications table structure
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cameroon_music_db'
  AND TABLE_NAME = 'verifications'
ORDER BY ORDINAL_POSITION;
