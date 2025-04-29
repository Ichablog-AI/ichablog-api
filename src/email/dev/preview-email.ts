import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { TemplateManager, type TemplateName, TemplateNames } from '@be/email/TemplateManager';

/**
 * Escapes special HTML characters in a string.
 */
function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * CLI tool to generate and open a preview of an email template.
 */
async function main() {
    const templateNameArg = process.argv[2];
    const outputPath = process.argv[3] || `email-preview/${templateNameArg}.html`;
    const propsPath = process.argv[4] || `src/email/dev/props/${templateNameArg}.json`;

    if (!templateNameArg) {
        console.error('❌ Template name is required. Example: bun run preview-email sample');
        process.exit(1);
    }

    if (!TemplateNames.includes(templateNameArg as TemplateName)) {
        console.error(`❌ Invalid template name '${templateNameArg}'. Must be one of: ${TemplateNames.join(', ')}`);
        process.exit(1);
    }

    const templateName = templateNameArg as TemplateName;

    try {
        const props = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
        const { subject, html, text } = await TemplateManager.renderTemplate(templateName, props);

        const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Email Preview: ${escapeHtml(subject)}</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    iframe, pre { width: 100%; height: 80vh; border: 1px solid #ccc; margin-top: 1rem; }
    .toggle { margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(subject)}</h1>
  <div class="toggle">
    <button onclick="show('html')">Show HTML</button>
    <button onclick="show('text')">Show Text</button>
  </div>
  <iframe id="html-view" srcdoc='${html.replace(/'/g, '&apos;')}'></iframe>
  <pre id="text-view" style="display:none;">${text}</pre>

  <script>
    function show(type) {
      document.getElementById('html-view').style.display = type === 'html' ? 'block' : 'none';
      document.getElementById('text-view').style.display = type === 'text' ? 'block' : 'none';
    }
  </script>
</body>
</html>`.trim();

        const fullPath = path.resolve(outputPath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, previewHtml, 'utf8');

        console.log(`✅ Preview generated at: ${fullPath}`);

        const openCommand =
            process.platform === 'darwin'
                ? `open "${fullPath}"`
                : process.platform === 'win32'
                  ? `start "" "${fullPath}"`
                  : `xdg-open "${fullPath}"`;

        exec(openCommand);
    } catch (error) {
        console.error('❌ Failed to generate preview:', error);
        process.exit(1);
    }
}

main();
