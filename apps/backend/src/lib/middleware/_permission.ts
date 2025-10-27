// here we have the code that will run when a user tries to access a protected entity

/**
 * How permissions work??
 *
 * you have entity and have actor
 *
 * if actor has permission to access entity then allow
 * else: check if user has permission to access one of its parents
 *
 * for now: we won't use tags for permissions.
 * ----------------------------------------------------------
 * This middleware will run after authentication middleware (makes sense, right?)
 *
 * when we need it:
 * accessing, modifying, deleting entities
 *
 * entities have id, comes from req.params.id
 * actor comes from req.user.id (added by authentication middleware)
 *
 * Users have roles, roles have permissions
 *
 * you have the id of the entity, but you do not know what type is user intending to access
 * we can do this with the url. /block/:id  -> type is block
 *
 * but how we can make this generic?... can we even read the url in middleware?
 * i think i should do another middleware to determine the type of entity from url and add it to req object
 * but as long as the type middleware is only required by permission middleware, we can do both in the same file and embed type in the permission middleware
 *
 * so the flow will be:
 * 1. get entity type from url
 * 2. get entity id from req.params.id
 * 3. get actor id from req.user.id
 * 4. check if actor has permission to access entity
 */

// import { Request, Response, NextFunction } from 'express';
// import { ApiError } from './errorHandler';
// import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';

// // type middleware
// const getEntityTypeFromUrl = (url: string): string | undefined => {
//     // diran.app/v1/blocks/23-34-24-24

//     const segments = url.split('/').filter(segment => segment.length > 0);
//     if (segments.length < 4) {
//         return undefined; // Not enough segments to determine type
//     }
//     return segments[segments.length - 2]; // Second last segment is the type
// };
