import { Response } from 'express';
import { AuthenticatedRequest } from '#lib/middleware/auth';
import { sendSuccess } from '#lib/utils/response';

// Just placeholders for now
const createBlock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    sendSuccess(res, {}, 'Block created successfully');
};
const getBlock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {};
const updateBlock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {};
const deleteBlock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {};

export { createBlock, getBlock, updateBlock, deleteBlock };
