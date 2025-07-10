const admin = require('../config/firebase');
const logger = require('../logger/index');

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis or database
  }

  /**
   * Generate OTP for phone verification
   * @param {string} phoneNumber - Phone number to send OTP to
   * @returns {Promise<Object>} - OTP details
   */
  async generateOTP(phoneNumber) {
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes expiry

      // Store OTP with expiry
      this.otpStore.set(phoneNumber, {
        otp,
        expiryTime,
        attempts: 0
      });

      // In production, integrate with SMS service like Twilio, AWS SNS, etc.
      // For now, we'll simulate SMS sending
      await this.sendSMS(phoneNumber, `Your OTP is: ${otp}. Valid for 10 minutes.`);

      logger.info(`OTP generated for ${phoneNumber}: ${otp}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        phoneNumber,
        expiresIn: 600 // 10 minutes in seconds
      };
    } catch (error) {
      logger.error(`OTP generation failed for ${phoneNumber}:`, error);
      throw new Error('Failed to generate OTP');
    }
  }

  /**
   * Verify OTP
   * @param {string} phoneNumber - Phone number
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} - Verification result
   */
  async verifyOTP(phoneNumber, otp) {
    try {
      const storedData = this.otpStore.get(phoneNumber);
      
      if (!storedData) {
        return {
          success: false,
          message: 'OTP not found or expired',
          error: 'OTP_NOT_FOUND'
        };
      }

      // Check if OTP is expired
      if (Date.now() > storedData.expiryTime) {
        this.otpStore.delete(phoneNumber);
        return {
          success: false,
          message: 'OTP has expired',
          error: 'OTP_EXPIRED'
        };
      }

      // Check attempts limit
      if (storedData.attempts >= 3) {
        this.otpStore.delete(phoneNumber);
        return {
          success: false,
          message: 'Too many attempts. OTP invalidated.',
          error: 'TOO_MANY_ATTEMPTS'
        };
      }

      // Increment attempts
      storedData.attempts++;

      // Verify OTP
      if (storedData.otp !== otp) {
        return {
          success: false,
          message: 'Invalid OTP',
          error: 'INVALID_OTP'
        };
      }

      // OTP is valid, remove from store
      this.otpStore.delete(phoneNumber);

      logger.info(`OTP verified successfully for ${phoneNumber}`);

      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      logger.error(`OTP verification failed for ${phoneNumber}:`, error);
      throw new Error('Failed to verify OTP');
    }
  }

  /**
   * Send SMS (placeholder for SMS service integration)
   * @param {string} phoneNumber - Phone number
   * @param {string} message - SMS message
   */
  async sendSMS(phoneNumber, message) {
    // In production, integrate with SMS service
    // Example with Twilio:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    */

    // For development, just log the SMS
    logger.info(`SMS to ${phoneNumber}: ${message}`);
    
    // Simulate SMS delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Resend OTP
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Object>} - Resend result
   */
  async resendOTP(phoneNumber) {
    try {
      // Remove existing OTP if any
      this.otpStore.delete(phoneNumber);
      
      // Generate new OTP
      return await this.generateOTP(phoneNumber);
    } catch (error) {
      logger.error(`OTP resend failed for ${phoneNumber}:`, error);
      throw new Error('Failed to resend OTP');
    }
  }

  /**
   * Get OTP status
   * @param {string} phoneNumber - Phone number
   * @returns {Object} - OTP status
   */
  getOTPStatus(phoneNumber) {
    const storedData = this.otpStore.get(phoneNumber);
    
    if (!storedData) {
      return {
        exists: false,
        message: 'No OTP found'
      };
    }

    const timeLeft = Math.max(0, Math.ceil((storedData.expiryTime - Date.now()) / 1000));

    return {
      exists: true,
      attempts: storedData.attempts,
      timeLeft,
      expired: timeLeft === 0
    };
  }

  /**
   * Clean expired OTPs
   */
  cleanExpiredOTPs() {
    const now = Date.now();
    for (const [phoneNumber, data] of this.otpStore.entries()) {
      if (now > data.expiryTime) {
        this.otpStore.delete(phoneNumber);
      }
    }
  }
}

// Clean expired OTPs every 5 minutes
const otpService = new OTPService();
setInterval(() => {
  otpService.cleanExpiredOTPs();
}, 5 * 60 * 1000);

module.exports = otpService; 