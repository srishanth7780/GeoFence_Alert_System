const nodemailer = require('nodemailer');

// --- Email via Nodemailer / SMTP ---
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to, subject, html) {
  try {
    const host = process.env.SMTP_HOST || 'smtp.sendgrid.net';
    console.log(`[Email Service] Sending email to <${to}> via SMTP ${host}...`);
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'alerts@yourcompany.com',
      to,
      subject,
      html,
    });
    console.log(`[Email Service] Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to <${to}>:`, error.message);
    return null;
  }
}

async function notifyAlert(device, geofence, alert) {
  const msg = `🚨 GEOFENCE ALERT\nDevice: ${device.name}\nEvent: ${alert.alert_type} — ${geofence.name}\nTime: ${new Date().toLocaleString()}\nLocation: https://maps.google.com/?q=${alert.lat},${alert.lng}`;
  let sentChannel = 'none';

  const recipientEmail = device.email || 'ksrisri97@gmail.com';

  if (recipientEmail) {
    const info = await sendEmail(recipientEmail, `Geofence ${alert.alert_type} — ${device.name}`, `<pre>${msg}</pre>`);
    if (info) {
      sentChannel = 'email';
    }
  }

  // If the primary recipient was different, also send a copy to the specified test email
  if (device.email && device.email !== 'ksrisri97@gmail.com') {
    await sendEmail('ksrisri97@gmail.com', `[Copy] Geofence ${alert.alert_type} — ${device.name}`, `<pre>${msg}</pre>`);
  }

  return sentChannel;
}

module.exports = { notifyAlert, sendEmail };