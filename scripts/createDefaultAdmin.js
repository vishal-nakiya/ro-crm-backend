require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../Models/Admin');

// Connect to MongoDB using the same pattern as the main app
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ro-crm-backend', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function createDefaultAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('Default admin already exists');
            process.exit(0);
        }

        // Create default admin
        const defaultAdmin = new Admin({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            mobile_number: '9876543210',
            designation: 'Super Admin',
            is_super_admin: true
        });

        await defaultAdmin.save();
        console.log('Default admin created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error creating default admin:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

createDefaultAdmin();
