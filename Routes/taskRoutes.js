const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");
const taskController = require("../http/Controllers/taskController");
const mongoose = require("mongoose");

// Middleware to check if the user is authenticated
const mobileMiddleware = require("../http/middlewares/mobileMiddleware");
const authMiddleware = require("../http/middlewares/authMiddleware");
const firebaseAuthMiddleware = require("../http/middlewares/firebaseAuthMiddleware");

// ObjectId validation middleware
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};

// Get all tasks for technician
Router.get("/getAll", mobileMiddleware, taskController().getTasks);

// Get single task by ID
Router.get("/getOne/:id", mobileMiddleware, validateObjectId, taskController().getTaskById);

// Create new task
Router.post("/sharetask", mobileMiddleware, [
    body('taskId').notEmpty().withMessage('Task ID is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required')
], taskController().shareTask);

// Update task status
Router.patch("/updateTaskStatus/:id", mobileMiddleware, validateObjectId, [
    body('status').isIn(['PENDING', 'COMPLETED']).withMessage('Status must be PENDING or COMPLETED')
], taskController().updateTaskStatus);

// Update task details
Router.put("/:id", mobileMiddleware, validateObjectId, [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('sharedWith').optional().isMongoId().withMessage('Invalid sharedWith format')
], taskController().updateTask);

// Add services to task
Router.post("/:id/services", mobileMiddleware, validateObjectId, [
    body('serviceIds').isArray({ min: 1 }).withMessage('At least one serviceId is required'),
    body('serviceIds.*').isMongoId().withMessage('Invalid serviceId format')
], taskController().addServicesToTask);

// Remove services from task
Router.delete("/:id/services", mobileMiddleware, validateObjectId, [
    body('serviceIds').isArray({ min: 1 }).withMessage('At least one serviceId is required'),
    body('serviceIds.*').isMongoId().withMessage('Invalid serviceId format')
], taskController().removeServicesFromTask);

// Delete task
Router.delete("/:id", mobileMiddleware, validateObjectId, taskController().deleteTask);

module.exports = Router; 