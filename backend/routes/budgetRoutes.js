const express = require("express");
const { pool } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const { title, category, amount, purpose } = req.body;
    const studentId = req.user.id;

    if (!title || !category || !amount || !purpose) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0." });
    }

    await pool.query(
      `INSERT INTO budget_requests 
       (student_id, title, category, amount, purpose)
       VALUES (?, ?, ?, ?, ?)`,
      [studentId, title.trim(), category.trim(), amount, purpose.trim()]
    );

    return res.status(201).json({
      message: "Budget request submitted successfully.",
    });
  } catch (error) {
    console.error("Create budget error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/my", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await pool.query(
      `SELECT *
       FROM budget_requests
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
    );

    return res.json({ budgets: rows });
  } catch (error) {
    console.error("Get my budgets error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/",
  requireAuth,
  requireRole("teacher", "staff", "superadmin"),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          br.*,
          u.first_name,
          u.last_name,
          u.email,
          u.roll_no,
          u.reg_no,
          u.batch
        FROM budget_requests br
        JOIN users u ON br.student_id = u.id
        ORDER BY br.created_at DESC`
      );

      return res.json({ budgets: rows });
    } catch (error) {
      console.error("Get all budgets error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Teacher can confirm or reject pending budget
 */
router.put(
  "/:id/teacher-status",
  requireAuth,
  requireRole("teacher", "superadmin"),
  async (req, res) => {
    try {
      const { status, teacherNote } = req.body;
      const requestId = req.params.id;

      const allowed = ["teacher_confirmed", "rejected"];

      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid teacher status." });
      }

      if (status === "rejected" && (!teacherNote || !teacherNote.trim())) {
        return res.status(400).json({
          message: "Teacher note is required when rejecting.",
        });
      }

      const [rows] = await pool.query(
        `SELECT status FROM budget_requests WHERE id = ? LIMIT 1`,
        [requestId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Budget request not found." });
      }

      if (rows[0].status !== "pending") {
        return res.status(400).json({
          message: "Only pending budgets can be updated by teacher.",
        });
      }

      await pool.query(
        `UPDATE budget_requests
         SET status = ?,
             teacher_note = ?
         WHERE id = ?`,
        [status, teacherNote?.trim() || null, requestId]
      );

      return res.json({
        message:
          status === "teacher_confirmed"
            ? "Budget request confirmed by teacher."
            : "Budget request rejected by teacher.",
      });
    } catch (error) {
      console.error("Teacher budget status error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Staff flow:
 * teacher_confirmed -> staff_verified
 * staff_verified -> approved / rejected
 */
router.put(
  "/:id/staff-status",
  requireAuth,
  requireRole("staff", "superadmin"),
  async (req, res) => {
    try {
      const { status, staffNote } = req.body;
      const requestId = req.params.id;

      const allowed = ["staff_verified", "approved", "rejected"];

      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid staff status." });
      }

      if (status === "rejected" && (!staffNote || !staffNote.trim())) {
        return res.status(400).json({
          message: "Staff note is required when rejecting budget request.",
        });
      }

      const [rows] = await pool.query(
        `SELECT status FROM budget_requests WHERE id = ? LIMIT 1`,
        [requestId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Budget request not found." });
      }

      const currentStatus = rows[0].status;

      if (status === "staff_verified" && currentStatus !== "teacher_confirmed") {
        return res.status(400).json({
          message: "Only teacher-confirmed budgets can be staff verified.",
        });
      }

      if (
        ["approved", "rejected"].includes(status) &&
        currentStatus !== "staff_verified"
      ) {
        return res.status(400).json({
          message: "Only staff-verified budgets can be approved or rejected.",
        });
      }

      let finalStaffNote = staffNote?.trim() || null;

      if (status === "approved") {
        finalStaffNote =
          "Your budget application has been approved by the staff. Please contact the PHS office for further processing.";
      }

      await pool.query(
        `UPDATE budget_requests
         SET status = ?,
             staff_note = ?
         WHERE id = ?`,
        [status, finalStaffNote, requestId]
      );

      return res.json({
        message: `Budget request ${status}.`,
      });
    } catch (error) {
      console.error("Staff budget status error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;