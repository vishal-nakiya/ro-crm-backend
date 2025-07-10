const admin = require('../config/firebase');
const logger = require('../logger/index');

class NotificationService {
  constructor() {
    this.fcm = admin.messaging();
  }

  /**
   * Send notification to a single device
   * @param {string} token - FCM token
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} - Send result
   */
  async sendToDevice(token, notification) {
    try {
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.fcm.send(message);
      
      logger.info(`Notification sent to device ${token}:`, response);
      
      return {
        success: true,
        messageId: response,
        message: 'Notification sent successfully'
      };
    } catch (error) {
      logger.error(`Failed to send notification to device ${token}:`, error);
      
      // Handle specific FCM errors
      if (error.code === 'messaging/invalid-registration-token') {
        return {
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid FCM token'
        };
      } else if (error.code === 'messaging/registration-token-not-registered') {
        return {
          success: false,
          error: 'TOKEN_NOT_REGISTERED',
          message: 'Token not registered'
        };
      }
      
      return {
        success: false,
        error: 'SEND_FAILED',
        message: 'Failed to send notification'
      };
    }
  }

  /**
   * Send notification to multiple devices
   * @param {Array<string>} tokens - Array of FCM tokens
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} - Send result
   */
  async sendToMultipleDevices(tokens, notification) {
    try {
      const message = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.fcm.sendMulticast(message);
      
      logger.info(`Multicast notification sent:`, {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        message: `Sent to ${response.successCount} devices, ${response.failureCount} failed`
      };
    } catch (error) {
      logger.error('Failed to send multicast notification:', error);
      return {
        success: false,
        error: 'MULTICAST_FAILED',
        message: 'Failed to send multicast notification'
      };
    }
  }

  /**
   * Send notification to a topic
   * @param {string} topic - Topic name
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} - Send result
   */
  async sendToTopic(topic, notification) {
    try {
      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.fcm.send(message);
      
      logger.info(`Topic notification sent to ${topic}:`, response);
      
      return {
        success: true,
        messageId: response,
        message: 'Topic notification sent successfully'
      };
    } catch (error) {
      logger.error(`Failed to send topic notification to ${topic}:`, error);
      return {
        success: false,
        error: 'TOPIC_SEND_FAILED',
        message: 'Failed to send topic notification'
      };
    }
  }

  /**
   * Subscribe device to a topic
   * @param {Array<string>} tokens - FCM tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} - Subscription result
   */
  async subscribeToTopic(tokens, topic) {
    try {
      const response = await this.fcm.subscribeToTopic(tokens, topic);
      
      logger.info(`Subscribed ${tokens.length} devices to topic ${topic}:`, response);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        message: `Subscribed ${response.successCount} devices to topic ${topic}`
      };
    } catch (error) {
      logger.error(`Failed to subscribe to topic ${topic}:`, error);
      return {
        success: false,
        error: 'SUBSCRIBE_FAILED',
        message: 'Failed to subscribe to topic'
      };
    }
  }

  /**
   * Unsubscribe device from a topic
   * @param {Array<string>} tokens - FCM tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} - Unsubscription result
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      const response = await this.fcm.unsubscribeFromTopic(tokens, topic);
      
      logger.info(`Unsubscribed ${tokens.length} devices from topic ${topic}:`, response);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        message: `Unsubscribed ${response.successCount} devices from topic ${topic}`
      };
    } catch (error) {
      logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return {
        success: false,
        error: 'UNSUBSCRIBE_FAILED',
        message: 'Failed to unsubscribe from topic'
      };
    }
  }

  /**
   * Send notification for task assignment
   * @param {string} technicianToken - Technician's FCM token
   * @param {Object} taskData - Task information
   * @returns {Promise<Object>} - Send result
   */
  async sendTaskAssignmentNotification(technicianToken, taskData) {
    const notification = {
      title: 'New Task Assigned',
      body: `You have been assigned a new task: ${taskData.title}`,
      data: {
        type: 'TASK_ASSIGNMENT',
        taskId: taskData._id,
        taskTitle: taskData.title,
        customerName: taskData.customerName,
        scheduledDate: taskData.scheduledDate
      }
    };

    return await this.sendToDevice(technicianToken, notification);
  }

  /**
   * Send notification for task completion
   * @param {string} adminToken - Admin's FCM token
   * @param {Object} taskData - Task information
   * @returns {Promise<Object>} - Send result
   */
  async sendTaskCompletionNotification(adminToken, taskData) {
    const notification = {
      title: 'Task Completed',
      body: `Task "${taskData.title}" has been completed by ${taskData.technicianName}`,
      data: {
        type: 'TASK_COMPLETION',
        taskId: taskData._id,
        taskTitle: taskData.title,
        technicianName: taskData.technicianName
      }
    };

    return await this.sendToDevice(adminToken, notification);
  }

  /**
   * Send notification for new customer
   * @param {Array<string>} adminTokens - Admin FCM tokens
   * @param {Object} customerData - Customer information
   * @returns {Promise<Object>} - Send result
   */
  async sendNewCustomerNotification(adminTokens, customerData) {
    const notification = {
      title: 'New Customer Added',
      body: `New customer "${customerData.fullName}" has been added to the system`,
      data: {
        type: 'NEW_CUSTOMER',
        customerId: customerData._id,
        customerName: customerData.fullName,
        contactNumber: customerData.contactNumber
      }
    };

    return await this.sendToMultipleDevices(adminTokens, notification);
  }

  /**
   * Send notification for bill generation
   * @param {string} customerToken - Customer's FCM token
   * @param {Object} billData - Bill information
   * @returns {Promise<Object>} - Send result
   */
  async sendBillGenerationNotification(customerToken, billData) {
    const notification = {
      title: 'New Bill Generated',
      body: `A new bill of ₹${billData.totalAmount} has been generated for your service`,
      data: {
        type: 'BILL_GENERATION',
        billId: billData._id,
        totalAmount: billData.totalAmount,
        serviceDetails: billData.serviceDetails
      }
    };

    return await this.sendToDevice(customerToken, notification);
  }
}

module.exports = new NotificationService(); 