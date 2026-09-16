import { FastifyReply } from 'fastify';
import { isDevelopment } from '#lib/utils/common.js';
import ms from 'ms';

const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '5m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const getCommonCookieOptions = () => {
    const options: Record<string, any> = {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: isDevelopment ? 'lax' : 'none',
    };

    if (!isDevelopment && process.env.COOKIE_DOMAIN) {
        options.domain = process.env.COOKIE_DOMAIN;
    }

    return options;
};

const accessTokenPath = '/';
const refreshTokenPath = '/v1/auth/refresh';

const setAccessTokenCookie = (reply: FastifyReply, token: string): void => {
    reply.setCookie('accessToken', token, {
        ...getCommonCookieOptions(),
        maxAge: ms(JWT_ACCESS_EXPIRES_IN as ms.StringValue),
        path: accessTokenPath, // Make cookie available to all routes
    });
};

const setRefreshTokenCookie = (reply: FastifyReply, token: string): void => {
    reply.setCookie('refreshToken', token, {
        ...getCommonCookieOptions(),
        maxAge: ms(JWT_REFRESH_EXPIRES_IN as ms.StringValue), // maxAge in milliseconds
        path: refreshTokenPath, // Only sent to refresh endpoint
    });
};

const clearAuthCookies = (reply: FastifyReply): void => {
    reply.clearCookie('accessToken', {
        ...getCommonCookieOptions(),
        path: accessTokenPath, // Must match the path used when setting
    });
    reply.clearCookie('refreshToken', {
        ...getCommonCookieOptions(),
        path: refreshTokenPath,
    });
};

export { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies };
