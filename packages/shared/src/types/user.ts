export interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  createdAt?: string;
}

// User API Response Data Types
export interface GetProfileResponseData {
  user: User;
}

export interface UpdateProfileResponseData {
  user: User;
}

export type ChangePasswordResponseData = {};
