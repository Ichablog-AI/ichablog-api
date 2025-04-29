import appConfig from '@be/config';

const MAILHOG_API_BASE = `http://${appConfig.mail.smtp.host}:8025/api`;

/**
 * Clears all messages from Mailhog inbox.
 */
export async function clearMailhogInbox() {
    const res = await fetch(`${MAILHOG_API_BASE}/v1/messages`, { method: 'DELETE' });
    if (!res.ok) {
        throw new Error(`Failed to clear Mailhog inbox: ${res.statusText}`);
    }
}

/**
 * Fetches all messages from Mailhog inbox.
 * @returns JSON array of messages
 */
export async function getMailhogMessages() {
    const res = await fetch(`${MAILHOG_API_BASE}/v2/messages`);
    if (!res.ok) {
        throw new Error(`Failed to fetch Mailhog messages: ${res.statusText}`);
    }
    const data = await res.json();
    return data.items as MailhogMessage[];
}

/**
 * Mailhog Message type (light version).
 */
export type MailhogMessage = {
    Content: {
        Headers: Record<string, string[]>;
        Body: string;
    };
};
