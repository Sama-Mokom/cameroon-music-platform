-- Milestone 2 Database Fix
-- Run this SQL in your XAMPP phpMyAdmin or MySQL command line

USE cameroon_music_db;

-- Add missing columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(191) NOT NULL AFTER id,
ADD COLUMN IF NOT EXISTS isEmailVerified BOOLEAN NOT NULL DEFAULT FALSE AFTER role;

-- Create refresh_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    userId VARCHAR(191) NOT NULL,
    expiresAt DATETIME(3) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX userId_idx (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create artist_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS artist_profiles (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    userId VARCHAR(191) NOT NULL UNIQUE,
    stageName VARCHAR(191),
    bio TEXT,
    genre VARCHAR(191),
    phoneNumber VARCHAR(191),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables
SELECT 'Tables created successfully!' as status;
SHOW TABLES;
