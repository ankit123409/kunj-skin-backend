import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 8001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const isWhatsAppWebhook = (req) => {
  const path = req.url?.split("?")[0] || "";
  return path === "/api/whatsapp/webhook";
};

export default async function handler(req, res) {
  try {
    if (!isWhatsAppWebhook(req)) {
      await connectDB();
    }

    return app(req, res);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}
