export interface User {
    id: string;
    email: string;
    name: string;
    photo?: string;
    createdAt?: string;
}
export interface LoginData {
    user: User;
    requiresVerification?: boolean;
}
export interface SignupData {
    user: User;
}
export interface VerifyEmailData {
    message: string;
}
//# sourceMappingURL=user.d.ts.map