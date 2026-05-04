const express = require("express");
const SSLCommerzPayment = require("sslcommerz-lts");
const { pool } = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.SSLCOMMERZ_IS_SANDBOX === "false";

router.post(
  "/init/:id",
  requireAuth,
  requireRole("student"),
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const allocationId = req.params.id;

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
          ok: false,
          message: "Fee allocation not found.",
        });
      }

      const allocation = allocations[0];

      const [students] = await pool.query(
        `SELECT id, first_name, last_name, email, phone, batch
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [studentId]
      );

      if (students.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "Student not found.",
        });
      }

      const student = students[0];

      if (student.batch !== allocation.batch) {
        return res.status(403).json({
          ok: false,
          message: "This fee is not allocated for your batch.",
        });
      }

      const [existing] = await pool.query(
        `SELECT id, status
         FROM payments
         WHERE student_id = ?
           AND semester_fee_allocation_id = ?
           AND payment_type = 'semester_fee'
         LIMIT 1`,
        [studentId, allocationId]
      );

      if (existing.length > 0 && existing[0].status === "paid") {
        return res.status(400).json({
          ok: false,
          message: "You have already paid this fee.",
        });
      }

      const tran_id = `SSL-${Date.now()}-${studentId}`;

      if (existing.length > 0) {
        await pool.query(
          `UPDATE payments
           SET transaction_id = ?,
               status = 'processing',
               payment_name = ?,
               amount = ?,
               method = NULL,
               mobile_number = NULL,
               paid_at = NULL
           WHERE id = ?`,
          [
            tran_id,
            `${allocation.semester} Semester Fee`,
            allocation.amount,
            existing[0].id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO payments
           (student_id, testimonial_request_id, semester_fee_allocation_id,
            payment_name, amount, method, mobile_number, transaction_id,
            status, paid_at, payment_type)
           VALUES (?, NULL, ?, ?, ?, NULL, NULL, ?, 'processing', NULL, 'semester_fee')`,
          [
            studentId,
            allocationId,
            `${allocation.semester} Semester Fee`,
            allocation.amount,
            tran_id,
          ]
        );
      }

      const data = {
        total_amount: Number(allocation.amount),
        currency: "BDT",
        tran_id,

        success_url: `${process.env.BACKEND_URL}/api/sslcommerz/success`,
        fail_url: `${process.env.BACKEND_URL}/api/sslcommerz/fail`,
        cancel_url: `${process.env.BACKEND_URL}/api/sslcommerz/cancel`,

        shipping_method: "NO",
        product_name: allocation.title || `${allocation.semester} Semester Fee`,
        product_category: "Education",
        product_profile: "general",

        cus_name:
          `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
          "AcademiX Student",
        cus_email: student.email || "student@example.com",
        cus_add1: "Dhaka",
        cus_city: "Dhaka",
        cus_postcode: "1200",
        cus_country: "Bangladesh",
        cus_phone: student.phone || "01700000000",
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const apiResponse = await sslcz.init(data);

      if (!apiResponse.GatewayPageURL) {
        return res.status(400).json({
          ok: false,
          message: "Failed to create SSLCommerz session.",
          apiResponse,
        });
      }

      return res.json({
        ok: true,
        gatewayUrl: apiResponse.GatewayPageURL,
      });
    } catch (error) {
      console.error("SSL init error:", error);
      return res.status(500).json({
        ok: false,
        message: "Payment init failed.",
      });
    }
  }
);

router.post("/success", async (req, res) => {
  try {
    const body = req.body || {};
    const { tran_id, card_type } = body;

    console.log("SSL SUCCESS:", body);

    let method = "sslcommerz";

    if (card_type?.toLowerCase().includes("bkash")) method = "bkash";
    if (card_type?.toLowerCase().includes("nagad")) method = "nagad";
    if (card_type?.toLowerCase().includes("rocket")) method = "rocket";

    if (tran_id) {
      await pool.query(
        `UPDATE payments
         SET status = 'paid',
             method = ?,
             paid_at = NOW()
         WHERE transaction_id = ?`,
        [method, tran_id]
      );
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/student/semester-fees?status=success`
    );
  } catch (error) {
    console.error("SSL success error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/student/semester-fees?status=error`
    );
  }
});

router.post("/fail", async (req, res) => {
  const { tran_id } = req.body || {};

  if (tran_id) {
    await pool.query(
      `UPDATE payments SET status = 'failed' WHERE transaction_id = ?`,
      [tran_id]
    );
  }

  return res.redirect(
    `${process.env.FRONTEND_URL}/student/semester-fees?status=failed`
  );
});

router.post("/cancel", async (req, res) => {
  const { tran_id } = req.body || {};

  if (tran_id) {
    await pool.query(
      `UPDATE payments SET status = 'unpaid' WHERE transaction_id = ?`,
      [tran_id]
    );
  }

  return res.redirect(
    `${process.env.FRONTEND_URL}/student/semester-fees?status=cancelled`
  );
});

module.exports = router;