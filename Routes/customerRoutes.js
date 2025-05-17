const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");
const customerController = require("../http/Controllers/customerController");

// Middleware to check if the user is authenticated
const mobileMiddleware = require("../http/middlewares/mobileMiddleware");

// Customer create
Router.post("/create", mobileMiddleware, customerController().createCustomer);


module.exports = Router;