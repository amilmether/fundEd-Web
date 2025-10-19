'use server';

import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_EMAIL, // Your Gmail address from .env
    pass: process.env.GMAIL_APP_PASSWORD, // Your App Password from .env
  },
});

/**
 * Sends an email using the configured Nodemailer transporter.
 * @param options - The email options (to, subject, html).
 */
export async function sendEmail(options: SendEmailOptions) {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Email credentials are not configured in .env file.');
    // In a real app, you might want to throw an error or handle this case more gracefully.
    // For this example, we'll just log an error and return.
    return { success: false, message: 'Email service is not configured.' };
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"FundEd" <${process.env.GMAIL_EMAIL}>`, // sender address
      ...options,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    // In production, you'd want more robust error handling and logging.
    return { success: false, message: 'Failed to send email.' };
  }
}
