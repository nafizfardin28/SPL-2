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
    const password = process.env.SUPERADMIN_PASSWORD || "iitadmin123";

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
        id BIGINT PRIMARY KEY AUTO_INCREMENT,

        first_name VARCHAR(80) NOT NULL,
        last_name VARCHAR(80) NOT NULL,

        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,

        role ENUM('student', 'teacher', 'staff', 'superadmin') NOT NULL,

        reg_no VARCHAR(20) NULL,
        roll_no VARCHAR(20) NULL,
        batch VARCHAR(20) NULL,

        password_hash VARCHAR(255) NOT NULL,

        status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
        is_verified TINYINT(1) NOT NULL DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,

        email VARCHAR(255) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,

        purpose ENUM('register','forgot_password') NOT NULL,

        expires_at DATETIME NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        last_sent_at DATETIME,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,

        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,

        audience_json JSON NOT NULL,

        source_role ENUM('teacher', 'staff') NOT NULL,

        created_by BIGINT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_notices_user
          FOREIGN KEY (created_by) REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await pool.query(`
  CREATE TABLE IF NOT EXISTS testimonial_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    details TEXT NULL,
    status ENUM(
      'pending_payment',
      'submitted',
      'under_review',
      'verified',
      'generated',
      'rejected'
    ) NOT NULL DEFAULT 'pending_payment',
    payment_status ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
    staff_note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    testimonial_request_id BIGINT NULL,
    payment_name VARCHAR(255) NOT NULL,
    payment_type ENUM('testimonial', 'semester_fee') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('bkash', 'nagad', 'rocket') NULL,
    mobile_number VARCHAR(20) NULL,
    transaction_id VARCHAR(100) NULL,
    status ENUM('unpaid', 'processing', 'paid', 'failed') NOT NULL DEFAULT 'unpaid',
    paid_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (testimonial_request_id) REFERENCES testimonial_requests(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);

    await pool
      .query(
        `
  ALTER TABLE testimonial_requests
  ADD COLUMN generated_at DATETIME NULL
`,
      )
      .catch(() => {});

    await pool
      .query(
        `
  ALTER TABLE testimonial_requests
  ADD COLUMN generated_by BIGINT NULL
`,
      )
      .catch(() => {});

    await pool
      .query(
        `
      CREATE INDEX IF NOT EXISTS idx_email_purpose
      ON otps(email, purpose);
    `,
      )
      .catch(() => {});

    await pool
      .query(
        `
      CREATE INDEX IF NOT EXISTS idx_notices_created_by
      ON notices(created_by);
    `,
      )
      .catch(() => {});

    await seedSuperAdmin();
    await seedStaff();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("DB Init Error:", error);
  }
};

module.exports = initDb;
