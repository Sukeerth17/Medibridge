-- MediBridge Database Initialization Script (init.sql)

-- -----------------------------------------------------------
-- 1. ENUM for Role-Based Access Control (RBAC)
-- -----------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Patient', 'Clinic', 'Scanning', 'Admin');
    END IF;
END $$;

-- -----------------------------------------------------------
-- 2. USERS Table (Authentication and RBAC)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_user_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., PAT001, CLI002
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    -- The role column is essential for RBAC enforced by the Go API [cite: 116]
    role user_role NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 3. PRESCRIPTIONS Table (Structured Medical Record)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(50) NOT NULL REFERENCES users(unique_user_id), -- Links to the Patient's record
    clinic_id VARCHAR(50) NOT NULL REFERENCES users(unique_user_id),  -- Links to the issuing Clinic
    
    -- Structured data capture from the Clinic App
    diagnosis TEXT,
    vitals JSONB, -- Stores flexible Vitals (BP, Heart Rate, etc.) [cite: 35]
    
    -- Structured drug and dosage data [cite: 77]
    instructions JSONB NOT NULL, 
    
    -- AI-Processed Fields for the Patient App [cite: 125, 58]
    translated_text TEXT, 
    audio_file_url TEXT,
    original_doctor_text TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 4. REPORTS Table (Diagnostic Results)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(50) NOT NULL REFERENCES users(unique_user_id), -- Ensures Data Isolation
    referring_clinic_id VARCHAR(50) REFERENCES users(unique_user_id), -- For multi-party sharing [cite: 46]
    scanning_center_id VARCHAR(50) REFERENCES users(unique_user_id),
    
    scan_type VARCHAR(100),
    original_file_url TEXT NOT NULL, -- URL/Path to the technical report (PDF/DICOM) [cite: 88]
    
    -- AI-Processed Fields [cite: 131, 59]
    simplified_summary TEXT, -- Patient-friendly summary
    full_technical_report TEXT, -- Optionally extracted text or link to original

    status VARCHAR(50) NOT NULL DEFAULT 'Uploaded', -- Status: Uploaded, AI Processing, Ready to Share [cite: 45]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 5. ADHERENCE Table (Medicine Tracker Logging)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS adherence (
    id BIGSERIAL PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES users(unique_user_id),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id),
    dose_time TIMESTAMP WITH TIME ZONE NOT NULL, -- The time the patient marked the dose as taken [cite: 63]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 6. Initial Dummy Data (For testing login and RBAC)
-- -----------------------------------------------------------
INSERT INTO users (unique_user_id, mobile_number, hashed_password, name, role) VALUES
('PAT001', '9876543210', 'patientpass', 'Amit Sharma', 'Patient'),
('CLI002', '1122334455', 'clinicpass', 'Dr. Priya Varma', 'Clinic'),
('SCN003', '9988776655', 'scanpass', 'Alpha Diagnostics', 'Scanning')
ON CONFLICT (unique_user_id) DO NOTHING;