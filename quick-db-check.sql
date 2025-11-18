-- Quick Database Verification Script
USE cameroon_music_db;

-- 1. Show all tables
SHOW TABLES;

-- 2. Check admin user exists
SELECT id, name, email, role, isEmailVerified, createdAt
FROM users
WHERE role = 'ADMIN';

-- 3. Check artist_profiles table structure
DESCRIBE artist_profiles;

-- 4. Check verifications table exists
DESCRIBE verifications;

-- 5. Count users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- 6. Check if any verifications exist
SELECT COUNT(*) as verification_count, status, COUNT(*) as count_by_status
FROM verifications
GROUP BY status;
