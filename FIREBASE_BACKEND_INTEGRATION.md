# Firebase Backend Integration Guide

This guide covers the complete Firebase integration for your Node.js backend, including Authentication, OTP, and Push Notifications.

## 🔥 Features Added

### 1. Firebase Authentication
- ✅ Token verification middleware
- ✅ User management (CRUD operations)
- ✅ Custom claims management
- ✅ Role-based access control

### 2. OTP Service
- ✅ SMS OTP generation and verification
- ✅ Rate limiting and attempt tracking
- ✅ OTP expiry management
- ✅ Resend functionality

### 3. Push Notifications
- ✅ FCM (Firebase Cloud Messaging) integration
- ✅ Single device notifications
- ✅ Multicast notifications
- ✅ Topic-based notifications
- ✅ CRM-specific notification templates

## 📁 File Structure

```
├── config/
│   └── firebase.js                    # Firebase Admin SDK configuration
├── http/middlewares/
│   └── firebaseAuthMiddleware.js      # Firebase token verification
├── services/
│   ├── otpService.js                  # OTP generation and verification
│   └── notificationService.js         # FCM push notifications
├── Routes/
│   ├── otpRoutes.js                   # OTP API endpoints
│   ├── notificationRoutes.js          # Notification API endpoints
│   └── firebaseAuthRoutes.js         # Firebase Auth management
└── FIREBASE_BACKEND_INTEGRATION.md   # This guide
```

## 🚀 Setup Instructions

### Step 1: Firebase Project Setup

1. **Create Firebase Project**
   ```bash
   # Go to Firebase Console: https://console.firebase.google.com/
   # Create new project or select existing
   ```

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable: Email/Password, Google, Phone

3. **Enable Cloud Messaging**
   - Go to Project Settings → Cloud Messaging
   - Note down the Server Key

### Step 2: Download Service Account

1. **Generate Service Account Key**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download JSON file

2. **Place in Backend**
   ```bash
   # Place the downloaded JSON as:
   config/firebase-service-account.json
   ```

### Step 3: Environment Variables

Add to your `.env` file:
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# SMS Service (Optional - for production OTP)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Install Dependencies

```bash
npm install firebase-admin
```

## 🔐 Authentication Integration

### Using Firebase Auth Middleware

```javascript
const firebaseAuthMiddleware = require('./http/middlewares/firebaseAuthMiddleware');

// Apply to protected routes
app.use('/api/customer', firebaseAuthMiddleware, customerRoutes);
app.use('/api/task', firebaseAuthMiddleware, taskRoutes);
```

### Access User Information

```javascript
// In your route handlers
app.get('/api/profile', firebaseAuthMiddleware, (req, res) => {
  const user = req.user; // Contains Firebase user info
  console.log('User UID:', user.uid);
  console.log('User Email:', user.email);
  console.log('Custom Claims:', user.customClaims);
  
  res.json({ success: true, data: user });
});
```

## 📱 OTP Integration

### Send OTP
```bash
POST /api/otp/send
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

### Verify OTP
```bash
POST /api/otp/verify
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

### Check OTP Status
```bash
GET /api/otp/status/+1234567890
```

## 🔔 Notification Integration

### Send to Single Device
```bash
POST /api/notification/send
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "token": "fcm_device_token",
  "title": "New Task Assigned",
  "body": "You have been assigned a new task",
  "data": {
    "taskId": "123",
    "type": "TASK_ASSIGNMENT"
  }
}
```

### Send to Multiple Devices
```bash
POST /api/notification/send-multiple
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "tokens": ["token1", "token2", "token3"],
  "title": "System Update",
  "body": "System maintenance scheduled"
}
```

### Send to Topic
```bash
POST /api/notification/send-topic
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "topic": "technicians",
  "title": "New Policy Update",
  "body": "Please review the updated policies"
}
```

## 👥 User Management

### Get User Information
```bash
GET /api/firebase/user/{uid}
Authorization: Bearer <firebase-token>
```

### Update User
```bash
PUT /api/firebase/user/{uid}
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "displayName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

### Set Custom Claims
```bash
POST /api/firebase/claims/{uid}
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "claims": {
    "role": "technician",
    "permissions": ["read", "write"],
    "companyId": "company123"
  }
}
```

## 🔧 Integration with Existing Routes

### Update Your Existing Controllers

```javascript
// Example: Update customerController.js
const notificationService = require('../services/notificationService');

// In your create customer function
exports.createCustomer = async (req, res) => {
  try {
    // Your existing customer creation logic
    const customer = await Customer.create(customerData);
    
    // Send notification to admins
    const adminTokens = await getAdminFCMTokens(); // Implement this
    await notificationService.sendNewCustomerNotification(adminTokens, customer);
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};
```

### Update Task Controller

```javascript
// Example: Update taskController.js
const notificationService = require('../services/notificationService');

// In your assign task function
exports.assignTask = async (req, res) => {
  try {
    const { taskId, technicianId } = req.body;
    
    // Your existing task assignment logic
    const task = await Task.findByIdAndUpdate(taskId, {
      technicianId,
      status: 'ASSIGNED'
    });
    
    // Send notification to technician
    const technicianToken = await getTechnicianFCMToken(technicianId);
    await notificationService.sendTaskAssignmentNotification(technicianToken, task);
    
    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign task',
      error: error.message
    });
  }
};
```

## 📊 API Endpoints Summary

### Authentication
- `GET /api/firebase/user/{uid}` - Get user info
- `PUT /api/firebase/user/{uid}` - Update user
- `DELETE /api/firebase/user/{uid}` - Delete user
- `POST /api/firebase/claims/{uid}` - Set custom claims
- `GET /api/firebase/claims/{uid}` - Get custom claims

### OTP
- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP
- `POST /api/otp/resend` - Resend OTP
- `GET /api/otp/status/{phoneNumber}` - Check OTP status

### Notifications
- `POST /api/notification/send` - Send to single device
- `POST /api/notification/send-multiple` - Send to multiple devices
- `POST /api/notification/send-topic` - Send to topic
- `POST /api/notification/subscribe-topic` - Subscribe to topic
- `POST /api/notification/unsubscribe-topic` - Unsubscribe from topic

## 🔒 Security Best Practices

### 1. Token Validation
```javascript
// Always validate Firebase tokens
const firebaseAuthMiddleware = require('./http/middlewares/firebaseAuthMiddleware');
app.use('/api/protected', firebaseAuthMiddleware);
```

### 2. Rate Limiting
```javascript
// Add rate limiting for OTP endpoints
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many OTP requests'
});

app.use('/api/otp', otpLimiter);
```

### 3. Environment Variables
```bash
# Never commit sensitive data
# Use environment variables for all secrets
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Error Handling
```javascript
// Always handle Firebase errors gracefully
try {
  await admin.auth().verifyIdToken(token);
} catch (error) {
  if (error.code === 'auth/id-token-expired') {
    return res.status(401).json({ message: 'Token expired' });
  }
  // Handle other errors
}
```

## 🧪 Testing

### Test Firebase Auth
```bash
# Get a test token from your frontend
curl -X GET http://localhost:5000/api/firebase/user/{uid} \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Test OTP
```bash
# Send OTP
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'

# Verify OTP
curl -X POST http://localhost:5000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "otp": "123456"}'
```

### Test Notifications
```bash
# Send notification
curl -X POST http://localhost:5000/api/notification/send \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "FCM_TOKEN",
    "title": "Test Notification",
    "body": "This is a test notification"
  }'
```

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
NODE_ENV=production
FIREBASE_PROJECT_ID=your-production-project
```

### 2. SMS Service Integration
```javascript
// In services/otpService.js, uncomment and configure Twilio
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: message,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phoneNumber
});
```

### 3. Monitoring
```javascript
// Add logging for production monitoring
logger.info('Firebase Auth successful', { uid: req.user.uid });
logger.error('Firebase Auth failed', { error: error.message });
```

## 📚 Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## 🆘 Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check `config/firebase.js` is properly configured
   - Verify service account JSON is valid

2. **Token verification failing**
   - Ensure Firebase project ID matches
   - Check token format (Bearer token)

3. **OTP not sending**
   - For development, check console logs
   - For production, configure SMS service

4. **Notifications not received**
   - Verify FCM token is valid
   - Check device is online
   - Verify notification permissions

### Debug Commands
```bash
# Check Firebase configuration
node -e "const admin = require('./config/firebase'); console.log('Firebase initialized')"

# Test OTP service
node -e "const otpService = require('./services/otpService'); otpService.generateOTP('+1234567890')"

# Test notification service
node -e "const notificationService = require('./services/notificationService'); console.log('Notification service ready')"
```

This integration provides a complete Firebase backend solution for your RO CRM application with authentication, OTP, and push notifications! 