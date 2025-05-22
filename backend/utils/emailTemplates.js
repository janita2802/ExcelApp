const getOTPEmailTemplate = (userName, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Password Reset OTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .logo {
          max-width: 400px;
        }
        .content {
          padding: 20px 0;
        }
        .otp-container {
          background: #f5f5f5;
          padding: 15px;
          text-align: center;
          margin: 20px 0;
          border-radius: 5px;
        }
        .otp-code {
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
          color: #2c3e50;
        }
        .footer {
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #777;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #3498db;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="cid:companylogo" alt="Excel Tours & Travels Logo" class="logo">
      </div>
      
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>Dear User,</p>
        
        <p>We received a request to reset your password for account with username: <b>${userName}</b>. Please use the following One-Time Password (OTP) to proceed:</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <p>This OTP is valid for <strong>10 minutes</strong> only.</p>
        </div>
        
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        
        <p>For security reasons, do not share this OTP with unauthorized persons.</p>
      </div>
      
      <div class="footer">
        <p>This is an automatically generated email – please do not reply to it.<br>
        For any technical queries or feedback, please contact us at <a href="mailto:whizzoninfotech@gmail.com">whizzoninfotech@gmail.com</a><br>
        &copy; ${new Date().getFullYear()} Excel Tours & Travels. All rights reserved.</p>
      </div>
    </body>
    </html>
    `;
};

module.exports = { getOTPEmailTemplate };
