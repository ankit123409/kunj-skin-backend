import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/review.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API is runningaaaa"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/coupons", couponRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Kunj Skin API is running",
  });
});


app.use(notFound);
app.use(errorHandler);

export default app;
