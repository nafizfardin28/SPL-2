const express = require("express");
const PDFDocument = require("pdfkit");
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
      [req.user.id],
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
      [req.user.id, purpose.trim(), details?.trim() || null],
    );

    const requestId = requestResult.insertId;

    const [paymentResult] = await connection.query(
      `INSERT INTO payments
       (student_id, testimonial_request_id, payment_name, payment_type, amount, status)
       VALUES (?, ?, ?, 'testimonial', ?, 'unpaid')`,
      [req.user.id, requestId, "Testimonial Application Fee", TESTIMONIAL_FEE],
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
      [req.user.id],
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
       ORDER BY tr.created_at DESC`,
    );

    return res.status(200).json({ testimonials: rows });
  } catch (error) {
    console.error("get staff testimonials error", error);
    return res.status(500).json({ message: "Failed to fetch testimonials." });
  }
});

router.get(
  "/admin",
  requireAuth,
  requireRole("superadmin"),
  async (req, res) => {
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
       ORDER BY tr.created_at DESC`,
      );

      return res.status(200).json({ testimonials: rows });
    } catch (error) {
      console.error("get admin testimonials error", error);
      return res.status(500).json({ message: "Failed to fetch testimonials." });
    }
  },
);

router.get(
  "/:id/download",
  requireAuth,
  requireRole("student", "staff", "superadmin"),
  async (req, res) => {
    try {
      const requestId = req.params.id;

      const [rows] = await pool.query(
        `SELECT
          tr.id,
          tr.purpose,
          tr.details,
          tr.status,
          tr.generated_at,
          tr.staff_note,

          u.id AS student_id,
          u.first_name,
          u.last_name,
          u.email,
          u.roll_no,
          u.reg_no,
          u.batch
         FROM testimonial_requests tr
         JOIN users u ON tr.student_id = u.id
         WHERE tr.id = ?
         LIMIT 1`,
        [requestId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Testimonial not found." });
      }

      const data = rows[0];

      if (data.status !== "generated") {
        return res.status(400).json({
          message: "Testimonial is not generated yet.",
        });
      }

      if (req.user.role === "student" && data.student_id !== req.user.id) {
        return res.status(403).json({ message: "Forbidden." });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=testimonial-${requestId}.pdf`,
      );

      const doc = new PDFDocument({
        size: "A4",
        margin: 60,
      });

      doc.pipe(res);

      // ================= HEADER =================
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Institute of Information Technology", { align: "center" });

      doc
        .font("Helvetica")
        .fontSize(10)
        .text("University of Dhaka", { align: "center" });

      doc.moveDown(2);

      // ================= TITLE =================
      doc.font("Helvetica-Bold").fontSize(14).text("TO WHOM IT MAY CONCERN", {
        align: "center",
        underline: true,
      });

      doc.moveDown(2);

      // ================= BODY TEXT =================
      const fullName = `${data.first_name} ${data.last_name}`;

      doc
        .font("Times-Roman")
        .fontSize(12)
        .lineGap(6)
        .text(
          `This is to certify that ${fullName}, Roll No. ${
            data.roll_no || "N/A"
          }, Registration No. ${data.reg_no || "N/A"}, is a regular student of the Bachelor of Science in Software Engineering (BSSE) program conducted by the Institute of Information Technology (PHS), University of Dhaka.`,
          {
            align: "justify",
          },
        );

      doc.moveDown(1);

      doc.text(
        `He/She is currently studying in ${data.batch || "N/A"} under the BSSE program.`,
        { align: "justify" },
      );

      doc.moveDown(1);

      doc.text(
        `To the best of our knowledge, the student has maintained good academic standing and conduct during the study period.`,
        { align: "justify" },
      );

      doc.moveDown(2);

      doc.text(
        `This testimonial is issued for the purpose of: ${data.purpose}.`,
        {
          align: "justify",
        },
      );

      // ================= SIGNATURE =================
      doc.moveDown(4);

      doc.text("_________________________", { align: "left" });
      doc.text("Authorized Signature", { align: "left" });

      doc.moveDown(2);

      // ================= VERIFIED BY =================
      doc.font("Helvetica-Bold").text("Verified By:", { align: "left" });

      doc.font("Helvetica").text("Administrative Officer", { align: "left" });

      // ================= DATE =================
      doc.moveDown(2);

      doc.text(`Date: ${new Date().toLocaleDateString()}`, {
        align: "right",
      });

      // ================= FOOTER =================
      doc.moveDown(3);

      doc
        .fontSize(9)
        .fillColor("gray")
        .text("This is a system-generated testimonial from AcademiX.", {
          align: "center",
        });

      doc.end();
    } catch (error) {
      console.error("download testimonial error", error);
      return res
        .status(500)
        .json({ message: "Failed to generate testimonial." });
    }
  },
);

router.put(
  "/:id/status",
  requireAuth,
  requireRole("staff", "superadmin"),
  async (req, res) => {
    try {
      const { status, staffNote } = req.body;
      const requestId = req.params.id;

      const allowed = ["under_review", "verified", "generated", "rejected"];

      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
      }

      const [rows] = await pool.query(
        `SELECT id, payment_status, status AS current_status
         FROM testimonial_requests
         WHERE id = ?
         LIMIT 1`,
        [requestId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Request not found." });
      }

      const request = rows[0];

      // 🚫 BLOCK if already final
      if (
        request.current_status === "generated" ||
        request.current_status === "rejected"
      ) {
        return res.status(400).json({
          message: "This testimonial is finalized and cannot be updated.",
        });
      }

      // 🚫 Payment check
      if (request.payment_status !== "paid" && status !== "rejected") {
        return res.status(400).json({
          message: "Payment must be completed first.",
        });
      }

      // 🚫 Rejected MUST have note
      const note = (staffNote || "").trim();

      if (status === "rejected" && note.length === 0) {
        return res.status(400).json({
          message: "Staff note is required when rejecting.",
        });
      }

      // 🎯 Final note logic
      let finalNote = note;

      if (status === "generated") {
        finalNote =
          "Your testimonial is ready. You can collect the hard copy from PHS office.";
      }

      // =============================
      // UPDATE
      // =============================
      if (status === "generated") {
        await pool.query(
          `UPDATE testimonial_requests
           SET 
             status = ?,
             staff_note = ?,
             generated_at = NOW(),
             generated_by = ?
           WHERE id = ?`,
          [status, finalNote, req.user.id, requestId],
        );
      } else {
        await pool.query(
          `UPDATE testimonial_requests
           SET 
             status = ?,
             staff_note = ?
           WHERE id = ?`,
          [status, finalNote, requestId],
        );
      }

      return res.status(200).json({
        message: "Status updated successfully.",
      });
    } catch (error) {
      console.error("update testimonial status error", error);
      return res.status(500).json({
        message: "Failed to update status.",
      });
    }
  },
);

module.exports = router;
