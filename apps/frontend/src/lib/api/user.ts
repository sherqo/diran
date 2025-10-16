import { apiRequest } from './helpers';
import type { GetProfileResponseData, UpdateProfileResponseData, ChangePasswordResponseData } from '@/shared/types/user';

export const getProfileApi = () => apiRequest<GetProfileResponseData>('/user/profile');

export const updateProfileApi = (name?: string, photo?: string) =>
    apiRequest<UpdateProfileResponseData>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, photo }),
    });

export const changePasswordApi = (currentPassword: string, newPassword: string) =>
    apiRequest<ChangePasswordResponseData>('/user/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
