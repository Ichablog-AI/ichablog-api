import { type EmailRecipient, MailService } from '@be/email/MailService';
import type { TemplateName } from '@be/email/TemplateManager';
import { JobBase } from '@be/resque/JobBase';
import type { RetryOptions } from '@be/resque/JobSpecInterface';
import { SharedQueue } from '@be/resque/SharedQueue';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { inject, singleton } from 'tsyringe';

export interface MailSenderJobParams<K extends TemplateName = TemplateName> {
    to: EmailRecipient;
    templateName: K;
    props: Parameters<typeof MailService.prototype.send<K>>[0]['props'];
}

@singleton()
export class MailSenderJob extends JobBase<MailSenderJobParams> {
    readonly queueName = 'mail-sender';
    readonly jobName = 'sendEmail';

    constructor(
        @inject(SharedQueue) sharedQueue: SharedQueue,
        @inject(LoggerRegistry) loggerRegistry: LoggerRegistry,
        @inject(MailService) private readonly mailService: MailService
    ) {
        super(sharedQueue, loggerRegistry.getLogger('MailSenderJob'));
    }

    readonly retryOptions: RetryOptions = {
        retries: 5,
        backoff: true,
        backoffDelay: 1000,
        backoffExponent: 2,
    };
    async processor(params: MailSenderJobParams): Promise<void> {
        const { to, templateName, props } = params;
        this.logger.info(`📨 Sending email: template=${templateName}, to=${to}`);

        try {
            await this.mailService.send({
                to,
                templateName,
                props,
            });

            this.logger.info(`✅ Email sent: template=${templateName}, to=${to}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send email: template=${templateName}, to=${to}`, { error });
            // Optional: you could rethrow to let the queue retry it
            throw error;
        }
    }
}
