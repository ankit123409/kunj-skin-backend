import nodemailer from "nodemailer";

const PAYMENT_LABELS = {
  1: "Cash on Delivery",
  2: "Card",
  3: "UPI"
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASSWORD
    }
  });

const buildOrderEmailHtml = (order) => {
  const customerName = escapeHtml(order.address?.name || "Customer");
  const items = order.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const totalAmount = Number(order.totalAmount || subtotal + deliveryCharge);
  const paymentMethod = PAYMENT_LABELS[order.paymentType] || "Online";
  const address = order.address || {};
  const addressLine = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.pincode
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(", ");

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#333;">
            ${escapeHtml(item.title)}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;color:#333;">
            ${Number(item.quantity)}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;color:#333;">
            ${formatCurrency(item.price)}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;color:#333;">
            ${formatCurrency(Number(item.price) * Number(item.quantity))}
          </td>
        </tr>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Order Confirmed</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f1ee;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ee;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
              <tr>
                <td style="background:#1c3a2e;padding:28px 24px;text-align:center;">
                  <h1 style="margin:0;color:#f7efe4;font-size:26px;letter-spacing:1px;">Kunj Skin</h1>
                  <p style="margin:8px 0 0;color:#d8c3a5;font-size:14px;">Natural skincare, delivered with care</p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 24px 8px;">
                  <h2 style="margin:0 0 8px;color:#1c3a2e;font-size:22px;">Order Confirmed</h2>
                  <p style="margin:0;color:#555;font-size:15px;line-height:1.6;">
                    Hi ${customerName}, thank you for shopping with Kunj Skin.
                    Your order has been placed successfully.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5f1;border-radius:12px;">
                    <tr>
                      <td style="padding:16px;">
                        <p style="margin:0 0 6px;color:#666;font-size:13px;">Order ID</p>
                        <p style="margin:0 0 12px;color:#1c3a2e;font-weight:bold;">${order._id}</p>
                        <p style="margin:0 0 6px;color:#666;font-size:13px;">Order date</p>
                        <p style="margin:0;color:#1c3a2e;font-weight:bold;">${formatDate(order.createdAt || new Date())}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px 16px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <th align="left" style="padding:8px;border-bottom:2px solid #1c3a2e;color:#1c3a2e;font-size:13px;">Product</th>
                      <th align="center" style="padding:8px;border-bottom:2px solid #1c3a2e;color:#1c3a2e;font-size:13px;">Qty</th>
                      <th align="right" style="padding:8px;border-bottom:2px solid #1c3a2e;color:#1c3a2e;font-size:13px;">Price</th>
                      <th align="right" style="padding:8px;border-bottom:2px solid #1c3a2e;color:#1c3a2e;font-size:13px;">Total</th>
                    </tr>
                    ${itemRows}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 16px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding:6px 0;color:#555;">Subtotal</td>
                      <td style="padding:6px 0;text-align:right;color:#333;">${formatCurrency(subtotal)}</td>
                    </tr>
                    ${
                      deliveryCharge > 0
                        ? `<tr>
                            <td style="padding:6px 0;color:#555;">Delivery charge</td>
                            <td style="padding:6px 0;text-align:right;color:#333;">${formatCurrency(deliveryCharge)}</td>
                          </tr>`
                        : `<tr>
                            <td style="padding:6px 0;color:#555;">Delivery charge</td>
                            <td style="padding:6px 0;text-align:right;color:#333;">Free</td>
                          </tr>`
                    }
                    <tr>
                      <td style="padding:10px 0;color:#1c3a2e;font-weight:bold;font-size:16px;">Total amount</td>
                      <td style="padding:10px 0;text-align:right;color:#1c3a2e;font-weight:bold;font-size:16px;">${formatCurrency(totalAmount)}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#555;">Payment method</td>
                      <td style="padding:6px 0;text-align:right;color:#333;">${escapeHtml(paymentMethod)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px 20px;">
                  <p style="margin:0 0 6px;color:#666;font-size:13px;">Shipping address</p>
                  <p style="margin:0;color:#333;line-height:1.6;">
                    ${escapeHtml(address.name || "")}<br />
                    ${escapeHtml(address.mobile || "")}<br />
                    ${addressLine}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px;">
                  <p style="margin:0 0 12px;color:#555;line-height:1.6;">
                    Expected delivery: your order is expected to arrive within 5–7 business days.
                  </p>
                  <p style="margin:0;color:#1c3a2e;font-weight:bold;">
                    Thank you for choosing Kunj Skin.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f8f5f1;padding:18px 24px;text-align:center;color:#888;font-size:12px;">
                  This is an automated confirmation from Kunj Skin. Please do not reply to this email.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

export const sendOrderConfirmationEmail = async (order) => {
  if (!order?.customerEmail) {
    throw new Error("Order customerEmail is missing");
  }

  const transporter = getTransporter();
  const customerName = order.address?.name || "Customer";

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "Kunj Skin"}" <${process.env.MAIL_FROM}>`,
    to: order.customerEmail,
    subject: `Order Confirmed — Kunj Skin #${order._id}`,
    text: `Hi ${customerName}, your Kunj Skin order ${order._id} has been confirmed. Total: ${formatCurrency(order.totalAmount)}.`,
    html: buildOrderEmailHtml(order)
  });
};
