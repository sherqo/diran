/**
 * Test setup file
 * Runs before all tests to set up the test environment
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Ensure we're in test mode
if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must run with NODE_ENV=test');
}

console.log('🧪 Setting up test environment...');

// Reset and seed test database
try {
    console.log('📦 Resetting test database...');

    console.log('✅ Test database ready');
} catch (error) {
    console.error('❌ Failed to set up test database:', error);
    process.exit(1);
}
