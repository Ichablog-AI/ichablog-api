import { describe, expect, it, mock } from 'bun:test';
import type { MailService } from '@be/email/MailService';
import { MailSenderJob, type MailSenderJobParams } from '@be/jobs/MailSenderJob';
import type { SharedQueue } from '@be/resque/SharedQueue';
import { createMockLogger, createMockLoggerRegistry } from '@be/test-mocks/MockedLoggerRegistry';

describe('MailSenderJob', () => {
    it('should call MailService.send with correct parameters', async () => {
        const sharedQueue = mock() as unknown as SharedQueue;
        const logger = createMockLogger();
        const loggerRegistry = createMockLoggerRegistry(logger);

        const mockSend = mock();
        const mockMailService = {
            send: mockSend,
        } as unknown as MailService;

        const job = new MailSenderJob(sharedQueue, loggerRegistry, mockMailService);

        const params: MailSenderJobParams = {
            to: 'test@example.com',
            templateName: 'sample',
            props: { name: 'Test', url: 'https://example.com' },
        };

        await job.processor(params);

        expect(mockSend).toHaveBeenCalledWith({
            to: params.to,
            templateName: params.templateName,
            props: params.props,
        });

        expect(logger.info).toHaveBeenCalledWith(`📨 Sending email: template=${params.templateName}, to=${params.to}`);
    });
});
