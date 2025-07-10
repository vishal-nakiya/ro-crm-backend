const express = require('express');
const Router = express.Router();
const otpService = require('../services/otpService');
const firebaseAuthMiddleware = require('../http/middlewares/firebaseAuthMiddleware');
const { body, validationResult } = require('express-validator');

/**
 * @swagger
 * /otp/send:
 *   post:
 *     summary: Send OTP to phone number
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number to send OTP to
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 phoneNumber:
 *                   type: string
 *                   example: "+1234567890"
 *                 expiresIn:
 *                   type: number
 *                   example: 600
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
Router.post('/send', [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+[0-9]{10,15}$/)
    .withMessage('Phone number must be in international format (+1234567890)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { phoneNumber } = req.body;

    const result = await otpService.generateOTP(phoneNumber);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /otp/verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number
 *                 example: "+1234567890"
 *               otp:
 *                 type: string
 *                 description: OTP code to verify
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *       400:
 *         description: Bad request or invalid OTP
 *       500:
 *         description: Internal server error
 */
Router.post('/verify', [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+[0-9]{10,15}$/)
    .withMessage('Phone number must be in international format (+1234567890)'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { phoneNumber, otp } = req.body;

    const result = await otpService.verifyOTP(phoneNumber, otp);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /otp/resend:
 *   post:
 *     summary: Resend OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number to resend OTP to
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP resent successfully"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
Router.post('/resend', [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+[0-9]{10,15}$/)
    .withMessage('Phone number must be in international format (+1234567890)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { phoneNumber } = req.body;

    const result = await otpService.resendOTP(phoneNumber);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /otp/status/{phoneNumber}:
 *   get:
 *     summary: Get OTP status
 *     tags: [OTP]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number to check OTP status for
 *         example: "+1234567890"
 *     responses:
 *       200:
 *         description: OTP status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: true
 *                 attempts:
 *                   type: number
 *                   example: 1
 *                 timeLeft:
 *                   type: number
 *                   example: 300
 *                 expired:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
Router.get('/status/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber.match(/^\+[0-9]{10,15}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    const status = otpService.getOTPStatus(phoneNumber);

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP status',
      error: error.message
    });
  }
});

module.exports = Router;