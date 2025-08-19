require("dotenv").config();
const logError = require("../../logger/log");
const { sendSuccessResponse, sendErrorResponse, handleServerError } = require("../../helpers/helperFunc");
const Customer = require("../../Models/Customer");
const Service = require("../../Models/Service");
const Bill = require("../../Models/Bill");
const Technician = require("../../Models/Technician");

const adminDashboardController = () => {
    return {
        // Get comprehensive admin dashboard KPIs
        getDashboardKPIs: async (req, res) => {
            try {
                // Get total users (customers)
                const totalUsers = await Customer.countDocuments({ deletedAt: null });

                // Get active users (customers with ACTIVE status)
                const activeUsers = await Customer.countDocuments({
                    status: 'ACTIVE',
                    deletedAt: null
                });

                // Get total revenue from all paid bills
                const revenueData = await Bill.aggregate([
                    {
                        $match: {
                            status: 'PAID',
                            deletedAt: null
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$total' },
                            billCount: { $sum: 1 }
                        }
                    }
                ]);

                const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
                const totalBills = revenueData.length > 0 ? revenueData[0].billCount : 0;

                // Get services done (completed services)
                const servicesDone = await Service.countDocuments({
                    status: 'COMPLETED',
                    deletedAt: null
                });

                // Get total pending services
                const pendingServices = await Service.countDocuments({
                    status: 'PENDING',
                    deletedAt: null
                });

                // Get total technicians
                const totalTechnicians = await Technician.countDocuments({ deletedAt: null });

                // Get monthly revenue from January to current month
                const currentYear = new Date().getFullYear();
                let currentMonth = new Date().getMonth() + 1; // 1-12

                // Generate months array from January to current month
                const monthlyRevenue = [];
                for (let month = 1; month <= currentMonth; month++) {
                    monthlyRevenue.push({
                        month: `${currentYear}-${month.toString().padStart(2, '0')}`,
                        revenue: 0,
                        billCount: 0
                    });
                }

                // Get actual revenue data from database (January to current month)
                const actualRevenueData = await Bill.aggregate([
                    {
                        $match: {
                            status: 'PAID',
                            deletedAt: null,
                            date: {
                                $gte: new Date(currentYear, 0, 1), // Start of current year (January)
                                $lt: new Date(currentYear, currentMonth, 1) // Start of next month
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$date' },
                                month: { $month: '$date' }
                            },
                            revenue: { $sum: '$total' },
                            billCount: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { '_id.year': 1, '_id.month': 1 }
                    }
                ]);

                // Update monthlyRevenue array with actual data where available
                actualRevenueData.forEach(item => {
                    const monthIndex = item._id.month - 1; // Convert to 0-based index
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyRevenue[monthIndex] = {
                            month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                            revenue: item.revenue,
                            billCount: item.billCount
                        };
                    }
                });

                // Get services by category
                const servicesByCategory = await Service.aggregate([
                    {
                        $match: { deletedAt: null }
                    },
                    {
                        $group: {
                            _id: '$category',
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: -1 }
                    }
                ]);

                // Get top performing technicians by completed services
                const topTechnicians = await Service.aggregate([
                    {
                        $match: {
                            status: 'COMPLETED',
                            deletedAt: null
                        }
                    },
                    {
                        $group: {
                            _id: '$technicianId',
                            completedServices: { $sum: 1 }
                        }
                    },
                    {
                        $lookup: {
                            from: 'technicians',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'technician'
                        }
                    },
                    {
                        $unwind: '$technician'
                    },
                    {
                        $project: {
                            technicianName: '$technician.fullName',
                            completedServices: 1,
                            _id: 0
                        }
                    },
                    {
                        $sort: { completedServices: -1 }
                    },
                    {
                        $limit: 5
                    }
                ]);

                // Calculate growth metrics
                currentMonth = new Date();
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);

                const currentMonthRevenue = await Bill.aggregate([
                    {
                        $match: {
                            status: 'PAID',
                            deletedAt: null,
                            date: {
                                $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
                                $lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: '$total' }
                        }
                    }
                ]);

                const lastMonthRevenue = await Bill.aggregate([
                    {
                        $match: {
                            status: 'PAID',
                            deletedAt: null,
                            date: {
                                $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
                                $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: '$total' }
                        }
                    }
                ]);

                const currentMonthRev = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].revenue : 0;
                const lastMonthRev = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].revenue : 0;
                const revenueGrowth = lastMonthRev > 0 ? ((currentMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(2) : 0;

                const dashboardData = {
                    kpis: {
                        totalUsers: totalUsers,
                        activeUsers: activeUsers,
                        totalRevenue: totalRevenue,
                        servicesDone: servicesDone,
                        pendingServices: pendingServices,
                        totalTechnicians: totalTechnicians,
                        totalBills: totalBills
                    },
                    growth: {
                        revenueGrowth: `${revenueGrowth}%`,
                        currentMonthRevenue: currentMonthRev,
                        lastMonthRevenue: lastMonthRev
                    },
                    monthlyRevenue: monthlyRevenue,
                    servicesByCategory: servicesByCategory.map(item => ({
                        category: item._id,
                        count: item.count
                    })),
                    topTechnicians: topTechnicians
                };

                sendSuccessResponse(200, res, "Admin dashboard KPIs fetched successfully", dashboardData);
            } catch (error) {
                console.error('Admin Dashboard KPIs Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Get detailed analytics for admin dashboard
        getDetailedAnalytics: async (req, res) => {
            try {
                const { startDate, endDate } = req.query;

                let dateFilter = {};
                if (startDate && endDate) {
                    dateFilter = {
                        date: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    };
                }

                // Revenue analytics with date filter
                const revenueAnalytics = await Bill.aggregate([
                    {
                        $match: {
                            status: 'PAID',
                            deletedAt: null,
                            ...dateFilter
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$date' },
                                month: { $month: '$date' },
                                day: { $dayOfMonth: '$date' }
                            },
                            revenue: { $sum: '$total' },
                            billCount: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
                    }
                ]);

                // Customer growth analytics
                const customerGrowth = await Customer.aggregate([
                    {
                        $match: { deletedAt: null }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$joiningDate' },
                                month: { $month: '$joiningDate' }
                            },
                            newCustomers: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { '_id.year': 1, '_id.month': 1 }
                    }
                ]);

                // Service completion analytics
                const serviceAnalytics = await Service.aggregate([
                    {
                        $match: { deletedAt: null }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            totalServices: { $sum: 1 },
                            completedServices: {
                                $sum: {
                                    $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0]
                                }
                            },
                            pendingServices: {
                                $sum: {
                                    $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0]
                                }
                            }
                        }
                    },
                    {
                        $sort: { '_id.year': 1, '_id.month': 1 }
                    }
                ]);

                const analyticsData = {
                    revenueAnalytics: revenueAnalytics.map(item => ({
                        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
                        revenue: item.revenue,
                        billCount: item.billCount
                    })),
                    customerGrowth: customerGrowth.map(item => ({
                        period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                        newCustomers: item.newCustomers
                    })),
                    serviceAnalytics: serviceAnalytics.map(item => ({
                        period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                        totalServices: item.totalServices,
                        completedServices: item.completedServices,
                        pendingServices: item.pendingServices,
                        completionRate: item.totalServices > 0 ? Math.round((item.completedServices / item.totalServices) * 100) : 0
                    }))
                };

                sendSuccessResponse(200, res, "Detailed analytics fetched successfully", analyticsData);
            } catch (error) {
                console.error('Detailed Analytics Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        }
    };
};

module.exports = adminDashboardController;
