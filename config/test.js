// test-mongo.js
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = 'mongodb+srv://nakiyavishalc1234:yIlftCgG7A9tdYUm@crm.d7q1bj7.mongodb.net/ro_crm?retryWrites=true&w=majority&tls=true';

async function testConnection() {
    try {
        const client = new MongoClient(uri, {
            serverApi: ServerApiVersion.v1,
            tls: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        // console.log(client);
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas using native driver');
        await client.close();
    } catch (err) {
        console.error('❌ Connection failed with MongoDB native driver:', err);
    }
}

testConnection();
