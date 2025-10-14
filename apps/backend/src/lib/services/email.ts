import { ErrorCode, HttpStatus } from '#lib/constants/errors';
import { ApiError } from '#lib/middleware/errorHandler';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
    email: z.email(),
});

const API_KEY = process.env.RESEND_API_KEY!;
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN! || '@mail.diran.app';
const NAME = process.env.APP_NAME || 'Diran AI';

const resend = new Resend(API_KEY);

// Email templates
export const emailTemplates = {
    verifyEmail: (otp: string) => `<h1>Verify Your Email</h1>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code expires in 15 minutes.</p>`,
    resetPassword: (token: string, email: string) => `<h1>Reset Your Password</h1>
        <p>We received a request to reset the password for your account: <strong>${email}</strong></p>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `,
};

type SendMailParams = {
    to: string[];
    subject: string;
    html: string;
};

export const sendMail = async ({ to, subject, html }: SendMailParams, retries = 3): Promise<any> => {
    // Convert to Resend string format: "Name <email>"
    const formatPerson = (name: string, email: string) => `${name} <${email + EMAIL_DOMAIN}>`;

    to.forEach(email => {
        schema.parse({ email });
    });

    console.log(`Sending email to: ${to.join(', ')}, subject: ${subject} ...`);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await resend.emails.send({
                from: formatPerson(NAME, 'noreply'),
                replyTo: formatPerson(NAME, 'support'),
                to,
                subject,
                html,
            });
            return result;
        } catch (error) {
            if (attempt === retries) {
                throw new ApiError('Failed to send email after retries', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.EMAIL_SEND_FAILED);
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    throw new ApiError('Unexpected error in sendMail', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.UNEXPECTED_ERROR);
};
