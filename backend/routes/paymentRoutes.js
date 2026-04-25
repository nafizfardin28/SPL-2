const express = require("express");
const PDFDocument = require("pdfkit");
const { pool } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

const generateTransactionId = () => {
  return `ACX-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

router.get("/my", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        p.id,
        p.payment_name,
        p.payment_type,
        p.amount,
        p.method,
        p.mobile_number,
        p.transaction_id,
        p.status,
        p.paid_at,
        p.created_at,
        p.testimonial_request_id,
        tr.purpose AS testimonial_purpose
       FROM payments p
       LEFT JOIN testimonial_requests tr ON p.testimonial_request_id = tr.id
       WHERE p.student_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id],
    );

    return res.status(200).json({ payments: rows });
  } catch (error) {
    console.error("get my payments error", error);
    return res.status(500).json({ message: "Failed to fetch payments." });
  }
});

router.get(
  "/:id",
  requireAuth,
  requireRole("student", "superadmin"),
  async (req, res) => {
    try {
      const paymentId = req.params.id;

      const [rows] = await pool.query(
        `SELECT
        p.id,
        p.student_id,
        p.testimonial_request_id,
        p.payment_name,
        p.payment_type,
        p.amount,
        p.method,
        p.mobile_number,
        p.transaction_id,
        p.status,
        p.paid_at,
        p.created_at,
        tr.purpose,
        tr.status AS testimonial_status,
        tr.payment_status,
        u.first_name,
        u.last_name,
        u.email,
        u.roll_no,
        u.reg_no,
        u.batch
       FROM payments p
       LEFT JOIN testimonial_requests tr ON p.testimonial_request_id = tr.id
       JOIN users u ON p.student_id = u.id
       WHERE p.id = ?
       LIMIT 1`,
        [paymentId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Payment not found." });
      }

      const payment = rows[0];

      if (req.user.role === "student" && payment.student_id !== req.user.id) {
        return res.status(403).json({ message: "Forbidden." });
      }

      return res.status(200).json({ payment });
    } catch (error) {
      console.error("get payment error", error);
      return res.status(500).json({ message: "Failed to fetch payment." });
    }
  },
);

router.post(
  "/:id/start",
  requireAuth,
  requireRole("student"),
  async (req, res) => {
    try {
      const { method, mobileNumber } = req.body;
      const paymentId = req.params.id;

      if (!["bkash", "nagad", "rocket"].includes(method)) {
        return res.status(400).json({ message: "Invalid payment method." });
      }

      if (!mobileNumber || mobileNumber.length < 11) {
        return res
          .status(400)
          .json({ message: "Valid mobile number required." });
      }

      const [rows] = await pool.query(
        `SELECT id, student_id, status FROM payments WHERE id = ? LIMIT 1`,
        [paymentId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Payment not found." });
      }

      const payment = rows[0];

      if (payment.student_id !== req.user.id) {
        return res.status(403).json({ message: "Forbidden." });
      }

      if (payment.status === "paid") {
        return res.status(400).json({ message: "Payment already completed." });
      }

      await pool.query(
        `UPDATE payments
       SET method = ?, mobile_number = ?, status = 'processing'
       WHERE id = ?`,
        [method, mobileNumber, paymentId],
      );

      return res.status(200).json({
        message: "OTP sent successfully. Use 123456 for demo.",
      });
    } catch (error) {
      console.error("start payment error", error);
      return res.status(500).json({ message: "Failed to start payment." });
    }
  },
);

router.post(
  "/:id/confirm",
  requireAuth,
  requireRole("student"),
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const paymentId = req.params.id;
      const { otp, pin } = req.body;

      if (otp !== "123456") {
        return res.status(400).json({ message: "Invalid OTP." });
      }

      if (pin !== "1234") {
        return res.status(400).json({ message: "Invalid PIN." });
      }

      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT id, student_id, testimonial_request_id, status, payment_type
       FROM payments
       WHERE id = ?
       LIMIT 1`,
        [paymentId],
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Payment not found." });
      }

      const payment = rows[0];

      if (payment.student_id !== req.user.id) {
        await connection.rollback();
        return res.status(403).json({ message: "Forbidden." });
      }

      if (payment.status === "paid") {
        await connection.rollback();
        return res.status(400).json({ message: "Payment already completed." });
      }

      const transactionId = generateTransactionId();

      await connection.query(
        `UPDATE payments
       SET status = 'paid',
           transaction_id = ?,
           paid_at = NOW()
       WHERE id = ?`,
        [transactionId, paymentId],
      );

      if (
        payment.payment_type === "testimonial" &&
        payment.testimonial_request_id
      ) {
        await connection.query(
          `UPDATE testimonial_requests
         SET payment_status = 'paid',
             status = 'submitted'
         WHERE id = ?`,
          [payment.testimonial_request_id],
        );
      }

      await connection.commit();

      return res.status(200).json({
        message: "Payment successful.",
        transactionId,
      });
    } catch (error) {
      await connection.rollback();
      console.error("confirm payment error", error);
      return res.status(500).json({ message: "Failed to confirm payment." });
    } finally {
      connection.release();
    }
  },
);

router.get(
  "/:id/receipt",
  requireAuth,
  requireRole("student", "superadmin"),
  async (req, res) => {
    try {
      const paymentId = req.params.id;

      const [rows] = await pool.query(
        `SELECT
          p.id,
          p.student_id,
          p.payment_name,
          p.payment_type,
          p.amount,
          p.method,
          p.transaction_id,
          p.status,
          p.paid_at,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.roll_no,
          u.reg_no,
          u.batch
         FROM payments p
         JOIN users u ON p.student_id = u.id
         WHERE p.id = ? AND p.status = 'paid'
         LIMIT 1`,
        [paymentId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Receipt not found." });
      }

      const data = rows[0];

      if (req.user.role === "student" && data.student_id !== req.user.id) {
        return res.status(403).json({ message: "Forbidden." });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=academix-receipt-${paymentId}.pdf`,
      );

      const doc = new PDFDocument({ margin: 40 });
      doc.pipe(res);

      // ================= HEADER =================
      doc.rect(0, 0, 600, 80).fill("#1E3A8A");

      doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("AcademiX Payment Receipt", 50, 25);

      doc
        .fontSize(10)
        .text(
          "Institute of Information Technology, University of Dhaka",
          50,
          50,
        );

      // ================= RECEIPT BOX =================
      doc.moveDown(3);

      doc.roundedRect(40, 100, 520, 600, 12).stroke("#E5E7EB");

      // ================= PAID BADGE =================
      doc
        .fillColor("#16A34A")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("PAID", 450, 120);

      // ================= SECTION FUNCTION =================
      const section = (title, y) => {
        doc
          .fillColor("#111827")
          .font("Helvetica-Bold")
          .fontSize(13)
          .text(title, 60, y);
      };

      // ================= ROW FUNCTION =================
      const row = (label, value, y) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#374151")
          .text(label, 60, y);

        doc
          .font("Helvetica")
          .fillColor("#111827")
          .text(value || "N/A", 220, y);
      };

      // ================= STUDENT INFO =================
      section("Student Information", 150);

      let y = 180;
      row("Name:", `${data.first_name} ${data.last_name}`, y);
      y += 20;
      row("Email:", data.email, y);
      y += 20;
      row("Phone:", data.phone, y);
      y += 20;
      row("Roll No:", data.roll_no, y);
      y += 20;
      row("Registration No:", data.reg_no, y);
      y += 20;
      row("Batch:", data.batch, y);

      // ================= PAYMENT INFO =================
      section("Payment Information", y + 40);

      y += 70;
      row("Receipt No:", `ACX-R-${data.id}`, y);
      y += 20;
      row("Payment Name:", data.payment_name, y);
      y += 20;
      row("Payment Type:", data.payment_type, y);
      y += 20;
      row("Amount:", `${data.amount} BDT`, y);
      y += 20;
      row("Method:", data.method, y);
      y += 20;
      row("Transaction ID:", data.transaction_id, y);
      y += 20;
      row("Paid At:", data.paid_at, y);

      // ================= FOOTER =================
      doc
        .moveDown(10)
        .fontSize(9)
        .fillColor("gray")
        .text(
          "This is a system-generated receipt. No signature required.",
          50,
          720,
          { align: "center" },
        );

      doc.end();
    } catch (error) {
      console.error("receipt pdf error", error);
      return res.status(500).json({ message: "Failed to generate receipt." });
    }
  },
);

module.exports = router;
