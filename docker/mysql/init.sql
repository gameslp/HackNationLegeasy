-- Create shadow database for Prisma migrations
CREATE DATABASE IF NOT EXISTS shadow_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON shadow_db.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON legeasy.* TO 'appuser'@'%';

FLUSH PRIVILEGES;
