import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
    email: z.email(),
});

const API_KEY = process.env.RESEND_API_KEY!;
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN! || '@mail.diran.app';
const NAME = process.env.APP_NAME || 'Diran AI';

export const resend = new Resend(API_KEY);

type SendMailParams = {
    to: string[];
    subject: string;
    html: string;
};

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
    // Convert to Resend string format: "Name <email>"
    const formatPerson = (name: string, email: string) => `${name} <${email + EMAIL_DOMAIN}>`;

    to.forEach(email => {
        schema.parse({ email });
    });

    console.log(`Sending email to: ${to.join(', ')}, subject: ${subject} ...`);

    return await resend.emails.send({
        from: formatPerson(NAME, 'noreply'),
        replyTo: formatPerson(NAME, 'support'),
        to,
        subject,
        html,
    });
};
