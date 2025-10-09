export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any[];
}

export interface User {
    id: string;
    email: string;
    name: string;
    photo: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithToken {
    user: Omit<User, 'updatedAt'>;
    token: string;
}
