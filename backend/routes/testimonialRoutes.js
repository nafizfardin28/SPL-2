const express = require("express");
const { pool } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

const TESTIMONIAL_FEE = 500;

router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { purpose, details } = req.body;

    if (!purpose || !purpose.trim()) {
      return res.status(400).json({ message: "Purpose is required." });
    }

    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT id, status, payment_status
       FROM testimonial_requests
       WHERE student_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        message: "You already have a testimonial request.",
        existingRequest: existing[0],
      });
    }

    const [requestResult] = await connection.query(
      `INSERT INTO testimonial_requests
       (student_id, purpose, details, status, payment_status)
       VALUES (?, ?, ?, 'pending_payment', 'unpaid')`,
      [req.user.id, purpose.trim(), details?.trim() || null]
    );

    const requestId = requestResult.insertId;

    const [paymentResult] = await connection.query(
      `INSERT INTO payments
       (student_id, testimonial_request_id, payment_name, payment_type, amount, status)
       VALUES (?, ?, ?, 'testimonial', ?, 'unpaid')`,
      [
        req.user.id,
        requestId,
        "Testimonial Application Fee",
        TESTIMONIAL_FEE,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Testimonial request created. Please complete payment.",
      request: {
        id: requestId,
        purpose: purpose.trim(),
        details: details?.trim() || null,
        status: "pending_payment",
        payment_status: "unpaid",
      },
      payment: {
        id: paymentResult.insertId,
        paymentName: "Testimonial Application Fee",
        amount: TESTIMONIAL_FEE,
        status: "unpaid",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("create testimonial error", error);
    return res.status(500).json({ message: "Failed to create request." });
  } finally {
    connection.release();
  }
});

router.get("/my", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        tr.id,
        tr.purpose,
        tr.details,
        tr.status,
        tr.payment_status,
        tr.staff_note,
        tr.created_at,
        tr.updated_at,
        p.id AS payment_id,
        p.payment_name,
        p.amount,
        p.status AS payment_record_status,
        p.transaction_id,
        p.paid_at
       FROM testimonial_requests tr
       LEFT JOIN payments p ON p.testimonial_request_id = tr.id
       WHERE tr.student_id = ?
       ORDER BY tr.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ testimonials: rows });
  } catch (error) {
    console.error("get my testimonials error", error);
    return res.status(500).json({ message: "Failed to fetch testimonials." });
  }
});

router.get("/staff", requireAuth, requireRole("staff"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        tr.id,
        tr.purpose,
        tr.details,
        tr.status,
        tr.payment_status,
        tr.staff_note,
        tr.created_at,
        u.id AS student_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.reg_no,
        u.roll_no,
        u.batch,
        p.id AS payment_id,
        p.amount,
        p.method,
        p.transaction_id,
        p.status AS payment_record_status,
        p.paid_at
       FROM testimonial_requests tr
       JOIN users u ON tr.student_id = u.id
       LEFT JOIN payments p ON p.testimonial_request_id = tr.id
       WHERE tr.payment_status = 'paid'
       ORDER BY tr.created_at DESC`
    );

    return res.status(200).json({ testimonials: rows });
  } catch (error) {
    console.error("get staff testimonials error", error);
    return res.status(500).json({ message: "Failed to fetch testimonials." });
  }
});

router.get("/admin", requireAuth, requireRole("superadmin"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        tr.id,
        tr.purpose,
        tr.details,
        tr.status,
        tr.payment_status,
        tr.staff_note,
        tr.created_at,
        u.id AS student_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.reg_no,
        u.roll_no,
        u.batch,
        p.id AS payment_id,
        p.payment_name,
        p.amount,
        p.method,
        p.transaction_id,
        p.status AS payment_record_status,
        p.paid_at
       FROM testimonial_requests tr
       JOIN users u ON tr.student_id = u.id
       LEFT JOIN payments p ON p.testimonial_request_id = tr.id
       ORDER BY tr.created_at DESC`
    );

    return res.status(200).json({ testimonials: rows });
  } catch (error) {
    console.error("get admin testimonials error", error);
    return res.status(500).json({ message: "Failed to fetch testimonials." });
  }
});

router.put("/:id/status", requireAuth, requireRole("staff", "superadmin"), async (req, res) => {
  try {
    const { status, staffNote } = req.body;
    const requestId = req.params.id;

    const allowed = ["under_review", "verified", "generated", "rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const [rows] = await pool.query(
      `SELECT id, payment_status FROM testimonial_requests WHERE id = ? LIMIT 1`,
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (rows[0].payment_status !== "paid" && status !== "rejected") {
      return res.status(400).json({
        message: "Payment must be completed first.",
      });
    }

    await pool.query(
      `UPDATE testimonial_requests
       SET status = ?, staff_note = ?
       WHERE id = ?`,
      [status, staffNote?.trim() || null, requestId]
    );

    return res.status(200).json({ message: "Status updated successfully." });
  } catch (error) {
    console.error("update testimonial status error", error);
    return res.status(500).json({ message: "Failed to update status." });
  }
});

module.exports = router;