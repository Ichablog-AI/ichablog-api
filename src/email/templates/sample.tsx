import { Body, Container, Head, Html, Link, Text } from '@react-email/components';
import type { EmailTemplate } from '../EmailTemplateInterface';

/**
 * Props for the sample email template.
 */
export type SampleEmailProps = {
    name: string;
    url: string;
};

/**
 * Generates the subject line for the sample email.
 *
 * @param props - The dynamic props for the email.
 * @returns Subject line as a string.
 */
const subject = ({ name }: SampleEmailProps) => `Welcome, ${name}!`;

/**
 * Generates the HTML body for the sample email.
 *
 * @param props - The dynamic props for the email.
 * @returns A JSX element representing the HTML email body.
 */
const html = ({ name, url }: SampleEmailProps) => (
    <Html>
        <Head />
        <Body>
            <Container>
                <Text>Hi {name},</Text>
                <Text>Click the link below to get started:</Text>
                <Link href={url}>Activate your account</Link>
            </Container>
        </Body>
    </Html>
);

/**
 * Generates the plain text version of the sample email.
 *
 * @param props - The dynamic props for the email.
 * @returns A plain text email string.
 */
const text = ({ name, url }: SampleEmailProps) =>
    `
Hi ${name},

Click the link below to get started:

${url}

Thanks,
Your App Team
`.trim();

/**
 * The sample email template combining subject, html, and text generators.
 */
export const SampleEmailTemplate: EmailTemplate<SampleEmailProps> = {
    subject,
    html,
    text,
};
