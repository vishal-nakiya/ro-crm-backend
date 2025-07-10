const express = require('express');
const Router = express.Router();
const { body } = require('express-validator');
const notificationController = require('../http/Controllers/notificationController');
const mobileMiddleware = require('../http/middlewares/mobileMiddleware');

// Apply Firebase auth middleware to all notification routes
Router.use(mobileMiddleware);

/**
 * @swagger
 * /notification/update-fcm-token:
 *   post:
 *     summary: Update FCM token for authenticated technician
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: FCM token from mobile device
 *                 example: "fcm_token_here"
 *     responses:
 *       200:
 *         description: FCM token updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/update-fcm-token', [
  body('fcmToken').notEmpty().withMessage('FCM token is required')
], notificationController().updateFcmToken);

/**
 * @swagger
 * /notification/send:
 *   post:
 *     summary: Send notification to a device
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - title
 *               - body
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM token of the device
 *                 example: "fcm_token_here"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "New Task Assigned"
 *               body:
 *                 type: string
 *                 description: Notification body
 *                 example: "You have been assigned a new task"
 *               data:
 *                 type: object
 *                 description: Additional data to send
 *                 example: {"taskId": "123", "type": "TASK_ASSIGNMENT"}
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/send', [
  body('token').notEmpty().withMessage('FCM token is required'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('body').notEmpty().withMessage('Notification body is required')
], notificationController().sendToDevice);

/**
 * @swagger
 * /notification/send-multiple:
 *   post:
 *     summary: Send notification to multiple devices
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokens
 *               - title
 *               - body
 *             properties:
 *               tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of FCM tokens
 *                 example: ["token1", "token2"]
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "System Update"
 *               body:
 *                 type: string
 *                 description: Notification body
 *                 example: "System maintenance scheduled"
 *               data:
 *                 type: object
 *                 description: Additional data to send
 *     responses:
 *       200:
 *         description: Notifications sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/send-multiple', [
  body('tokens').isArray({ min: 1 }).withMessage('At least one token is required'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('body').notEmpty().withMessage('Notification body is required')
], notificationController().sendToMultipleDevices);

/**
 * @swagger
 * /notification/send-topic:
 *   post:
 *     summary: Send notification to a topic
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - title
 *               - body
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Topic name
 *                 example: "technicians"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "System Update"
 *               body:
 *                 type: string
 *                 description: Notification body
 *                 example: "System maintenance scheduled"
 *               data:
 *                 type: object
 *                 description: Additional data to send
 *     responses:
 *       200:
 *         description: Topic notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/send-topic', [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('body').notEmpty().withMessage('Notification body is required')
], notificationController().sendToTopic);

/**
 * @swagger
 * /notification/subscribe:
 *   post:
 *     summary: Subscribe devices to a topic
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokens
 *               - topic
 *             properties:
 *               tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of FCM tokens
 *                 example: ["token1", "token2"]
 *               topic:
 *                 type: string
 *                 description: Topic name
 *                 example: "technicians"
 *     responses:
 *       200:
 *         description: Successfully subscribed to topic
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/subscribe', [
  body('tokens').isArray({ min: 1 }).withMessage('At least one token is required'),
  body('topic').notEmpty().withMessage('Topic is required')
], notificationController().subscribeToTopic);

/**
 * @swagger
 * /notification/unsubscribe:
 *   post:
 *     summary: Unsubscribe devices from a topic
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokens
 *               - topic
 *             properties:
 *               tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of FCM tokens
 *                 example: ["token1", "token2"]
 *               topic:
 *                 type: string
 *                 description: Topic name
 *                 example: "technicians"
 *     responses:
 *       200:
 *         description: Successfully unsubscribed from topic
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/unsubscribe', [
  body('tokens').isArray({ min: 1 }).withMessage('At least one token is required'),
  body('topic').notEmpty().withMessage('Topic is required')
], notificationController().unsubscribeFromTopic);

/**
 * @swagger
 * /notification/task-assignment:
 *   post:
 *     summary: Send task assignment notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technicianToken
 *               - taskData
 *             properties:
 *               technicianToken:
 *                 type: string
 *                 description: FCM token of the technician
 *                 example: "fcm_token_here"
 *               taskData:
 *                 type: object
 *                 description: Task information
 *                 example: {"taskId": "123", "title": "Repair AC", "customer": "John Doe"}
 *     responses:
 *       200:
 *         description: Task assignment notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/task-assignment', [
  body('technicianToken').notEmpty().withMessage('Technician token is required'),
  body('taskData').isObject().withMessage('Task data is required')
], notificationController().sendTaskAssignmentNotification);

/**
 * @swagger
 * /notification/task-completion:
 *   post:
 *     summary: Send task completion notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminToken
 *               - taskData
 *             properties:
 *               adminToken:
 *                 type: string
 *                 description: FCM token of the admin
 *                 example: "fcm_token_here"
 *               taskData:
 *                 type: object
 *                 description: Task information
 *                 example: {"taskId": "123", "title": "Repair AC", "technician": "John Doe"}
 *     responses:
 *       200:
 *         description: Task completion notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/task-completion', [
  body('adminToken').notEmpty().withMessage('Admin token is required'),
  body('taskData').isObject().withMessage('Task data is required')
], notificationController().sendTaskCompletionNotification);

/**
 * @swagger
 * /notification/new-customer:
 *   post:
 *     summary: Send new customer notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminTokens
 *               - customerData
 *             properties:
 *               adminTokens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of admin FCM tokens
 *                 example: ["token1", "token2"]
 *               customerData:
 *                 type: object
 *                 description: Customer information
 *                 example: {"customerId": "123", "name": "John Doe", "phone": "+1234567890"}
 *     responses:
 *       200:
 *         description: New customer notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/new-customer', [
  body('adminTokens').isArray({ min: 1 }).withMessage('At least one admin token is required'),
  body('customerData').isObject().withMessage('Customer data is required')
], notificationController().sendNewCustomerNotification);

/**
 * @swagger
 * /notification/bill-generation:
 *   post:
 *     summary: Send bill generation notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerToken
 *               - billData
 *             properties:
 *               customerToken:
 *                 type: string
 *                 description: FCM token of the customer
 *                 example: "fcm_token_here"
 *               billData:
 *                 type: object
 *                 description: Bill information
 *                 example: {"billId": "123", "amount": 150.00, "dueDate": "2024-01-15"}
 *     responses:
 *       200:
 *         description: Bill generation notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
Router.post('/bill-generation', [
  body('customerToken').notEmpty().withMessage('Customer token is required'),
  body('billData').isObject().withMessage('Bill data is required')
], notificationController().sendBillGenerationNotification);

module.exports = Router; 