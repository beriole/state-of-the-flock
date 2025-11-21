-- scripts/init-database.sql
CREATE DATABASE IF NOT EXISTS state_of_the_flock 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE state_of_the_flock;

-- Créer un utilisateur dédié (optionnel)
CREATE USER IF NOT EXISTS 'flock_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON state_of_the_flock.* TO 'flock_user'@'localhost';
FLUSH PRIVILEGES;