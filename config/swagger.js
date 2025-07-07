const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'RO CRM Backend API',
            version: '1.0.0',
            description: 'API documentation for RO CRM Backend - A comprehensive CRM system for managing customers, services, tasks, bills, and technicians.',
            contact: {
                name: 'API Support',
                email: 'support@rocrm.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'https://your-production-domain.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token in the format: Bearer <token>'
                },
                CookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                    description: 'Authentication token stored in cookies'
                }
            },
            schemas: {
                Customer: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Customer ID' },
                        name: { type: 'string', description: 'Customer name' },
                        email: { type: 'string', format: 'email', description: 'Customer email' },
                        phone: { type: 'string', description: 'Customer phone number' },
                        address: { type: 'string', description: 'Customer address' },
                        status: { type: 'string', enum: ['active', 'inactive'], description: 'Customer status' },
                        createdAt: { type: 'string', format: 'date-time', description: 'Creation date' },
                        updatedAt: { type: 'string', format: 'date-time', description: 'Last update date' }
                    }
                },
                Service: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Service ID' },
                        name: { type: 'string', description: 'Service name' },
                        description: { type: 'string', description: 'Service description' },
                        price: { type: 'number', description: 'Service price' },
                        status: { type: 'string', enum: ['active', 'inactive'], description: 'Service status' }
                    }
                },
                Task: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Task ID' },
                        title: { type: 'string', description: 'Task title' },
                        description: { type: 'string', description: 'Task description' },
                        status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], description: 'Task status' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Task priority' },
                        assignedTo: { type: 'string', description: 'Technician ID assigned to task' },
                        customerId: { type: 'string', description: 'Customer ID' },
                        dueDate: { type: 'string', format: 'date-time', description: 'Task due date' }
                    }
                },
                Bill: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Bill ID' },
                        customerId: { type: 'string', description: 'Customer ID' },
                        services: { type: 'array', items: { type: 'string' }, description: 'Array of service IDs' },
                        totalAmount: { type: 'number', description: 'Total bill amount' },
                        status: { type: 'string', enum: ['pending', 'paid', 'overdue'], description: 'Bill status' },
                        dueDate: { type: 'string', format: 'date-time', description: 'Bill due date' }
                    }
                },
                Technician: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Technician ID' },
                        name: { type: 'string', description: 'Technician name' },
                        email: { type: 'string', format: 'email', description: 'Technician email' },
                        phone: { type: 'string', description: 'Technician phone number' },
                        specialization: { type: 'string', description: 'Technician specialization' },
                        status: { type: 'string', enum: ['active', 'inactive'], description: 'Technician status' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', description: 'User email' },
                        password: { type: 'string', description: 'User password' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', description: 'Login success status' },
                        message: { type: 'string', description: 'Response message' },
                        token: { type: 'string', description: 'JWT authentication token' },
                        user: { type: 'object', description: 'User information' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', description: 'Error message' }
                    }
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'Login and authentication endpoints' },
            { name: 'Customers', description: 'Customer management operations' },
            { name: 'Services', description: 'Service management operations' },
            { name: 'Tasks', description: 'Task management operations' },
            { name: 'Bills', description: 'Bill management operations' },
            { name: 'Technicians', description: 'Technician management operations' }
        ]
    },
    apis: [
        './Routes/*.js',
        './http/Controllers/*.js',
        './api/index.js'
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 