import { apiRequest } from './helpers';
import type { GetHealthResponseData } from '@/shared/types/health';

export const getHealthApi = () => apiRequest<GetHealthResponseData>('/health');
