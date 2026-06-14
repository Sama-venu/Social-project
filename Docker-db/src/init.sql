-- Create database
CREATE DATABASE IF NOT EXISTS instagram_clone;
USE instagram_clone;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Insert sample data
INSERT INTO users (username, email, password, fullname) VALUES 
('demo_user', 'demo@example.com', '$2a$10$YOUR_HASHED_PASSWORD', 'Demo User')
ON DUPLICATE KEY UPDATE id=id;

-- Note: For demo_user, you'll need to create a proper bcrypt hash for 'password123'
-- Or just register through the app directly
