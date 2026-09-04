import { sendSuccess } from '../../lib/utils/response.js';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AiRequest } from '@diran/shared';
import { callAi } from './service';

export const handleAiRequest = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as AiRequest;
    const result = await callAi(body);
    sendSuccess(reply, result);
};
