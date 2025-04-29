import type { EmailTemplate } from '@be/email/EmailTemplateInterface';
import { render as renderHtml } from '@react-email/render';

/**
 * Renders an EmailTemplate with the given props for testing purposes.
 *
 * Returns the subject, HTML body, and text body, ready for snapshot testing.
 *
 * @param template - The EmailTemplate instance to render
 * @param props - The props passed into the template
 * @returns An object containing subject, html, and text outputs
 */
export async function renderEmailTemplate<T>(template: EmailTemplate<T>, props: T) {
    const subject = template.subject(props);
    const html = await renderHtml(template.html(props));
    const text = template.text(props);

    return { subject, html, text };
}
