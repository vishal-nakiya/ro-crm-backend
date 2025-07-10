const express = require("express");
const Router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const complaintController = require("../http/Controllers/complaintController");
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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};

// Create complaint
Router.post("/create",
    mobileMiddleware,
    [
        body('customerId')
            .notEmpty()
            .withMessage('Customer ID is required')
            .isMongoId()
            .withMessage('Customer ID must be a valid MongoDB ObjectId'),
        body('text')
            .notEmpty()
            .withMessage('Complaint text is required')
            .isLength({ min: 10, max: 1000 })
            .withMessage('Complaint text must be between 10 and 1000 characters')
    ],
    handleValidationErrors,
    complaintController().createComplaint
);

// Get all complaints for the authenticated technician
Router.get("/getall", mobileMiddleware, complaintController().getComplaints);

// Get complaints by status
Router.get("/getbystatus",
    mobileMiddleware,
    [
        query('status')
            .notEmpty()
            .withMessage('Status is required')
            .isIn(['OPEN', 'CLOSED'])
            .withMessage('Status must be either OPEN or CLOSED')
    ],
    handleValidationErrors,
    complaintController().getComplaintsByStatus
);

// Get a single complaint by ID
Router.get("/getOne/:id",
    validateObjectId,
    mobileMiddleware,
    complaintController().getComplaintById
);

// Update complaint status
Router.patch("/status/:id",
    validateObjectId,
    mobileMiddleware,
    [
        body('status')
            .notEmpty()
            .withMessage('Status is required')
            .isIn(['OPEN', 'CLOSED'])
            .withMessage('Status must be either OPEN or CLOSED')
    ],
    handleValidationErrors,
    complaintController().updateComplaintStatus
);

// Delete complaint (soft delete)
Router.delete("/delete/:id", validateObjectId, mobileMiddleware, complaintController().deleteComplaint);

module.exports = Router; 