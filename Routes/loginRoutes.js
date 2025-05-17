const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");
const loginController = require("../http/Controllers/loginController");
const authMiddleware = require("../http/middlewares/authMiddleware");

// Route for user login
Router.post(
  "/login",
  [
    body("username", "Username cannot be blank").exists(),
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

// Router.post("/logout", authMiddleware, loginController().userLogout);

module.exports = Router;
