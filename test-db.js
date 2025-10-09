import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
    console.log('🧪 Testing Database Connection...');
    console.log('================================');
    console.log('');

    console.log('📋 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')); // Hide password
    console.log('');

    try {
        console.log('🔗 Attempting to connect...');

        // Test basic connection
        await prisma.$connect();
        console.log('✅ Database connected successfully!');

        // Test query
        console.log('📊 Testing query...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Query test passed:', result);

        // Check if User table exists (this will fail if migrations haven't run)
        console.log('🗄️  Checking database schema...');
        try {
            const userCount = await prisma.user.count();
            console.log(`✅ User table exists with ${userCount} users`);
        } catch (error) {
            console.log('⚠️  User table not found - you need to run migrations:');
            console.log('   bun run migrate');
        }

        console.log('');
        console.log('🎉 Database connection test complete!');
    } catch (error) {
        console.log('');
        console.log('❌ Database connection failed!');
        console.log('Error:', error.message);
        console.log('');
        console.log('🔧 Common fixes:');
        console.log('1. Check your DATABASE_URL in .env');
        console.log('2. Make sure your database is running');
        console.log('3. Check if your password has special characters (encode them)');
        console.log('4. Verify your database credentials');
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
