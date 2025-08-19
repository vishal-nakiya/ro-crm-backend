const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");
const loginController = require("../http/Controllers/loginController");
const authMiddleware = require("../http/middlewares/authMiddleware");

// Route for admin registration
Router.post(
  "/register",
  [
    body("username", "Username cannot be blank").exists().isLength({ min: 3, max: 50 }),
    body("email", "Email cannot be blank").isEmail().normalizeEmail(),
    body("password", "Password cannot be blank").isLength({ min: 6 }),
    body("mobile_number", "Mobile number cannot be blank").matches(/^[0-9]{10,15}$/),
    body("designation", "Designation cannot be blank").optional(),
  ],
  loginController().adminRegister
);

// Route for user login
Router.post(
  "/login",
  [
    body("email", "email cannot be blank").exists(),
    body("password", "Password cannot be blank").exists(),
  ],
  loginController().userLogin
);

// Route for refreshing access token
Router.post(
  "/token",
  [
    body("refresh_token", "Refresh token cannot be blank").exists(),
  ],
  loginController().getAccessToken
);

Router.get("/logout", authMiddleware, loginController().userLogout);

module.exports = Router;
