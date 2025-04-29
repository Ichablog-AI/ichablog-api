import { beforeEach, describe, expect, it } from 'bun:test';
import { MailService } from '@be/email/MailService';
import { createMockTransporter } from '@be/email/mockTransporter';

/**
 * Unit tests for MailService using a mock transporter.
 */
describe('MailService', () => {
    let mailService: MailService;
    let mockTransporter: ReturnType<typeof createMockTransporter>;

    beforeEach(() => {
        mockTransporter = createMockTransporter();
        mailService = new MailService(mockTransporter.transporter);
        mockTransporter.clear();
    });

    it('should send an email and record it in mock transporter', async () => {
        await mailService.send({
            to: 'unit-test@example.com',
            templateName: 'sample',
            props: {
                name: 'Unit Tester',
                url: 'https://example.com/unit-test',
            },
        });

        const sentEmails = mockTransporter.getSentEmails();
        expect(sentEmails.length).toBe(1);

        const sentEmail = sentEmails[0];

        // Core field assertions
        expect(sentEmail.message.to).toEqual('unit-test@example.com');
        expect(sentEmail.message.from).toBeDefined();
        expect(typeof sentEmail.message.subject).toBe('string');
        expect(typeof sentEmail.message.html).toBe('string');
        expect(typeof sentEmail.message.text).toBe('string');
    });

    it('should clear sent emails between tests', async () => {
        const sentEmails = mockTransporter.getSentEmails();
        expect(sentEmails.length).toBe(0);
    });
});
