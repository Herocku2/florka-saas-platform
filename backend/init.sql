-- Initialize Florka SaaS Platform Database
-- This file is executed when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS florka_db;

-- Create user if it doesn't exist (handled by POSTGRES_USER env var)
-- CREATE USER IF NOT EXISTS florka_user WITH PASSWORD 'florka_password';

-- Grant privileges (handled automatically by PostgreSQL container)
-- GRANT ALL PRIVILEGES ON DATABASE florka_db TO florka_user;

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto extension for additional cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for better performance (these will be created by Prisma migrations)
-- But we can add some additional ones if needed

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Florka SaaS Platform database initialized successfully!';
END $$;