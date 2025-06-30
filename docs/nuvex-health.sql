
-- -- Nuvex Health Database Schema -- --

--  [Users/patients]
--  profile schema (general for admin, patients, doctors, etc.)


-- [doctors]
--  profile schema (for doctors)
-- 


-- [management]
--  profile schema [for admin, management, staff]
--  

--  [pharmacies]
--  pharmacy schema

-- [appointments]
--  appointment schema
--  appointment history schema


-- [medications]
--  medication schema


-- [prescriptions]
--  prescription schema
--  prescription history schema
-- prescription_items


-- [notifications] (management, patients, doctors)
--  notification schema
--  notification replies schema

--  [orders]
--  order schema
-- order_items

-- [payments]
--  payment schema
--  payment history schema

-- [health_records] - (related to patients)
--  health record schema



-- -- --- relationships -- -- --

-- ✅ Users/Profiles
user 1 ↔︎ 1 profile

user 1 ↔︎ 1 patient_profile (if role = patient)

user 1 ↔︎ 1 doctor_profile (if role = doctor)

user 1 ↔︎ 1 admin_profile (if role = admin/staff)

-- ✅ Doctors
doctor_profile 1 ↔︎ N appointments

doctor_profile 1 ↔︎ N prescriptions

doctor_profile 1 ↔︎ N notifications

doctor_profile 1 ↔︎ N pharmacies (if assigned)

-- ✅ Patients
patient_profile 1 ↔︎ N appointments

patient_profile 1 ↔︎ N prescriptions

patient_profile 1 ↔︎ N orders

patient_profile 1 ↔︎ N notifications

patient_profile 1 ↔︎ N health_records

patient_profile 1 ↔︎ N payments

-- ✅ Appointments
appointment N ↔︎ 1 patient_profile

appointment N ↔︎ 1 doctor_profile

appointment 1 ↔︎ N appointment_history

-- ✅ Medications
medication 1 ↔︎ N prescription_items

medication 1 ↔︎ N order_items

medication 1 ↔︎ N pharmacies (stocked in)

-- ✅ Prescriptions
prescription N ↔︎ 1 patient_profile

prescription N ↔︎ 1 doctor_profile

prescription 1 ↔︎ N prescription_items

prescription 1 ↔︎ N prescription_history

-- ✅ Pharmacies
pharmacy 1 ↔︎ N medications

pharmacy 1 ↔︎ N orders

pharmacy 1 ↔︎ N staff_profiles (if linked)

-- ✅ Notifications
notification N ↔︎ 1 user

notification 1 ↔︎ N notification_replies

-- ✅ Orders
order N ↔︎ 1 patient_profile

order N ↔︎ 1 pharmacy

order 1 ↔︎ N order_items

-- ✅ Payments
payment N ↔︎ 1 user (or order or prescription)

payment 1 ↔︎ N payment_history

-- ✅ Health Records
health_record N ↔︎ 1 patient_profile

health_record N ↔︎ 1 doctor_profile (optional)

-- ✅ Audit Logs
audit_log N ↔︎ 1 user

audit_log N ↔︎ 1 action_target (e.g. table name/id)



-- -- -- schema definitions -- -- --
-- [Users/Profiles]
enum user_role {
  'admin',
  'doctor',
  'user',
  'staff'
}

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL CHECK (role IN ('admin', 'doctor', 'user', 'staff')) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- [Profiles]
-- user profile schema
CREATE TABLE user_profile (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    phone_number VARCHAR(15) UNIQUE,
    age INT CHECK (age >= 0 AND age <= 120), -- reasonable
    sex VARCHAR(10) CHECK (),
    avatar: VARCHAR(255) DEFAULT 'default_avatar.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
)

-- doctor profile schema
CREATE TABLE doctor_profile (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100),
    license_number VARCHAR(50) UNIQUE,
    years_of_experience INT CHECK (years_of_experience >= 0),
    consultation_fee DECIMAL(10, 2) CHECK (consultation_fee >= 0),
    education TEXT,
    department VARCHAR(100),
    bio TEXT,
    availability BOOLEAN DEFAULT TRUE,
    avatar VARCHAR(255) DEFAULT 'default_doctor_avatar.png',
    sex VARCHAR(10) CHECK (),
    phone_number VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- -- [user health_records]
CREATE TABLE health_record (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES users(id) ON DELETE SET NULL, -- optional
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    blood_pressure VARCHAR(20),
    heart_rate INT CHECK (heart_rate >= 0),
    temperature DECIMAL(4, 2) CHECK (temperature >= 0 AND temperature <= 50), -- reasonable range
    weight DECIMAL(5, 2) CHECK (weight >= 0 AND weight <= 500), -- reasonable range
    height DECIMAL(5, 2) CHECK (height >= 0 AND height <= 300), -- reasonable range
    allergies TEXT,
    medications TEXT,
    notes TEXT,
    BMI DECIMAL(5, 2) GENERATED ALWAYS AS (weight / (height * height)) STORED,
    docs TEXT[] ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- [Appointments]
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    consultation_type VARCHAR(20) CHECK (consultation_type IN ('in-person', 'virtual')) DEFAULT 'in-person',
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- [medications]
enum medication_category {
    'antibiotic',
    'analgesic',
    'antipyretic',
    'antidepressant',
    'antihypertensive',
    'antidiabetic',
    'anticoagulant',
    'immunosuppressant',
    'other'
}
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    dosage VARCHAR(50),
    side_effects TEXT,
    manufacturer VARCHAR(100),
    expiration_date DATE,
    category medication_category NOT NULL CHECK (category IN ('antibiotic', 'analgesic', 'antipyretic', 'antidepressant', 'antihypertensive', 'antidiabetic', 'anticoagulant', 'immunosuppressant', 'other')),
    price DECIMAL(10, 2) CHECK (price >= 0),
    medication_code VARCHAR(50) UNIQUE, -- unique identifier for the medication
    medication_type VARCHAR(50) CHECK (medication_type IN ('tablet', 'capsule', 'syrup', 'injection', 'ointment', 'other')) DEFAULT 'tablet',
    manufacturer_contact VARCHAR(100),
    image_url VARCHAR(255),
    stock INT CHECK (stock >= 0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- [Prescriptions]
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prescription_drugs TEXT[], -- array of medication IDs
    dosage_instructions TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- [Pharmacies]
CREATE TABLE pharmacy (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- [pharmacy stock]
CREATE TABLE pharmacy_stock (
    id SERIAL PRIMARY KEY,
    pharmacy_id INT NOT NULL REFERENCES pharmacy(id) ON DELETE CASCADE,
    medication_id INT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    quantity INT CHECK (quantity >= 0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- [management]
CREATE TABLE management_profile (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff')),
    department VARCHAR(100),
    phone_number VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- [Notifications] -created by management, sent to users, doctors, etc.
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE Table notification_state (
    id SERIAL PRIMARY KEY,
    notification_id INT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_replies (
    id SERIAL PRIMARY KEY,
    notification_id INT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reply TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- [Orders]
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pharmacy_id INT NOT NULL REFERENCES pharmacy(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_address TEXT,
    delivery_method VARCHAR(20) CHECK (delivery_method IN ('pickup', 'delivery')) DEFAULT 'delivery',
    delivery_time TIMESTAMP,
    estimated_delivery TIMESTAMP
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    total_amount DECIMAL(10, 2) CHECK (total_amount >= 0),
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medication_id INT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    quantity INT CHECK (quantity > 0),
    price DECIMAL(10, 2) CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- [Payments]

enum payment_method {
    'credit_card',
    'debit_card',
    'paypal',
    'cash'
}
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id INT REFERENCES orders(id) ON DELETE SET NULL, -- optional
    prescription_id INT REFERENCES prescriptions(id) ON DELETE SET NULL, -- optional
    amount DECIMAL(10, 2) CHECK (amount >= 0),
    payment_method payment_method CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'cash')) DEFAULT 'credit_card',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_history (
    id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) UNIQUE,
    amount DECIMAL(10, 2) CHECK (amount >= 0),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Indexes and Performance Optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_doctor_profile_specialization ON doctor_profile(specialization);
CREATE INDEX idx_medications_name ON medications(name);
CREATE INDEX idx_pharmacy_name ON pharmacy(name);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_orders_patient_id ON orders(patient_id);
CREATE INDEX idx_orders_pharmacy_id ON orders(pharmacy_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_prescription_id ON payments(prescription_id);
CREATE INDEX idx_health_record_patient_id ON health_record(patient_id);
CREATE INDEX idx_health_record_doctor_id ON health_record(doctor_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notification_replies_notification_id ON notification_replies(notification_id);
CREATE INDEX idx_notification_replies_user_id ON notification_replies(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_medication_id ON order_items(medication_id);