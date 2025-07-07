const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");
const serviceController = require("../http/Controllers/serviceController");
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

// Service create
Router.get("/getAll", mobileMiddleware, serviceController().getServices);

// Complete service
Router.post("/complete", mobileMiddleware, serviceController().completeService);

// Add service reminder
Router.post("/reminder", mobileMiddleware, serviceController().addServiceReminder);

// Create batch task
Router.post("/batchtask", mobileMiddleware, serviceController().createBatchTask);


module.exports = Router;