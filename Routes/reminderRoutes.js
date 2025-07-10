const express = require("express");
const Router = express.Router();
const { body, param, validationResult } = require("express-validator");
const reminderController = require("../http/Controllers/reminderController");
const mongoose = require("mongoose");

// Middleware to check if the user is authenticated
const mobileMiddleware = require("../http/middlewares/mobileMiddleware");
const authMiddleware = require("../http/middlewares/authMiddleware");

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array()
        });
    }
    next();
};

// ObjectId validation middleware
const validateObjectId = (req, res, next) => {
    const { entityId, customerId, serviceId } = req.params;
    const idToValidate = entityId || customerId || serviceId;

    if (idToValidate && !mongoose.Types.ObjectId.isValid(idToValidate)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};

// Get reminders for a specific entity (customer or service)
Router.get("/:entityType/:entityId",
    [
        param('entityType')
            .isIn(['CUSTOMER', 'SERVICE'])
            .withMessage('Entity type must be either CUSTOMER or SERVICE'),
        param('entityId')
            .isMongoId()
            .withMessage('Entity ID must be a valid MongoDB ObjectId')
    ],
    handleValidationErrors,
    validateObjectId,
    mobileMiddleware,
    reminderController().getReminders
);

// Add reminder to customer
Router.post("/customer",
    mobileMiddleware,
    [
        body('customerId')
            .notEmpty()
            .withMessage('Customer ID is required')
            .isMongoId()
            .withMessage('Customer ID must be a valid MongoDB ObjectId'),
        body('type')
            .notEmpty()
            .withMessage('Reminder type is required')
            .isIn(['TEXT', 'AUDIO'])
            .withMessage('Type must be either TEXT or AUDIO'),
        body('date')
            .notEmpty()
            .withMessage('Date is required')
            .isISO8601()
            .withMessage('Date must be a valid ISO 8601 date'),
        body('message')
            .if(body('type').equals('TEXT'))
            .notEmpty()
            .withMessage('Message is required for TEXT type reminders')
            .isLength({ min: 1, max: 500 })
            .withMessage('Message must be between 1 and 500 characters'),
        body('audioUrl')
            .if(body('type').equals('AUDIO'))
            .notEmpty()
            .withMessage('Audio URL is required for AUDIO type reminders')
            .isURL()
            .withMessage('Audio URL must be a valid URL')
    ],
    handleValidationErrors,
    reminderController().addCustomerReminder
);

// Add reminder to service
Router.post("/service",
    mobileMiddleware,
    [
        body('serviceId')
            .notEmpty()
            .withMessage('Service ID is required')
            .isMongoId()
            .withMessage('Service ID must be a valid MongoDB ObjectId'),
        body('type')
            .notEmpty()
            .withMessage('Reminder type is required')
            .isIn(['TEXT', 'AUDIO'])
            .withMessage('Type must be either TEXT or AUDIO'),
        body('date')
            .notEmpty()
            .withMessage('Date is required')
            .isISO8601()
            .withMessage('Date must be a valid ISO 8601 date'),
        body('message')
            .if(body('type').equals('TEXT'))
            .notEmpty()
            .withMessage('Message is required for TEXT type reminders')
            .isLength({ min: 1, max: 500 })
            .withMessage('Message must be between 1 and 500 characters'),
        body('audioUrl')
            .if(body('type').equals('AUDIO'))
            .notEmpty()
            .withMessage('Audio URL is required for AUDIO type reminders')
            .isURL()
            .withMessage('Audio URL must be a valid URL')
    ],
    handleValidationErrors,
    reminderController().addServiceReminder
);

// Delete reminder from customer
Router.delete("/customer/:customerId/:reminderIndex",
    [
        param('customerId')
            .isMongoId()
            .withMessage('Customer ID must be a valid MongoDB ObjectId'),
        param('reminderIndex')
            .isInt({ min: 0 })
            .withMessage('Reminder index must be a non-negative integer')
    ],
    handleValidationErrors,
    validateObjectId,
    mobileMiddleware,
    reminderController().deleteCustomerReminder
);

// Delete reminder from service
Router.delete("/service/:serviceId/:reminderIndex",
    [
        param('serviceId')
            .isMongoId()
            .withMessage('Service ID must be a valid MongoDB ObjectId'),
        param('reminderIndex')
            .isInt({ min: 0 })
            .withMessage('Reminder index must be a non-negative integer')
    ],
    handleValidationErrors,
    validateObjectId,
    mobileMiddleware,
    reminderController().deleteServiceReminder
);

module.exports = Router; 