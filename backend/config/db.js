import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.log('⚠️ MONGODB_URI not set in .env — skipping database connection');
        console.log('   Add your MongoDB connection string to backend/.env to enable the database');
        mongoose.set('bufferCommands', false);
        return;
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;

