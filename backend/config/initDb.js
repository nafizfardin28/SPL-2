const { pool } = require("./db");
const { hashPassword } = require("../utils/authUtils");

const seedSuperAdmin = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE role = 'superadmin' LIMIT 1",
    );

    if (rows.length > 0) {
      console.log("Super Admin already exists");
      return;
    }

    const email = process.env.SUPERADMIN_EMAIL || "admin@du.ac.bd";
    const password = process.env.SUPERADMIN_PASSWORD || "PHSadmin123";

    const passwordHash = hashPassword(password);

    await pool.query(
      `INSERT INTO users
      (
        first_name,
        last_name,
        email,
        phone,
        role,
        password_hash,
        status,
        is_verified
      )
      VALUES (?, ?, ?, ?, ?, ?, 'approved', 1)`,
      ["Super", "Admin", email, "0000000000", "superadmin", passwordHash],
    );

    console.log("Super Admin created successfully");
  } catch (error) {
    console.error("Error creating super admin:", error);
  }
};

const seedStaff = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE role = 'staff' LIMIT 1",
    );

    if (rows.length > 0) {
      console.log("Staff already exists");
      return;
    }

    const email = process.env.STAFF_EMAIL || "staff@du.ac.bd";
    const password = process.env.STAFF_PASSWORD || "staffadmin123";

    const passwordHash = hashPassword(password);

    await pool.query(
      `INSERT INTO users
      (
        first_name,
        last_name,
        email,
        phone,
        role,
        password_hash,
        status,
        is_verified
      )
      VALUES (?, ?, ?, ?, ?, ?, 'approved', 1)`,
      ["Super", "Staff", email, "0000000000", "staff", passwordHash],
    );

    console.log("Staff created successfully");
  } catch (error) {
    console.error("Error creating staff:", error);
  }
};

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        first_name VARCHAR(80) NOT NULL,
        last_name VARCHAR(80) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'staff', 'superadmin')),
        reg_no VARCHAR(20) NULL,
        roll_no VARCHAR(20) NULL,
        batch VARCHAR(20) NULL,
        password_hash VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
        is_verified INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('register', 'forgot_password')),
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        audience_json JSONB NOT NULL,
        source_role VARCHAR(20) NOT NULL CHECK (source_role IN ('teacher', 'staff')),
        created_by BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_notices_user
          FOREIGN KEY (created_by) REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonial_requests (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        details TEXT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'submitted', 'under_review', 'verified', 'generated', 'rejected')),
        payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
        staff_note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL,
        testimonial_request_id BIGINT NULL,
        payment_name VARCHAR(255) NOT NULL,
        payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('testimonial', 'semester_fee')),
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(20) NULL CHECK (method IN ('bkash', 'nagad', 'rocket')),
        mobile_number VARCHAR(20) NULL,
        transaction_id VARCHAR(100) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'processing', 'paid', 'failed')),
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (testimonial_request_id) REFERENCES testimonial_requests(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS budget_requests (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        purpose TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'teacher_confirmed', 'staff_verified', 'approved', 'rejected')),
        teacher_note TEXT NULL,
        staff_note TEXT NULL,
        admin_note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_budget_student
          FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS eca_certificate_requests (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL,
        activity_title VARCHAR(150) NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        organizer VARCHAR(150) NOT NULL,
        event_date DATE NOT NULL,
        achievement VARCHAR(150) NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'generated')),
        teacher_note TEXT NULL,
        certificate_id VARCHAR(80) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_eca_student
          FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS semester_fee_allocations (
        id BIGSERIAL PRIMARY KEY,
        batch VARCHAR(20) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        title VARCHAR(150) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        created_by BIGINT NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_semester_fee_created_by
          FOREIGN KEY (created_by) REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    await pool.query(`
      ALTER TABLE testimonial_requests
      ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP NULL;
    `).catch(() => {});

    await pool.query(`
      ALTER TABLE testimonial_requests
      ADD COLUMN IF NOT EXISTS generated_by BIGINT NULL;
    `).catch(() => {});

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_purpose
      ON otps(email, purpose);
    `).catch(() => {});

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notices_created_by
      ON notices(created_by);
    `).catch(() => {});

    await seedSuperAdmin();
    await seedStaff();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("DB Init Error:", error);
  }
};

module.exports = initDb;
