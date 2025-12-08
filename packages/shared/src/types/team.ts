// ================ Team Types ================

import { TeamRole } from '../validation/team.js';

/**
 * Basic user info for team responses.
 */
export interface TeamUserInfo {
  id: string;
  name: string;
  email: string;
  photo: string | null;
}

/**
 * Team member response.
 */
export interface TeamMemberResponse {
  id: string;
  user: TeamUserInfo;
  role: TeamRole;
  joinedAt: string;
}

/**
 * Team response for API.
 */
export interface TeamResponse {
  id: string;
  name: string;
  owner: TeamUserInfo;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Detailed team response with members.
 */
export interface TeamDetailResponse extends TeamResponse {
  members: TeamMemberResponse[];
}

/**
 * List teams response.
 */
export interface ListTeamsResponse {
  teams: TeamResponse[];
}

/**
 * Create team response.
 */
export interface CreateTeamResponse {
  team: TeamResponse;
}

/**
 * Update team response.
 */
export interface UpdateTeamResponse {
  team: TeamResponse;
}

/**
 * Add member response.
 */
export interface AddMemberResponse {
  member: TeamMemberResponse;
}

/**
 * Update member response.
 */
export interface UpdateMemberResponse {
  member: TeamMemberResponse;
}
