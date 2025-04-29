import appConfig from '@be/config';
import { TemplateManager, type TemplateName } from '@be/email/TemplateManager';
import { render as renderHtml } from '@react-email/render';
import type { Transporter } from 'nodemailer';
import type { Address } from 'nodemailer/lib/mailer';
import type { EmailTemplate } from './EmailTemplateInterface';

/**
 * Represents an email recipient.
 *
 * Can be either a simple email string or a structured Address object.
 */
export type EmailRecipient = string | Address;

/**
 * Service responsible for sending transactional emails.
 *
 * Supports both HTML and plain text versions using pre-defined templates.
 */
export class MailService {
    readonly transporter: Transporter;

    /**
     * Creates a new MailService instance.
     *
     * @param transporter - The nodemailer Transporter used to send emails.
     */
    constructor(transporter: Transporter) {
        this.transporter = transporter;
    }

    /**
     * Sends an email using the specified template and dynamic props.
     *
     * @param to - The recipient of the email (string address or Address object).
     * @param template - The email template providing subject, HTML, and text rendering.
     * @param props - Dynamic props passed to the email template.
     * @returns A Promise that resolves when the email has been sent.
     */
    async send<K extends TemplateName>({
        to,
        templateName,
        props,
    }: {
        to: EmailRecipient;
        templateName: K;
        props: Parameters<typeof TemplateManager.renderTemplate<K>>[1];
    }): Promise<void> {
        const { subject, html, text } = await TemplateManager.renderTemplate(templateName, props);

        await this.transporter.sendMail({
            from: appConfig.mail.from,
            to,
            subject,
            html,
            text,
        });
    }
}
