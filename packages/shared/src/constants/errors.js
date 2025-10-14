// Standard HTTP status codes for API errors
export var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatus || (HttpStatus = {}));
// Application-specific error codes
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["ACCESS_TOKEN_REQUIRED"] = "ACCESS_TOKEN_REQUIRED";
    ErrorCode["REFRESH_TOKEN_REQUIRED"] = "REFRESH_TOKEN_REQUIRED";
    ErrorCode["INVALID_TOKEN"] = "INVALID_TOKEN";
    ErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCode["INVALID_PASSWORD"] = "INVALID_PASSWORD";
    ErrorCode["INVALID_RESET_TOKEN"] = "INVALID_RESET_TOKEN";
    ErrorCode["EMAIL_NOT_VERIFIED"] = "EMAIL_NOT_VERIFIED";
    ErrorCode["USER_EXISTS"] = "USER_EXISTS";
    ErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["EMAIL_SEND_FAILED"] = "EMAIL_SEND_FAILED";
    ErrorCode["UNEXPECTED_ERROR"] = "UNEXPECTED_ERROR";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["INVALID_JSON"] = "INVALID_JSON";
})(ErrorCode || (ErrorCode = {}));
//# sourceMappingURL=errors.js.map