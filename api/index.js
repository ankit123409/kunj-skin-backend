import "dotenv/config";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let dbPromise;

const isWhatsAppWebhook = (req) => {
  const path = req.url?.split("?")[0] || "";
  return path === "/api/whatsapp/webhook";
};

export default async function handler(req, res) {
  try {
    if (!isWhatsAppWebhook(req)) {
      if (!dbPromise) {
        dbPromise = connectDB();
      }

      await dbPromise;
    }

    return app(req, res);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
}
