import express from "express";

const router = express.Router();

router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified successfully");

    res.set("Content-Type", "text/plain");
    return res.status(200).send(String(challenge));
  }

  console.error("WhatsApp webhook verification failed");

  return res.sendStatus(403);
});

router.post("/webhook", (req, res) => {
  try {
    console.log(
      "WhatsApp webhook event:",
      JSON.stringify(req.body, null, 2)
    );
  } catch (error) {
    console.error("WhatsApp webhook event log failed");
  }

  return res.sendStatus(200);
});

export default router;
