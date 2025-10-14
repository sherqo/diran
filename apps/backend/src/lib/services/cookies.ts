import { Response } from 'express';
import { isDevelopment } from '#lib/utils/common.js';
import ms from 'ms';

const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '5m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const COMMON_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: isDevelopment ? ('lax' as const) : ('none' as const),
    domain: isDevelopment ? undefined : process.env.COOKIE_DOMAIN,
};

const refreshTokenPath = '/v1/auth/refresh';

const setAccessTokenCookie = (res: Response, token: string): void => {
    res.cookie('accessToken', token, {
        ...COMMON_COOKIE_OPTIONS,
        maxAge: ms(JWT_ACCESS_EXPIRES_IN as ms.StringValue),
    });
};

const setRefreshTokenCookie = (res: Response, token: string): void => {
    res.cookie('refreshToken', token, {
        ...COMMON_COOKIE_OPTIONS,
        maxAge: ms(JWT_REFRESH_EXPIRES_IN as ms.StringValue),
        path: refreshTokenPath, // Only sent to refresh endpoint
    });
};

const clearAuthCookies = (res: Response): void => {
    res.clearCookie('accessToken', {
        ...COMMON_COOKIE_OPTIONS,
    });
    res.clearCookie('refreshToken', {
        ...COMMON_COOKIE_OPTIONS,
        path: refreshTokenPath,
    });
};

export { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies };
