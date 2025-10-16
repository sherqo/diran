import { apiRequest } from './helpers';
import type { GetProfileResponseData, UpdateProfileResponseData, ChangePasswordResponseData } from '@/shared/types/user';
import { UpdateProfileInput, ChangePasswordInput } from '@/shared/validation/user';

export const getProfileApi = () => apiRequest<GetProfileResponseData>('/user/profile');

export const updateProfileApi = ({ name, photo }: UpdateProfileInput) =>
    apiRequest<UpdateProfileResponseData>('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, photo }),
    });

export const changePasswordApi = ({ currentPassword, newPassword }: ChangePasswordInput) =>
    apiRequest<ChangePasswordResponseData>('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
