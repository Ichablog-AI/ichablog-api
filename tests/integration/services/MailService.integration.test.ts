import { beforeEach, describe, expect, it } from 'bun:test';
import { appContainer } from '@be/config/container';
import { MailService } from '@be/email/MailService';
import { SampleEmailTemplate } from '@be/email/templates/sample';
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
});
