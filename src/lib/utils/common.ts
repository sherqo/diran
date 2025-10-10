import chalk from 'chalk';

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Professional startup logging with colors and extra data
export const logStartup = (port: number, dbConnected: boolean) => {
    const appName = process.env.APP_NAME || 'Diran AI';
    const appVersion = process.env.APP_VERSION || '0.1.0';
    const appPrefix = chalk.blue(`${chalk.hex('#FFA500')(`[${appName}@${appVersion}]`)}`);
    const apiBaseUrl = process.env.BASE_URL || `http://localhost`;
    const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const nodeVersion = process.version;
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    const startupLogs = [
        { label: 'Environment', value: process.env.NODE_ENV || 'development' },
        { label: 'API Base URL', value: `${apiBaseUrl}:${port}` },
        { label: 'Database', value: dbConnected ? 'Connected' : 'Disconnected' },
        { label: 'CORS Origin', value: corsOrigin },
        { label: 'Node.js', value: nodeVersion },
        { label: 'Memory', value: `${memoryUsage} MB` },
        { label: 'Started', value: new Date().toISOString() },
    ];

    startupLogs.forEach(log => {
        console.log(`${appPrefix} ${log.label}: ${log.value}`);
    });
};
