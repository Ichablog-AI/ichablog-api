import { beforeEach, describe, expect, it } from 'bun:test';
import { appContainer } from '@be/config/container';
import { MailService } from '@be/email/MailService';
import { clearMailhogInbox, getMailhogMessages } from '@be/test-helpers/mailhogHelper';

describe('MailService Integration', () => {
    beforeEach(async () => {
        await clearMailhogInbox();
    });

    it('should send an email that appears in Mailhog', async () => {
        const mailService = appContainer.resolve(MailService);

        await mailService.send({
            to: 'integration-test@example.com',
            templateName: 'sample',
            props: {
                name: 'Integration Tester',
                url: 'https://example.com/integration',
            },
        });

        const messages = await getMailhogMessages();
        expect(messages.length).toBeGreaterThan(0);

        const found = messages.find((msg) =>
            msg.Content.Headers.Subject?.some((s) => s.includes('Integration Tester'))
        );

        expect(found).toBeDefined();
        expect(found?.Content.Headers.To?.some((to) => to.includes('integration-test@example.com'))).toBeTruthy();
        expect(found?.Content.Body).toContain('https://example.com/integration');
    });

    it('should handle invalid recipient address', async () => {
        const mailService = appContainer.resolve(MailService);

        // Test with an invalid email format
        const sendPromise = mailService.send({
            to: 'not-a-valid-email',
            templateName: 'sample',
            props: {
                name: 'Test',
                url: 'https://example.com',
            },
        });

        // Expect the promise to reject or handle the error appropriately
        // The exact behavior depends on how MailService and the underlying transport handle invalid emails
        expect(sendPromise).rejects.toThrow();
    });
});
