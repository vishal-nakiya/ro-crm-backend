const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");
const billController = require("../http/Controllers/billController");
const mongoose = require("mongoose");

// Middleware to check if the user is authenticated
const mobileMiddleware = require("../http/middlewares/mobileMiddleware");
const authMiddleware = require("../http/middlewares/authMiddleware");

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

// Create new bill
Router.post("/create", mobileMiddleware, [
    body('customerId').isMongoId().withMessage('Valid customerId is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.description').notEmpty().withMessage('Item description is required'),
    body('items.*.amount').isFloat({ min: 0.01 }).withMessage('Item amount must be a positive number'),
    body('paymentMethod').optional().isIn(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']).withMessage('Invalid payment method'),
    body('notes').optional().isString().withMessage('Notes must be a string')
], billController().createBill);

// Get all bills for technician
Router.get("/getAll", mobileMiddleware, billController().getAllBills);

// Get bills for a specific customer
Router.get("/getByCustomer/:id", mobileMiddleware, validateObjectId, billController().getBillsByCustomer);

// Get single bill by ID
Router.get("/getOne/:id", mobileMiddleware, validateObjectId, billController().getBillById);

// Update bill status
Router.patch("/:id/status", mobileMiddleware, validateObjectId, [
    body('status').optional().isIn(['PENDING', 'PAID', 'CANCELLED']).withMessage('Invalid status'),
    body('paymentMethod').optional().isIn(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']).withMessage('Invalid payment method'),
    body('notes').optional().isString().withMessage('Notes must be a string')
], billController().updateBillStatus);

// Generate PDF for a bill
Router.get("/pdf", mobileMiddleware, billController().generateBillPDF);

// Delete bill (soft delete)
Router.delete("/:id", mobileMiddleware, validateObjectId, billController().deleteBill);

module.exports = Router; 