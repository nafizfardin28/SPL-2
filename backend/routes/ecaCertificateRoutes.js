const express = require("express");
const PDFDocument = require("pdfkit");
const { pool } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const {
      activityTitle,
      activityType,
      organizer,
      eventDate,
      achievement,
      description,
    } = req.body;

    const studentId = req.user.id;

    if (!activityTitle || !activityType || !organizer || !eventDate || !description) {
      return res.status(400).json({
        message: "All required fields are required.",
      });
    }

    await pool.query(
      `INSERT INTO eca_certificate_requests
       (student_id, activity_title, activity_type, organizer, event_date, achievement, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        activityTitle.trim(),
        activityType.trim(),
        organizer.trim(),
        eventDate,
        achievement?.trim() || null,
        description.trim(),
      ]
    );

    return res.status(201).json({
      message: "ECA certificate request submitted successfully.",
    });
  } catch (error) {
    console.error("Create ECA error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/my", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await pool.query(
      `SELECT *
       FROM eca_certificate_requests
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
    );

    return res.json({ requests: rows });
  } catch (error) {
    console.error("Get my ECA error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/",
  requireAuth,
  requireRole("teacher", "superadmin"),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          eca.*,
          u.first_name,
          u.last_name,
          u.email,
          u.roll_no,
          u.reg_no,
          u.batch
        FROM eca_certificate_requests eca
        JOIN users u ON eca.student_id = u.id
        ORDER BY eca.created_at DESC`
      );

      return res.json({ requests: rows });
    } catch (error) {
      console.error("Get all ECA error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/:id/status",
  requireAuth,
  requireRole("teacher", "superadmin"),
  async (req, res) => {
    try {
      const { status, teacherNote } = req.body;
      const requestId = req.params.id;

      const allowed = ["approved", "rejected"];

      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
      }

      if (status === "rejected" && (!teacherNote || !teacherNote.trim())) {
        return res.status(400).json({
          message: "Teacher note is required when rejecting.",
        });
      }

      const [rows] = await pool.query(
        `SELECT status FROM eca_certificate_requests WHERE id = ? LIMIT 1`,
        [requestId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "ECA request not found." });
      }

      if (rows[0].status !== "pending") {
        return res.status(400).json({
          message: "Only pending requests can be updated.",
        });
      }

      const finalNote =
        status === "approved"
          ? "Your ECA certificate request has been approved. Certificate can now be generated."
          : teacherNote.trim();

      await pool.query(
        `UPDATE eca_certificate_requests
         SET status = ?,
             teacher_note = ?
         WHERE id = ?`,
        [status, finalNote, requestId]
      );

      return res.json({
        message:
          status === "approved"
            ? "ECA request approved."
            : "ECA request rejected.",
      });
    } catch (error) {
      console.error("Update ECA status error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/:id/generate",
  requireAuth,
  requireRole("teacher", "superadmin"),
  async (req, res) => {
    try {
      const requestId = req.params.id;
      const certificateId = `ECA-${Date.now()}-${requestId}`;

      const [rows] = await pool.query(
        `SELECT status FROM eca_certificate_requests WHERE id = ? LIMIT 1`,
        [requestId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "ECA request not found." });
      }

      if (rows[0].status !== "approved") {
        return res.status(400).json({
          message: "Only approved requests can generate certificates.",
        });
      }

      await pool.query(
        `UPDATE eca_certificate_requests
         SET status = 'generated',
             certificate_id = ?,
             teacher_note = ?
         WHERE id = ?`,
        [
          certificateId,
          "Your colourful ECA certificate has been generated. You can now download it.",
          requestId,
        ]
      );

      return res.json({
        message: "ECA certificate generated successfully.",
        certificateId,
      });
    } catch (error) {
      console.error("Generate ECA error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/:id/download",
  requireAuth,
  requireRole("student", "teacher", "superadmin"),
  async (req, res) => {
    try {
      const requestId = req.params.id;

      let query = `
        SELECT 
          eca.*,
          u.first_name,
          u.last_name,
          u.email,
          u.roll_no,
          u.reg_no,
          u.batch
        FROM eca_certificate_requests eca
        JOIN users u ON eca.student_id = u.id
        WHERE eca.id = ?
      `;

      const params = [requestId];

      if (req.user.role === "student") {
        query += ` AND eca.student_id = ?`;
        params.push(req.user.id);
      }

      query += ` LIMIT 1`;

      const [rows] = await pool.query(query, params);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Certificate not found." });
      }

      const cert = rows[0];

      if (cert.status !== "generated") {
        return res.status(400).json({
          message: "Certificate has not been generated yet.",
        });
      }

      const studentName = `${cert.first_name} ${cert.last_name}`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="eca-certificate-${cert.id}.pdf"`
      );

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 40,
      });

      doc.pipe(res);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Background
      doc.rect(0, 0, pageWidth, pageHeight).fill("#FFF8E7");

      // Colourful borders
      doc.lineWidth(8).strokeColor("#2563EB").rect(25, 25, pageWidth - 50, pageHeight - 50).stroke();
      doc.lineWidth(4).strokeColor("#F59E0B").rect(40, 40, pageWidth - 80, pageHeight - 80).stroke();
      doc.lineWidth(2).strokeColor("#10B981").rect(55, 55, pageWidth - 110, pageHeight - 110).stroke();

      // Header
      doc.fillColor("#111827");
      doc.fontSize(24).font("Helvetica-Bold").text(
        "Institute of Information Technology",
        0,
        75,
        { align: "center" }
      );

      doc.fontSize(18).font("Helvetica").text(
        "University of Dhaka",
        { align: "center" }
      );

      doc.moveDown(1);

      doc.fillColor("#B45309");
      doc.fontSize(32).font("Helvetica-Bold").text(
        "Certificate of Extra-Curricular Achievement",
        { align: "center" }
      );

      doc.moveDown(1.2);

      doc.fillColor("#374151");
      doc.fontSize(16).font("Helvetica").text(
        "This is to certify that",
        { align: "center" }
      );

      doc.moveDown(0.4);

      doc.fillColor("#1D4ED8");
      doc.fontSize(30).font("Helvetica-Bold").text(studentName, {
        align: "center",
      });

      doc.moveDown(0.4);

      doc.fillColor("#374151");
      doc.fontSize(15).font("Helvetica").text(
        `Roll: ${cert.roll_no || "N/A"}    Registration: ${cert.reg_no || "N/A"}    Batch: ${cert.batch || "N/A"}`,
        { align: "center" }
      );

      doc.moveDown(1);

      doc.fillColor("#111827");
      doc.fontSize(17).font("Helvetica").text(
        `has successfully participated in "${cert.activity_title}"`,
        { align: "center" }
      );

      doc.moveDown(0.3);

      doc.fontSize(15).text(
        `organized by ${cert.organizer}.`,
        { align: "center" }
      );

      if (cert.achievement) {
        doc.moveDown(0.5);
        doc.fillColor("#047857");
        doc.fontSize(17).font("Helvetica-Bold").text(
          `Achievement: ${cert.achievement}`,
          { align: "center" }
        );
      }

      doc.moveDown(0.7);

      doc.fillColor("#374151");
      doc.fontSize(13).font("Helvetica").text(
        `Activity Type: ${cert.activity_type}    Event Date: ${new Date(cert.event_date).toDateString()}`,
        { align: "center" }
      );

      doc.moveDown(1.2);

      doc.fontSize(11).fillColor("#6B7280").text(
        `Certificate ID: ${cert.certificate_id || "N/A"}`,
        { align: "center" }
      );

      // Signature lines
      doc.strokeColor("#111827").lineWidth(1);

      doc.moveTo(120, pageHeight - 105).lineTo(300, pageHeight - 105).stroke();
      doc.moveTo(pageWidth - 300, pageHeight - 105).lineTo(pageWidth - 120, pageHeight - 105).stroke();

      doc.fillColor("#111827").fontSize(12);
      doc.text("Teacher Signature", 120, pageHeight - 90, {
        width: 180,
        align: "center",
      });

      doc.text("Director Signature", pageWidth - 300, pageHeight - 90, {
        width: 180,
        align: "center",
      });

      doc.end();
    } catch (error) {
      console.error("Download ECA certificate error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;