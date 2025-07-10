const admin = require('../config/firebase');

async function generateTestToken() {
    try {
        // Create a custom token for testing
        const uid = 'test-user-123';
        const customToken = await admin.auth().createCustomToken(uid);

        console.log('✅ Custom token generated:');
        console.log(customToken);
        console.log('\n📝 Instructions:');
        console.log('1. Use this custom token in your client-side Firebase Auth');
        console.log('2. Sign in with the custom token');
        console.log('3. Get the ID token from the signed-in user');
        console.log('4. Use that ID token in your API calls');

        return customToken;
    } catch (error) {
        console.error('❌ Error generating token:', error);
    }
}

// Alternative: Create a test user and get their ID token
async function createTestUserAndGetToken() {
    try {
        const email = 'test@example.com';
        const password = 'test123456';

        // Create user in Firebase
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: 'Test User'
        });

        console.log('✅ Test user created:');
        console.log('UID:', userRecord.uid);
        console.log('Email:', userRecord.email);

        // Create custom token for this user
        const customToken = await admin.auth().createCustomToken(userRecord.uid);

        console.log('\n✅ Custom token for test user:');
        console.log(customToken);

        return {
            uid: userRecord.uid,
            email: email,
            password: password,
            customToken: customToken
        };
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log('⚠️ User already exists, getting custom token...');
            const userRecord = await admin.auth().getUserByEmail('test@example.com');
            const customToken = await admin.auth().createCustomToken(userRecord.uid);

            console.log('✅ Custom token for existing user:');
            console.log(customToken);

            return {
                uid: userRecord.uid,
                email: 'test@example.com',
                password: 'test123456',
                customToken: customToken
            };
        } else {
            console.error('❌ Error creating test user:', error);
        }
    }
}

// Run the function
if (require.main === module) {
    console.log('🚀 Generating Firebase test token...\n');
    createTestUserAndGetToken();
}

module.exports = { generateTestToken, createTestUserAndGetToken }; 