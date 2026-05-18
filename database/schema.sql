-- Create Database Schema for BI Dashboard

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Datasets Table (Meta-information about uploaded spreadsheets/CSVs)
CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    file_size INT,
    row_count INT,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Datapoints Table (Core analytics metrics)
CREATE TABLE IF NOT EXISTS datapoints (
    id SERIAL PRIMARY KEY,
    dataset_id INT REFERENCES datasets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    segment VARCHAR(100) DEFAULT 'Enterprise', -- e.g. Enterprise, SMB, Consumer
    revenue DECIMAL(15, 2) NOT NULL,
    sales INT NOT NULL,
    signups INT NOT NULL,
    conversion_rate DECIMAL(5, 2) NOT NULL, -- e.g. 2.45
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. KPIs Table (Key Performance Indicators monitored by users)
CREATE TABLE IF NOT EXISTS kpis (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target DECIMAL(15, 2) NOT NULL,
    actual DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT '$', -- e.g. $, %, qty
    status VARCHAR(50) DEFAULT 'On Track', -- On Track, Warning, Critical
    threshold_warning DECIMAL(15, 2), -- Alert threshold (e.g. below 90% of target)
    threshold_critical DECIMAL(15, 2), -- Critical threshold (e.g. below 75% of target)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast search and aggregation
CREATE INDEX IF NOT EXISTS idx_datapoints_date ON datapoints(date);
CREATE INDEX IF NOT EXISTS idx_datapoints_category ON datapoints(category);
CREATE INDEX IF NOT EXISTS idx_kpis_status ON kpis(status);
