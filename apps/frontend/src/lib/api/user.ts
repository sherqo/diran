import { apiRequest } from './helpers';
import type {
    GetProfileResponseData,
    UpdateProfileResponseData,
    ChangePasswordResponseData,
    UploadProfilePhotoResponseData,
} from '@/shared/types/user';
import { UpdateProfileInput, ChangePasswordInput } from '@/shared/validation/user';

export const getProfileApi = () => apiRequest<GetProfileResponseData>('/user/profile');

export const updateProfileApi = ({ name, photo }: UpdateProfileInput) =>
    apiRequest<UpdateProfileResponseData>('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, photo }),
    });

export const uploadProfilePhotoApi = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<UploadProfilePhotoResponseData>('/user/profile/photo', {
        method: 'POST',
        body: formData,
        headers: {},
    });
};

export const changePasswordApi = ({ currentPassword, newPassword }: ChangePasswordInput) =>
    apiRequest<ChangePasswordResponseData>('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
