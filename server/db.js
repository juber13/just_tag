import dns from 'node:dns';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'justtag';
const password = process.env.DB_PASSWORD || process.env.PASSWORD;

function getMongoUri() {
    if (process.env.MONGODB_URI) {
        return process.env.MONGODB_URI;
    }

    if (!password) {
        throw new Error('Missing database password. Set PASSWORD or DB_PASSWORD in .env');
    }

    const user = process.env.DB_USERNAME || 'juberkhan0707_db_user';
    return `mongodb+srv://${user}:${encodeURIComponent(password)}@cluster0.jkrqx5f.mongodb.net/${dbName}`;
}

const connectToDatabase = async () => {
    try {
        // mongodb+srv needs SRV DNS; some ISP resolvers fail that lookup (querySrv ECONNREFUSED).
        if (process.env.MONGODB_DNS_SERVERS) {
            dns.setServers(process.env.MONGODB_DNS_SERVERS.split(',').map((s) => s.trim()));
        }

        console.log('Connecting to database...');
        const client = new MongoClient(getMongoUri());
        await client.connect();
        console.log('Connected to database');
        return client.db(dbName);
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};

export default connectToDatabase;