/**
 * Simple JWT decoder for client-side email extraction
 * Note: This is for display/UX purposes only - server still validates the token
 */
export const decodeEmailFromToken = (token: string): string | null => {
    try {
        // Simple base64 decode of JWT payload (2nd part)
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(atob(parts[1]));

        return payload.email || null;
    } catch (error) {
        console.warn('Failed to decode email token:', error);
        return null;
    }
};

/**
 * Check if a string is a JWT token (has 3 parts separated by dots)
 */
export const isJWTToken = (value: string): boolean => {
    return typeof value === 'string' && value.split('.').length === 3;
};
