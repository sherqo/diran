import { ZodSchema } from 'zod';

/**
 * Helper to create Fastify schema from Zod schemas
 * Use this for routes that need validation on body, params, or querystring
 */
export function createSchema({
    body,
    params,
    querystring,
    response,
}: {
    body?: ZodSchema;
    params?: ZodSchema;
    querystring?: ZodSchema;
    response?: Record<number, ZodSchema>;
}) {
    return {
        ...(body && { body }),
        ...(params && { params }),
        ...(querystring && { querystring }),
        ...(response && { response }),
    };
}

/**
 * Shorthand for body-only validation (most common case)
 */
export const bodySchema = (schema: ZodSchema) => ({ body: schema });

/**
 * Shorthand for params-only validation
 */
export const paramsSchema = (schema: ZodSchema) => ({ params: schema });

/**
 * Shorthand for querystring validation
 */
export const querystringSchema = (schema: ZodSchema) => ({ querystring: schema });
