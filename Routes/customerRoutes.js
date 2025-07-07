const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");
const customerController = require("../http/Controllers/customerController");
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

// Customer create
Router.post("/create", mobileMiddleware, customerController().createCustomer);

// Get customers by status
Router.get("/getbystatus", customerController().getCustomers);

// Update customer
Router.put("/update/:id", validateObjectId, customerController().updateCustomer);

// Update customer status
Router.put("/status/:id", validateObjectId, customerController().updateCustomerStatus);

// Delete customer
Router.delete("/delete/:id", validateObjectId, customerController().deleteCustomer);

// Get customer by ID
Router.get("/getOne/:id", validateObjectId, customerController().getCustomerById);

module.exports = Router;