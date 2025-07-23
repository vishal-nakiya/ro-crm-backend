require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError } = require("../../helpers/helperFunc");
const Customer = require("../../Models/Customer");
const Service = require("../../Models/Service");
const Task = require("../../Models/Task");

const dashboardController = () => {
    return {
        // Get comprehensive dashboard details for logged-in technician
        dashboardDetails: async (req, res) => {
            try {
                const technicianId = req.user._id;
                if (!technicianId) {
                    return sendErrorResponse(401, res, "Unauthorized");
                }

                // Get all customers for this technician
                const allCustomers = await Customer.find({
                    technicianId: technicianId,
                    deletedAt: null
                });

                // Get active customers (status: ACTIVE)
                const activeCustomers = await Customer.find({
                    technicianId: technicianId,
                    status: 'ACTIVE',
                    deletedAt: null
                });

                // Get pending services for this technician
                const pendingServices = await Service.find({
                    technicianId: technicianId,
                    status: 'PENDING',
                    deletedAt: null
                });

                // Get completed services for this technician
                const completedServices = await Service.find({
                    technicianId: technicianId,
                    status: 'COMPLETED',
                    deletedAt: null
                });

                // Calculate completion rate
                const totalServices = pendingServices.length + completedServices.length;
                const completionRate = totalServices > 0 ? Math.round((completedServices.length / totalServices) * 100) : 0;

                // Get services grouped by customer area
                const servicesByArea = await Service.aggregate([
                    {
                        $match: {
                            technicianId: technicianId,
                            deletedAt: null
                        }
                    },
                    {
                        $lookup: {
                            from: 'customers',
                            localField: 'customerId',
                            foreignField: '_id',
                            as: 'customer'
                        }
                    },
                    {
                        $unwind: '$customer'
                    },
                    {
                        $group: {
                            _id: '$customer.area',
                            services: { $push: '$$ROOT' },
                            serviceCount: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            areaName: '$_id',
                            services: 1,
                            serviceCount: 1,
                            _id: 0
                        }
                    },
                    {
                        $sort: { serviceCount: -1 }
                    }
                ]);

                // Get notification count (you can implement this based on your notification system)
                // For now, using a placeholder
                const notificationCount = 3; // This should be fetched from your notification system

                const dashboardData = {
                    metrics: {
                        allCustomers: allCustomers.length,
                        activeCustomers: activeCustomers.length,
                        pendingServices: pendingServices.length,
                        completionRate: `${completionRate}%`
                    },
                    tasks: servicesByArea.map(area => ({
                        areaName: area.areaName || 'Unknown Area',
                        serviceCount: area.serviceCount,
                        services: area.services.map(service => ({
                            id: service._id,
                            serviceNumber: service.serviceNumber,
                            status: service.status,
                            scheduledDate: service.scheduledDate,
                            category: service.category
                        }))
                    })),
                    notificationCount: notificationCount
                };

                sendSuccessResponse(200, res, "Dashboard details fetched successfully", dashboardData);
            } catch (error) {
                console.error('Dashboard Details Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },
    };
};

module.exports = dashboardController; 