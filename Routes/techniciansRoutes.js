const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");
const techniciansController = require("../http/Controllers/techniciansController");

// Middleware to check if the user is authenticated
const mobileMiddleware = require("../http/middlewares/mobileMiddleware");


// // Validation rules for technician registration
const validateTechnicianRegistration = [
    body("fullName")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please enter full name")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Full name must contain only letters and spaces"),

    body("contactNumber")
        .notEmpty()
        .withMessage("Contact number is required")
        .matches(/^[0-9]{10,15}$/)
        .withMessage("Contact number must be between 10 and 15 digits"),

    // body("emailAddress")
    //     .notEmpty()
    //     .withMessage("Email address is required")
    //     .isEmail()
    //     .withMessage("Enter a valid email address"),

    // body("accountPassword")
    //     .notEmpty()
    //     .withMessage("Password is required")
    //     .isLength({ min: 6 })
    //     .withMessage("Password must be at least 6 characters long"),

    body("gender")
        .notEmpty()
        .withMessage("Gender is required")
        .isIn(["MALE", "FEMALE", "OTHER"])
        .withMessage("Gender must be one of 'MALE', 'FEMALE', or 'OTHER'"),

    body("dateOfBirth")
        .optional()
        .isISO8601()
        .withMessage("Date of birth must be a valid date in ISO 8601 format"),

    body("countryName")
        .notEmpty()
        .withMessage("Country name is required")
        .isString()
        .withMessage("Country name must be a string"),

    body("stateName")
        .notEmpty()
        .withMessage("State name is required")
        .isString()
        .withMessage("State name must be a string"),

    body("cityName")
        .notEmpty()
        .withMessage("City name is required")
        .isString()
        .withMessage("City name must be a string"),

    body("postalCode")
        .optional()
        .matches(/^(\d{4}|\d{6})$/)
        .withMessage("Postal code must be either 4 or 6 digits"),

    body("countryCode")
        .notEmpty()
        .withMessage("Country code is required")
        .matches(/^\+[0-9]{1,4}$/)
        .withMessage("Country code must be in the format '+<digits>'"),

    body("address")
        .notEmpty()
        .withMessage("Address is required")
        .isString()
        .withMessage("Address must be a string"),
];

// Technician registration route
Router.post("/register", validateTechnicianRegistration, techniciansController().techniciansRegister);
// Technician login route
Router.post("/login", [
    body("contactNumber", "contactNumber can not be blank").exists(),
], techniciansController().techniciansLogin);
// Technician check route
Router.post("/check", techniciansController().techniciansCheck);
// Technician logout route
Router.post("/logout", mobileMiddleware, [
    body("refresh_token", "Refresh Token can not be blank").exists(),],
    techniciansController().techniciansLogout);
//Technician refresh token route
Router.post("/refreshToken",
    techniciansController().techniciansRefreshToken);
// Technician forgot password route
Router.post("/forgot-password", mobileMiddleware, [
    body("contactNumber", "contactNumber can not be blank").exists(),
], techniciansController().techniciansForgotPassword);
// Technician reset password route
Router.post("/reset-password", mobileMiddleware, [
    body("contactNumber", "contactNumber can not be blank").exists(),
    body("otp", "otp can not be blank").exists(),
    body("newPassword", "newPassword can not be blank").exists(),
], techniciansController().techniciansResetPassword);
// Technician verify OTP route
Router.post("/verify-otp", [
    body("contactNumber", "contactNumber can not be blank").exists(),
    body("otp", "otp can not be blank").exists(),
], techniciansController().techniciansVerifyOTP);

// Get technicians list with pagination and search
Router.get("/list", techniciansController().techniciansList);


module.exports = Router;