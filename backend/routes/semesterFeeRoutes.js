const express = require("express");
const { pool } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Staff: get students grouped by batch
 */
router.get(
  "/students-by-batch",
  requireAuth,
  requireRole("staff", "superadmin"),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, first_name, last_name, email, roll_no, reg_no, batch
         FROM users
         WHERE role = 'student'
           AND status = 'approved'
           AND is_verified = 1
         ORDER BY batch ASC, roll_no ASC`
      );

      const grouped = {};

      rows.forEach((student) => {
        const batch = student.batch || "Unassigned";
        if (!grouped[batch]) grouped[batch] = [];
        grouped[batch].push(student);
      });

      return res.json({ batches: grouped });
    } catch (error) {
      console.error("Students by batch error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Staff: allocate semester fee
 */
router.post(
  "/allocations",
  requireAuth,
  requireRole("staff", "superadmin"),
  async (req, res) => {
    try {
      const { batch, semester, title, amount, dueDate } = req.body;
      const staffId = req.user.id;

      if (!batch || !semester || !title || !amount || !dueDate) {
        return res.status(400).json({
          message: "All fields are required.",
        });
      }

      if (Number(amount) <= 0) {
        return res.status(400).json({
          message: "Amount must be greater than 0.",
        });
      }

      await pool.query(
        `INSERT INTO semester_fee_allocations
         (batch, semester, title, amount, due_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [batch, semester, title.trim(), amount, dueDate, staffId]
      );

      return res.status(201).json({
        message: "Semester fee allocated successfully.",
      });
    } catch (error) {
      console.error("Create allocation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Staff: get all allocated payments
 */
router.get(
  "/allocations",
  requireAuth,
  requireRole("staff", "superadmin"),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          sfa.*,
          u.first_name AS staff_first_name,
          u.last_name AS staff_last_name
         FROM semester_fee_allocations sfa
         JOIN users u ON sfa.created_by = u.id
         ORDER BY sfa.created_at DESC`
      );

      return res.json({ allocations: rows });
    } catch (error) {
      console.error("Get allocations error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Staff: extend deadline
 */
router.put(
  "/allocations/:allocationId/extend-deadline",
  requireAuth,
  requireRole("staff", "superadmin"),
  async (req, res) => {
    try {
      const { dueDate } = req.body;
      const allocationId = req.params.allocationId;

      if (!dueDate) {
        return res.status(400).json({
          message: "New due date is required.",
        });
      }

      const [rows] = await pool.query(
        `SELECT id FROM semester_fee_allocations WHERE id = ? LIMIT 1`,
        [allocationId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Fee allocation not found.",
        });
      }

      await pool.query(
        `UPDATE semester_fee_allocations
         SET due_date = ?
         WHERE id = ?`,
        [dueDate, allocationId]
      );

      return res.json({
        message: "Payment deadline extended successfully.",
      });
    } catch (error) {
      console.error("Extend deadline error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Student: get allocated semester fees for own batch
 */
router.get(
  "/student",
  requireAuth,
  requireRole("student"),
  async (req, res) => {
    try {
      const studentId = req.user.id;

      const [students] = await pool.query(
        `SELECT batch FROM users WHERE id = ? LIMIT 1`,
        [studentId]
      );

      if (students.length === 0) {
        return res.status(404).json({ message: "Student not found." });
      }

      const batch = students[0].batch;

      const [rows] = await pool.query(
        `SELECT 
          sfa.*,
          p.id AS payment_id,
          p.status AS payment_status,
          p.transaction_id,
          p.method,
          p.mobile_number,
          p.paid_at
         FROM semester_fee_allocations sfa
         LEFT JOIN payments p 
           ON p.semester_fee_allocation_id = sfa.id
          AND p.student_id = ?
          AND p.payment_type = 'semester_fee'
         WHERE sfa.batch = ?
           AND sfa.status = 'active'
         ORDER BY sfa.created_at DESC`,
        [studentId, batch]
      );

      return res.json({ fees: rows });
    } catch (error) {
      console.error("Get student semester fees error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Student: SandGate sandbox payment
 */
router.post(
  "/:allocationId/sandbox-pay",
  requireAuth,
  requireRole("student"),
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const allocationId = req.params.allocationId;
      const { method, mobileNumber, otp } = req.body;

      if (!method || !mobileNumber || !otp) {
        return res.status(400).json({
          message: "Method, mobile number and OTP are required.",
        });
      }

      if (!["bkash", "nagad", "rocket"].includes(method)) {
        return res.status(400).json({
          message: "Invalid payment method.",
        });
      }

      if (otp !== "123456") {
        return res.status(400).json({
          message: "Invalid sandbox OTP. Use 123456.",
        });
      }

      const [allocations] = await pool.query(
        `SELECT *
         FROM semester_fee_allocations
         WHERE id = ?
           AND status = 'active'
         LIMIT 1`,
        [allocationId]
      );

      if (allocations.length === 0) {
        return res.status(404).json({
          message: "Fee allocation not found.",
        });
      }

      const allocation = allocations[0];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDate = new Date(allocation.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (today > dueDate) {
        return res.status(400).json({
          message: "Payment deadline has passed. Please contact PHS office.",
        });
      }

      const [students] = await pool.query(
        `SELECT batch FROM users WHERE id = ? LIMIT 1`,
        [studentId]
      );

      if (students.length === 0) {
        return res.status(404).json({ message: "Student not found." });
      }

      if (students[0].batch !== allocation.batch) {
        return res.status(403).json({
          message: "This fee is not allocated for your batch.",
        });
      }

      const [existing] = await pool.query(
        `SELECT id FROM payments
         WHERE student_id = ?
           AND semester_fee_allocation_id = ?
           AND payment_type = 'semester_fee'
           AND status IN ('processing', 'paid')
         LIMIT 1`,
        [studentId, allocationId]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          message: "You have already paid this fee.",
        });
      }

      const transactionId = `SANDGATE-${Date.now()}-${studentId}`;

      await pool.query(
        `INSERT INTO payments
         (student_id, testimonial_request_id, semester_fee_allocation_id,
          payment_name, amount, method, mobile_number, transaction_id,
          status, paid_at, payment_type)
         VALUES (?, NULL, ?, ?, ?, ?, ?, ?, 'paid', NOW(), 'semester_fee')`,
        [
          studentId,
          allocationId,
          `${allocation.semester} Semester Fee`,
          allocation.amount,
          method,
          mobileNumber,
          transactionId,
        ]
      );

      return res.json({
        message: "SandGate sandbox payment successful.",
        transactionId,
      });
    } catch (error) {
      console.error("Sandbox payment error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Staff: see paid/unpaid students for an allocation
 */
router.get(
  "/allocations/:allocationId/students",
  requireAuth,
  requireRole("staff", "superadmin"),
  async (req, res) => {
    try {
      const allocationId = req.params.allocationId;

      const [allocations] = await pool.query(
        `SELECT *
         FROM semester_fee_allocations
         WHERE id = ?
         LIMIT 1`,
        [allocationId]
      );

      if (allocations.length === 0) {
        return res.status(404).json({
          message: "Allocation not found.",
        });
      }

      const allocation = allocations[0];

      const [rows] = await pool.query(
        `SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.roll_no,
          u.reg_no,
          u.batch,

          p.id AS payment_id,
          p.status AS payment_status,
          p.transaction_id,
          p.method,
          p.mobile_number,
          p.paid_at
         FROM users u
         LEFT JOIN payments p
           ON p.student_id = u.id
          AND p.semester_fee_allocation_id = ?
          AND p.payment_type = 'semester_fee'
         WHERE u.role = 'student'
           AND u.batch = ?
           AND u.status = 'approved'
           AND u.is_verified = 1
         ORDER BY u.roll_no ASC`,
        [allocationId, allocation.batch]
      );

      const paidStudents = rows.filter((s) => s.payment_status === "paid");
      const unpaidStudents = rows.filter((s) => !s.payment_status);

      return res.json({
        allocation,
        students: rows,
        paidStudents,
        unpaidStudents,
      });
    } catch (error) {
      console.error("Allocation students error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;