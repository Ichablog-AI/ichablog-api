import appConfig from '@be/config';
import { MailService } from '@be/email/MailService';
import { registerSingletonFactory } from '@be/utils/registerSingletonFactory';
import nodemailer from 'nodemailer';
import type { DependencyContainer } from 'tsyringe';

/**
 * Registers MailService and Transporter in the DI container.
 */
export const registerEmailBindings = (container: DependencyContainer) => {
    registerSingletonFactory(container, MailService, () => {
        const transporter = nodemailer.createTransport(appConfig.mail.smtp);
        return new MailService(transporter);
    });
};
