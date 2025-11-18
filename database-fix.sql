-- Milestone 2 Database Fix - Final Initialisation Script (Cleaned for Execution)
USE cameroon_music_db;

-- 1. Create the Core 'users' Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(191) NOT NULL,
    role ENUM('USER', 'ARTIST', 'ADMIN') NOT NULL DEFAULT 'USER',
    isEmailVerified BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create 'refresh_tokens' Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    userId VARCHAR(191) NOT NULL,
    expiresAt DATETIME(3) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX userId_idx (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create 'artist_profiles' Table
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

-- 4. Verification
SELECT 'Setup script completed successfully!' as status;
SHOW TABLES;
DESCRIBE users;
DESCRIBE refresh_tokens;
DESCRIBE artist_profiles;