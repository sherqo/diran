import { apiRequest } from './helpers';
import type {
    TeamDetailResponse,
    ListTeamsResponse,
    CreateTeamResponse,
    UpdateTeamResponse,
    AddMemberResponse,
    UpdateMemberResponse,
} from '@/shared/types/team';
import type { CreateTeamBodyInput, UpdateTeamBodyInput, AddMemberBodyInput, UpdateMemberBodyInput } from '@/shared/validation/team';

// ================ Team CRUD ================

/**
 * List all teams user is part of
 */
export const listTeamsApi = () => apiRequest<ListTeamsResponse>('/team');

/**
 * Get team details with members
 */
export const getTeamApi = (teamId: string) => apiRequest<{ team: TeamDetailResponse }>(`/team/${teamId}`);

/**
 * Create a new team
 */
export const createTeamApi = (data: CreateTeamBodyInput) =>
    apiRequest<CreateTeamResponse>('/team', {
        method: 'POST',
        body: JSON.stringify(data),
    });

/**
 * Update team info
 */
export const updateTeamApi = (teamId: string, data: UpdateTeamBodyInput) =>
    apiRequest<UpdateTeamResponse>(`/team/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

/**
 * Delete a team
 */
export const deleteTeamApi = (teamId: string) =>
    apiRequest<{ deleted: boolean }>(`/team/${teamId}`, {
        method: 'DELETE',
    });

// ================ Member Management ================

/**
 * Add a member to a team
 */
export const addMemberApi = (teamId: string, data: AddMemberBodyInput) =>
    apiRequest<AddMemberResponse>(`/team/${teamId}/member`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

/**
 * Update a member's role
 */
export const updateMemberApi = (teamId: string, memberId: string, data: UpdateMemberBodyInput) =>
    apiRequest<UpdateMemberResponse>(`/team/${teamId}/member/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

/**
 * Remove a member from a team
 */
export const removeMemberApi = (teamId: string, memberId: string) =>
    apiRequest<{ deleted: boolean }>(`/team/${teamId}/member/${memberId}`, {
        method: 'DELETE',
    });

/**
 * Leave a team
 */
export const leaveTeamApi = (teamId: string) =>
    apiRequest<{ left: boolean }>(`/team/${teamId}/leave`, {
        method: 'POST',
    });

// ================ Team Pages ================

/**
 * Team page type (same structure as regular page)
 */
export interface TeamPage {
    id: string;
    type: string;
    content: {
        title?: string;
        icon?: string;
        [key: string]: unknown;
    };
    order: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Get pages owned by a team
 */
export const getTeamPagesApi = (teamId: string) => apiRequest<{ pages: TeamPage[]; teamId: string }>(`/team/${teamId}/pages`);

/**
 * Create a new page owned by a team
 */
export const createTeamPageApi = (teamId: string, title?: string, icon?: string) =>
    apiRequest<{ page: TeamPage; teamId: string }>(`/team/${teamId}/pages`, {
        method: 'POST',
        body: JSON.stringify({ title, icon }),
    });
