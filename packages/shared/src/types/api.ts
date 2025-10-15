export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse<T = any> {
  success: false;
  data?: T;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResult<T = any> = SuccessResponse<T> | ErrorResponse<T>;
