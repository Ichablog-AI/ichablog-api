import type { SendMailOptions, SentMessageInfo, Transporter } from 'nodemailer';

/**
 * Record of a sent email captured by the mock transporter.
 */
export type SentEmailRecord = {
    message: SendMailOptions;
    info: SentMessageInfo;
};

/**
 * Creates an in-memory mock email transporter for testing purposes.
 *
 * Instead of sending real emails, this transporter records sent emails
 * into memory for inspection during tests.
 *
 * @returns An object containing the mock Transporter, a method to retrieve sent emails, and a method to clear them.
 */
export function createMockTransporter() {
    const sentEmails: SentEmailRecord[] = [];

    const transporter: Partial<Transporter> = {
        /**
         * Mocks sending an email by recording it into memory.
         *
         * @param message - The email message options that would have been sent.
         * @returns Mocked SentMessageInfo resembling a successful send.
         */
        async sendMail(message: SendMailOptions) {
            const info: SentMessageInfo = {
                envelope: {
                    from: typeof message.from === 'string' ? message.from : message.from?.address || '',
                    to: Array.isArray(message.to)
                        ? message.to.map((r) => (typeof r === 'string' ? r : r.address))
                        : message.to
                          ? [typeof message.to === 'string' ? message.to : message.to.address]
                          : [],
                },
                messageId: `<mock-${Date.now()}@local.test>`,
                response: '250 OK: message accepted',
                accepted: Array.isArray(message.to) ? message.to : message.to ? [message.to] : [],
                rejected: [],
                pending: [],
            };

            sentEmails.push({ message, info });
            return info;
        },
    };

    return {
        transporter: transporter as Transporter,

        /**
         * Retrieves all emails recorded by the mock transporter.
         *
         * @returns Array of sent email records.
         */
        getSentEmails: () => sentEmails,

        /**
         * Clears all recorded emails from memory.
         */
        clear: () => sentEmails.splice(0, sentEmails.length),
    };
}
