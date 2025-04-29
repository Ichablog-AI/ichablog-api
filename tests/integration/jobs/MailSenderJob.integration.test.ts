import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { appContainer } from '@be/config/container';
import { MailSenderJob, type MailSenderJobParams } from '@be/jobs/MailSenderJob';
import { clearMailhogInbox, getMailhogMessages } from '@be/test-helpers/mailhogHelper';

describe('MailSenderJob Integration', () => {
    beforeAll(async () => {
        await clearMailhogInbox();
    });

    afterAll(async () => {
        await clearMailhogInbox();
    });

    it('should send an email and it should arrive in Mailhog', async () => {
        const params: MailSenderJobParams = {
            to: 'integration@example.com',
            templateName: 'sample',
            props: { name: 'Integration Tester', url: 'https://example.com/integration' },
        };

        const job = appContainer.resolve(MailSenderJob);
        await job.processor(params);

        // Wait a little for Mailhog to receive it
        await new Promise((resolve) => setTimeout(resolve, 500));

        const messages = await getMailhogMessages();
        const latest = messages[0];

        expect(latest).toBeDefined();
        expect(latest.Content.Headers.Subject[0]).toContain('Welcome');
        expect(latest.Content.Headers.To[0]).toContain('integration@example.com');
        expect(latest.Content.Body).toContain('Integration Tester');
    });
});
