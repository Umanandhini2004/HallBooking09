const nodemailer = require('nodemailer');
const config = require('./config');

// Create transporter using Gmail app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

// Verify transporter on startup (optional)
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email transporter ready');
  }
});

const sendBookingNotification = async (userEmail, booking, status) => {
  const statusText = status.toLowerCase();
  const subject = `Hall Booking ${status} - ${booking.purpose}`;
  
  let htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hall Booking ${status}</h2>
      <p>Dear ${booking.user.name},</p>
      <p>Your hall booking request has been <strong>${status}</strong>.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Hall:</strong> ${booking.hall.name}</li>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
          <li><strong>Purpose:</strong> ${booking.purpose}</li>
          <li><strong>People:</strong> ${booking.people}</li>
          ${booking.notes ? `<li><strong>Admin Notes:</strong> ${booking.notes}</li>` : ''}
        </ul>
      </div>
      
      <p>Thank you for using Hall Booking System!</p>
      <p>Admin Team<br>2315022@nec.edu.in</p>
    </div>
  `;

  const mailOptions = {
    from: `"Hall Booking Admin" <${config.email.user}>`,
    to: userEmail,
    subject,
    html: htmlBody
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Booking notification sent to ${userEmail}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${userEmail}:`, error);
    return false;
  }
};

module.exports = { sendBookingNotification };
