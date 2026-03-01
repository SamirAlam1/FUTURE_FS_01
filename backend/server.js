const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

/* ================================
   CORS CONFIG (PRODUCTION READY)
================================ */

const allowedOrigins = [
  "http://localhost:5173",
  "https://my-portfolio-psi-fawn-72.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ================================
   MIDDLEWARE
================================ */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ================================
   ROUTES
================================ */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/education", require("./routes/education"));
app.use("/api/blogs", require("./routes/blogs"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/messages", require("./routes/messages"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio CMS API is running 🚀",
  });
});

/* ================================
   404 HANDLER
================================ */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ================================
   ERROR HANDLER
================================ */

app.use(errorHandler);

/* ================================
   START SERVER
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});