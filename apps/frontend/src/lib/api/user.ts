import { User } from '@/shared/types/user';
import { apiRequest } from './helpers';

export const getProfileApi = () => apiRequest<{ user: User }>('/user/profile');
