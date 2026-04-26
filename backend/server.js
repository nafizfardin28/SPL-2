const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const { testConnection } = require("./config/db");
const initDb = require("./config/initDb");

const authRoutes = require("./routes/authRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const ecaCertificateRoutes = require("./routes/ecaCertificateRoutes");
const semesterFeeRoutes = require("./routes/semesterFeeRoutes");
const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://your-frontend-domain.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AcademiX Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/budgets",budgetRoutes);
app.use("/api/eca-certificates",ecaCertificateRoutes);
app.use("/api/semester-fees",semesterFeeRoutes);

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  await testConnection();
  await initDb();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

bootstrap();