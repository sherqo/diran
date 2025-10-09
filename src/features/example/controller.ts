import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../shared/middleware';
import { CreateExampleInput } from './validation.js';

// Example controller - shows how to structure controllers
export const createExample = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { title, description }: CreateExampleInput = req.body;

        // Your business logic here
        const example = {
            id: Date.now().toString(),
            title,
            description,
            userId: req.user!.id,
            createdAt: new Date(),
        };

        res.status(201).json({
            success: true,
            message: 'Example created successfully',
            data: { example },
        });
    } catch (error: any) {
        console.error('Create example error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getExamples = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Your logic to fetch examples
        const examples = [
            {
                id: '1',
                title: 'Sample Example',
                description: 'This is a sample',
                userId: req.user!.id,
                createdAt: new Date(),
            },
        ];

        res.json({
            success: true,
            data: { examples },
        });
    } catch (error: any) {
        console.error('Get examples error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
