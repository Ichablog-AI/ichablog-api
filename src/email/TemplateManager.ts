import { render as renderHtml } from '@react-email/render';
import type { EmailTemplate } from './EmailTemplateInterface';
import { SampleEmailTemplate } from './templates/sample';
import type { SampleEmailProps } from './templates/sample';

/**
 * Valid template names for the application.
 */
export const TemplateNames = ['sample'] as const;
export type TemplateName = (typeof TemplateNames)[number];

/**
 * Mapping of template names to their EmailTemplates and props types.
 */
type TemplateMap = {
    sample: EmailTemplate<SampleEmailProps>;
};

/**
 * Extracts the props type for a given template name.
 */
type PropsTypeForTemplate<K extends keyof TemplateMap> = TemplateMap[K] extends EmailTemplate<infer P> ? P : never;

const templates: TemplateMap = {
    sample: SampleEmailTemplate,
};

/**
 * Template management utilities.
 */
export const TemplateManager = {
    /**
     * Loads a pre-imported email template by name.
     *
     * @param templateName - Name of the template
     * @returns The corresponding EmailTemplate instance with correct typing
     */
    loadTemplate: async <K extends keyof TemplateMap>(templateName: K): Promise<TemplateMap[K]> => {
        const template = templates[templateName];

        if (!template) {
            throw new Error(`Template '${templateName}' not found in TemplateManager.`);
        }

        return template;
    },

    /**
     * Renders subject, html, and text for a given template name and props.
     *
     * @param templateName - Template name
     * @param props - Props to pass to the template
     * @returns Rendered subject, html, and text
     */
    renderTemplate: async <K extends keyof TemplateMap>(
        templateName: K,
        props: PropsTypeForTemplate<K>
    ): Promise<{ subject: string; html: string; text: string }> => {
        const template = (await TemplateManager.loadTemplate(templateName)) as EmailTemplate<PropsTypeForTemplate<K>>;

        const subject = template.subject(props);
        const html = await renderHtml(template.html(props));
        const text = template.text(props);

        return { subject, html, text };
    },
};
