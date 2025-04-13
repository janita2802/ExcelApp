exports.generateOtp = () => {
    // Generate a 6-digit numeric OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  // utils/phoneFormatter.js
  exports.formatPhoneNumber = (phone) => {
    // Implement phone number formatting logic based on your requirements
    // Example: ensure country code is present, remove spaces, etc.
    return phone.replace(/\D/g, ''); // Simple example - remove all non-digit characters
  };