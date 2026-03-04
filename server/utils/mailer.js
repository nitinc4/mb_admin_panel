import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create the transporter using standard SMTP (configured for Gmail by default)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Mantrika Brahma" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

export const sendPaymentReceipt = async (user, payment) => {
  if (!user || !user.email) return;
  const subject = 'Payment Receipt - Mantrika Brahma';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h3>Hello ${user.name},</h3>
      <p>We have successfully received your payment.</p>
      <ul>
        <li><strong>Amount:</strong> ₹${payment.amount}</li>
        <li><strong>Reason:</strong> ${payment.reason}</li>
        <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
      <p>Thank you for your continued support!</p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

export const sendPaymentReminder = async (user, payment, isOverdue = false) => {
  if (!user || !user.email) return;
  const subject = isOverdue ? 'URGENT: Overdue Payment Reminder' : 'Payment Reminder - Mantrika Brahma';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h3>Hello ${user.name},</h3>
      <p>This is a reminder that you have a ${isOverdue ? '<strong>severely overdue</strong> ' : ''}payment pending.</p>
      <ul>
        <li><strong>Amount Due:</strong> ₹${payment.amount}</li>
        <li><strong>Reason:</strong> ${payment.reason}</li>
        <li><strong>Due Date:</strong> ${new Date(payment.dueDate).toLocaleDateString()}</li>
      </ul>
      <p>Please complete your payment as soon as possible via the Mantrika Brahma app to avoid any service interruptions.</p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};