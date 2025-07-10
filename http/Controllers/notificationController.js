const notificationService = require('../../services/notificationService');
const Technician = require('../../Models/Technician');
const logError = require('../../logger/log');
const { validationResult } = require('express-validator');

const notificationController = () => {
    return {
        // Update FCM token for authenticated technician
        updateFcmToken: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { fcmToken } = req.body;
                const technicianId = req.user._id; // From mobileMiddleware

                // Update technician's FCM token
                await Technician.findByIdAndUpdate(technicianId, { fcmToken });

                res.status(200).json({
                    success: true,
                    message: 'FCM token updated successfully'
                });
            } catch (error) {
                logError(error, req);
                console.log('Update FCM token error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to update FCM token',
                    error: error.message
                });
            }
        },

        // Send notification to a single device
        sendToDevice: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { token, title, body, data } = req.body;

                const result = await notificationService.sendToDevice(token, {
                    title,
                    body,
                    data
                });

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('Send notification error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to send notification',
                    error: error.message
                });
            }
        },

        // Send notification to multiple devices
        sendToMultipleDevices: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { tokens, title, body, data } = req.body;

                const result = await notificationService.sendToMultipleDevices(tokens, {
                    title,
                    body,
                    data
                });

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('Multicast notification error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to send multicast notification',
                    error: error.message
                });
            }
        },

        // Send notification to a topic
        sendToTopic: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { topic, title, body, data } = req.body;

                const result = await notificationService.sendToTopic(topic, {
                    title,
                    body,
                    data
                });

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('Topic notification error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to send topic notification',
                    error: error.message
                });
            }
        },

        // Subscribe devices to a topic
        subscribeToTopic: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { tokens, topic } = req.body;

                const result = await notificationService.subscribeToTopic(tokens, topic);

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('Subscribe to topic error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to subscribe to topic',
                    error: error.message
                });
            }
        },

        // Unsubscribe devices from a topic
        unsubscribeFromTopic: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { tokens, topic } = req.body;

                const result = await notificationService.unsubscribeFromTopic(tokens, topic);

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('Unsubscribe from topic error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to unsubscribe from topic',
                    error: error.message
                });
            }
        },

        // Send task assignment notification
        sendTaskAssignmentNotification: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { technicianToken, taskData } = req.body;

                const result = await notificationService.sendTaskAssignmentNotification(technicianToken, taskData);

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('Task assignment notification error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to send task assignment notification',
                    error: error.message
                });
            }
        },

        // Send task completion notification
        sendTaskCompletionNotification: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { adminToken, taskData } = req.body;

                const result = await notificationService.sendTaskCompletionNotification(adminToken, taskData);

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('Task completion notification error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to send task completion notification',
                    error: error.message
                });
            }
        },

        // Send new customer notification
        sendNewCustomerNotification: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { adminTokens, customerData } = req.body;

                const result = await notificationService.sendNewCustomerNotification(adminTokens, customerData);

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('New customer notification error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to send new customer notification',
                    error: error.message
                });
            }
        },

        // Send bill generation notification
        sendBillGenerationNotification: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const error = errors.array().map((x) => {
                        return {
                            field: x.param,
                            message: x.msg,
                        };
                    });
                    return res.status(400).json({
                        error,
                        success: false
                    });
                }

                const { customerToken, billData } = req.body;

                const result = await notificationService.sendBillGenerationNotification(customerToken, billData);

                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                logError(error, req);
                console.log('Bill generation notification error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to send bill generation notification',
                    error: error.message
                });
            }
        }
    };
};

module.exports = notificationController; 