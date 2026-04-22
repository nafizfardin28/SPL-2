const express = require("express");
const { pool } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

const parseAudiences = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  }

  return [];
};

router.post(
  "/",
  requireAuth,
  requireRole("teacher", "staff"),
  async (req, res) => {
    try {
      const { title, body, audiences } = req.body;

      if (!title || !body || !Array.isArray(audiences) || audiences.length === 0) {
        return res.status(400).json({
          message: "Title, body, and audiences are required.",
        });
      }

      await pool.query(
        `INSERT INTO notices (title, body, audience_json, source_role, created_by)
         VALUES (?, ?, ?, ?, ?)`,
        [
          title.trim(),
          body.trim(),
          JSON.stringify(audiences),
          req.user.role,
          req.user.id,
        ]
      );

      return res.status(201).json({
        message: "Notice published successfully.",
      });
    } catch (error) {
      console.error("create notice error", error);
      return res.status(500).json({ message: "Failed to create notice." });
    }
  }
);

router.get(
  "/mine",
  requireAuth,
  requireRole("teacher", "staff"),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, title, body, audience_json, source_role, created_at
         FROM notices
         WHERE created_by = ?
         ORDER BY created_at DESC`,
        [req.user.id]
      );

      const notices = rows.map((item) => ({
        ...item,
        audiences: parseAudiences(item.audience_json),
      }));

      return res.status(200).json({ notices });
    } catch (error) {
      console.error("get my notices error", error);
      return res.status(500).json({ message: "Failed to fetch notices." });
    }
  }
);

router.get(
  "/student",
  requireAuth,
  requireRole("student"),
  async (req, res) => {
    try {
      const [users] = await pool.query(
        `SELECT id, batch
         FROM users
         WHERE id = ? LIMIT 1`,
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: "Student not found." });
      }

      const studentBatch = users[0].batch;

      const [rows] = await pool.query(
        `SELECT
           n.id,
           n.title,
           n.body,
           n.audience_json,
           n.source_role,
           n.created_at,
           u.first_name,
           u.last_name
         FROM notices n
         JOIN users u ON n.created_by = u.id
         ORDER BY n.created_at DESC`
      );

      const notices = rows
        .map((item) => ({
          ...item,
          audiences: parseAudiences(item.audience_json),
        }))
        .filter((item) => {
          return (
            item.audiences.includes("All Students") ||
            item.audiences.includes(studentBatch)
          );
        });

      return res.status(200).json({ notices });
    } catch (error) {
      console.error("student notice fetch error", error);
      return res.status(500).json({ message: "Failed to fetch student notices." });
    }
  }
);

router.get(
  "/admin",
  requireAuth,
  requireRole("superadmin"),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
           n.id,
           n.title,
           n.body,
           n.audience_json,
           n.source_role,
           n.created_at,
           u.first_name,
           u.last_name,
           u.email
         FROM notices n
         JOIN users u ON n.created_by = u.id
         ORDER BY n.created_at DESC`
      );

      const parsed = rows.map((item) => ({
        ...item,
        audiences: parseAudiences(item.audience_json),
      }));

      const teacherNotices = parsed.filter(
        (item) => item.source_role === "teacher"
      );
      const staffNotices = parsed.filter(
        (item) => item.source_role === "staff"
      );

      return res.status(200).json({
        teacherNotices,
        staffNotices,
      });
    } catch (error) {
      console.error("admin notice fetch error", error);
      return res.status(500).json({ message: "Failed to fetch admin notices." });
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("superadmin","teacher","staff"),
  async (req, res) => {
    try {
      const noticeId = req.params.id;

      const [rows] = await pool.query(
        `SELECT id FROM notices WHERE id = ? LIMIT 1`,
        [noticeId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Notice not found." });
      }

      await pool.query(`DELETE FROM notices WHERE id = ?`, [noticeId]);

      return res.status(200).json({
        message: "Notice deleted successfully.",
      });
    } catch (error) {
      console.error("delete notice error", error);
      return res.status(500).json({ message: "Failed to delete notice." });
    }
  }
);

module.exports = router;