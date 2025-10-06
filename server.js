// server.js - simple Express server that serves /public and forwards contact form to Gmail
require('dotenv').config();                      // load variables from .env
const express = require('express');              // web framework
const bodyParser = require('body-parser');       // parse POST bodies
const nodemailer = require('nodemailer');        // send emails
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded bodies (from fetch or forms)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// POST /send - receives contact form and forwards to Gmail
app.post('/send', async (req, res) => {
  const { name, email, message } = req.body || {};

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ status: 'fail', message: 'Name, email and message are required.' });
  }

  // Configure Nodemailer transport using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  // Email options
  const mailOptions = {
    from: `${name} <${email}>`,               // show sender name and their email
    to: process.env.GMAIL_USER,               // your Gmail receives the message
    subject: `Portfolio Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    return res.json({ status: 'success', message: 'Message sent — thank you!' });
  } catch (err) {
    console.error('SendMail error:', err);
    return res.status(500).json({ status: 'fail', message: 'Failed to send email. Check server logs.' });
  }
});

// Fallback: serve index.html for any other route (SPA-style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
