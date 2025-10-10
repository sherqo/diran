import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
    email: z.email(),
});

const API_KEY = process.env.RESEND_API_KEY!;
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN! || '@mail.diran.app';
const NAME = process.env.APP_NAME || 'Diran AI';

export const resend = new Resend(API_KEY);

// Email templates
export const emailTemplates = {
    verifyEmail: (otp: string) => `
        <h1>Verify Your Email</h1>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code expires in 10 minutes.</p>
    `,
    resetPassword: (token: string) => `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}">Reset Password</a>
        <p>This link expires in 10 minutes.</p>
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
            console.error(`Email send attempt ${attempt} failed:`, error);
            if (attempt === retries) {
                throw new Error(`Failed to send email after ${retries} attempts`);
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    throw new Error('Unexpected error in sendMail');
};
