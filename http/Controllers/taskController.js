require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError } = require("../../helpers/helperFunc");
const Task = require("../../Models/Task");
const Service = require("../../Models/Service");
const Technician = require("../../Models/Technician");

const taskController = () => {
    return {
        // Get all tasks for a technician
        getTasks: async (req, res) => {
            try {
                const technicianId = req.technician?._id || req.user?.id;
                const { status } = req.query;

                const query = { technicianId };

                if (status && ['PENDING', 'COMPLETED'].includes(status)) {
                    query.status = status;
                }

                const tasks = await Task.find(query)
                    .populate('services', 'serviceNumber category status scheduledDate customerId')
                    .populate('sharedWith', 'fullName contactNumber')
                    .sort({ createdAt: -1 });

                sendSuccessResponse(200, res, "Tasks fetched successfully", tasks);
            } catch (error) {
                console.log(error);
                logError(error);
                handleServerError(500, res, "Failed to fetch tasks");
            }
        },

        // Get a single task by ID
        getTaskById: async (req, res) => {
            try {
                const { id } = req.params;
                const technicianId = req.technician?._id || req.user?.id;

                const task = await Task.findOne({ _id: id, technicianId })
                    .populate('services', 'serviceNumber category status scheduledDate customerId partsUsed')
                    .populate('sharedWith', 'fullName contactNumber');

                if (!task) {
                    return sendErrorResponse(404, res, "Task not found");
                }

                sendSuccessResponse(200, res, "Task fetched successfully", task);
            } catch (error) {
                console.log(error);
                logError(error);
                handleServerError(500, res, "Failed to fetch task");
            }
        },

        // share task
        shareTask: async (req, res) => {
            try {
                const { taskId, phoneNumber } = req.body;
                const currentTechId = req.technician?._id || req.user?.id;

                if (!taskId || !phoneNumber) {
                    return sendErrorResponse(400, res, "taskId and phoneNumber are required");
                }

                // Find the task and verify ownership
                const task = await Task.findOne({ _id: taskId, technicianId: currentTechId });
                if (!task) {
                    return sendErrorResponse(404, res, "Task not found");
                }

                if (task.sharedWith) {
                    return sendErrorResponse(400, res, "Task already shared");
                }

                // Find technician to share with
                const targetTech = await Technician.findOne({ contactNumber: phoneNumber });
                if (!targetTech) {
                    return sendErrorResponse(404, res, "Technician to share with not found");
                }

                // Share the task
                task.sharedWith = targetTech._id;
                await task.save();

                sendSuccessResponse(200, res, "Task shared successfully", task);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Update task status
        updateTaskStatus: async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;
                const technicianId = req.technician?._id || req.user?.id;

                if (!status || !['PENDING', 'COMPLETED'].includes(status)) {
                    return sendErrorResponse(400, res, "Valid status (PENDING or COMPLETED) is required");
                }

                const task = await Task.findOne({ _id: id, technicianId });

                if (!task) {
                    return sendErrorResponse(404, res, "Task not found");
                }

                task.status = status;
                await task.save();

                const updatedTask = await Task.findById(task._id)
                    .populate('services', 'serviceNumber category status scheduledDate customerId')
                    .populate('sharedWith', 'fullName contactNumber');

                sendSuccessResponse(200, res, "Task status updated successfully", updatedTask);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to update task status");
            }
        },

        // Update task details
        updateTask: async (req, res) => {
            try {
                const { id } = req.params;
                const { title, sharedWith } = req.body;
                const technicianId = req.technician?._id || req.user?.id;

                const task = await Task.findOne({ _id: id, technicianId });

                if (!task) {
                    return sendErrorResponse(404, res, "Task not found");
                }

                if (title) {
                    task.title = title;
                }

                if (sharedWith !== undefined) {
                    task.sharedWith = sharedWith;
                }

                await task.save();

                const updatedTask = await Task.findById(task._id)
                    .populate('services', 'serviceNumber category status scheduledDate customerId')
                    .populate('sharedWith', 'fullName contactNumber');

                sendSuccessResponse(200, res, "Task updated successfully", updatedTask);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to update task");
            }
        },

        // Add services to existing task
        addServicesToTask: async (req, res) => {
            try {
                const { id } = req.params;
                const { serviceIds } = req.body;
                const technicianId = req.technician?._id || req.user?.id;

                if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
                    return sendErrorResponse(400, res, "At least one serviceId is required");
                }

                const task = await Task.findOne({ _id: id, technicianId });

                if (!task) {
                    return sendErrorResponse(404, res, "Task not found");
                }

                // Fetch & validate services
                const services = await Service.find({
                    _id: { $in: serviceIds },
                    technicianId,
                    taskId: { $exists: false }, // not already assigned
                });

                if (services.length !== serviceIds.length) {
                    return sendErrorResponse(400, res, "Some services are invalid, belong to other technician, or already assigned to a task");
                }

                // Add services to task
                task.services.push(...serviceIds);
                await task.save();

                // Update services with taskId
                await Service.updateMany(
                    { _id: { $in: serviceIds } },
                    { taskId: task._id }
                );

                const updatedTask = await Task.findById(task._id)
                    .populate('services', 'serviceNumber category status scheduledDate customerId')
                    .populate('sharedWith', 'fullName contactNumber');

                sendSuccessResponse(200, res, "Services added to task successfully", updatedTask);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to add services to task");
            }
        },

        // Remove services from task
        removeServicesFromTask: async (req, res) => {
            try {
                const { id } = req.params;
                const { serviceIds } = req.body;
                const technicianId = req.technician?._id || req.user?.id;

                if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
                    return sendErrorResponse(400, res, "At least one serviceId is required");
                }

                const task = await Task.findOne({ _id: id, technicianId });

                if (!task) {
                    return sendErrorResponse(404, res, "Task not found");
                }

                // Remove services from task
                task.services = task.services.filter(serviceId => !serviceIds.includes(serviceId.toString()));
                await task.save();

                // Remove taskId from services
                await Service.updateMany(
                    { _id: { $in: serviceIds } },
                    { $unset: { taskId: 1 } }
                );

                const updatedTask = await Task.findById(task._id)
                    .populate('services', 'serviceNumber category status scheduledDate customerId')
                    .populate('sharedWith', 'fullName contactNumber');

                sendSuccessResponse(200, res, "Services removed from task successfully", updatedTask);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to remove services from task");
            }
        },

        // Delete task
        deleteTask: async (req, res) => {
            try {
                const { id } = req.params;
                const technicianId = req.technician?._id || req.user?.id;

                const task = await Task.findOne({ _id: id, technicianId });

                if (!task) {
                    return sendErrorResponse(404, res, "Task not found");
                }

                // Remove taskId from all services in this task
                await Service.updateMany(
                    { _id: { $in: task.services } },
                    { $unset: { taskId: 1 } }
                );

                // Delete the task
                await Task.findByIdAndDelete(id);

                sendSuccessResponse(200, res, "Task deleted successfully");
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to delete task");
            }
        }

    }
}

module.exports = taskController; 