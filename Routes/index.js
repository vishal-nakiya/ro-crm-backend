const express = require('express');
const Router = express.Router();
const requireDirectory = require('require-directory');

// Load all route modules in current directory
const routes = requireDirectory(module, '.');

// Define route exclusions (optional)
const EXCLUDE_ROUTES = ['loginRoutes', 'techniciansRoutes'];

// Dynamic loader
for (const key in routes) {
    if (!Object.prototype.hasOwnProperty.call(routes, key)) continue;

    const routeFile = routes[key];
    const fileName = key;

    // Skip explicitly excluded routes
    if (EXCLUDE_ROUTES.includes(fileName)) continue;

    // Remove 'Routes' suffix from URL path if present
    const routeName = fileName.replace(/Routes$/, '').toLowerCase();
    Router.use(`/api/${routeName}`, routeFile);
}

// Manually include excluded/special-case routes
Router.use('/admin', require('./loginRoutes'));
Router.use('/auth', require('./techniciansRoutes'));


module.exports = Router;
