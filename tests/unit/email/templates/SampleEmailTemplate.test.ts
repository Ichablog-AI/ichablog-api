import { describe, expect, it } from 'bun:test';
import { SampleEmailTemplate } from '@be/email/templates/sample';
import { renderEmailTemplate } from '@be/test-helpers/renderEmailTemplate';

describe('SampleEmailTemplate', () => {
    it('should render correctly', async () => {
        const props = { name: 'Test User', url: 'https://example.com' };
        const { subject, html, text } = await renderEmailTemplate(SampleEmailTemplate, props);

        expect({ subject, html, text }).toMatchSnapshot();
    });
});
