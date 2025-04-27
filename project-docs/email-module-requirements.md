# Email Module: Technical Requirements

This document defines the technical architecture and requirements for the email-sending module. It is intended for production use and as a foundation for future SaaS email infrastructure.

---

## Directory Structure
```
src/
└── email/
    ├── mail-config.ts                # Exports MailConfig and SMTP settings
    ├── MailService.ts                # Sends HTML + text emails via injected Transporter
    ├── EmailTemplateInterface.ts     # Interface for email templates
    ├── mockTransporter.ts            # Test-only transporter with memory recording
    ├── dev/
    │   ├── preview-email.ts          # Generates preview HTML for a given template and props
    │   └── props/
    │       └── sample.json           # Sample props for preview usage
    └── templates/
        └── sample.ts                 # Example of a typed email template
```

---

## Dependencies
- `nodemailer`
- `@react-email/render`
- `@react-email/components`

---

## mail-config.ts
```ts
import type { TransportOptions } from 'nodemailer';

export type MailConfig = {
  from: string;
  smtp: TransportOptions;
};

export const mailConfig: MailConfig = {
  from: 'Your App <no-reply@example.com>',
  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  },
};
```

---

## EmailTemplateInterface.ts
```ts
export interface EmailTemplate<T> {
  subject: (props: T) => string;
  html: (props: T) => JSX.Element;
  text: (props: T) => string;
}
```

---

## MailService.ts
```ts
import { render as renderHtml } from '@react-email/render';
import type { Transporter } from 'nodemailer';
import type { EmailTemplate } from './EmailTemplateInterface';
import { mailConfig } from './mail-config';

type EmailRecipient = 
  | string 
  | { name: string; emailAddress: string };

function formatRecipient(recipient: EmailRecipient): string {
  if (typeof recipient === 'string') {
    return recipient;
  }
  return `"${recipient.name}" <${recipient.emailAddress}>`;
}

export class MailService {
  private transporter: Transporter;

  constructor(transporter: Transporter) {
    this.transporter = transporter;
  }

  async send<T>({
    to,
    template,
    props,
  }: {
    to: EmailRecipient;
    template: EmailTemplate<T>;
    props: T;
  }) {
    const subject = template.subject(props);
    const html = renderHtml(template.html(props));
    const text = template.text(props);

    await this.transporter.sendMail({
      from: mailConfig.from,
      to: formatRecipient(to),
      subject,
      html,
      text,
    });
  }
}
```

---

## mockTransporter.ts
```ts
import type { Transporter, SendMailOptions, SentMessageInfo } from 'nodemailer';

export type SentEmailRecord = {
  message: SendMailOptions;
  info: SentMessageInfo;
};

export function createMockTransporter() {
  const sentEmails: SentEmailRecord[] = [];

  const transporter: Partial<Transporter> = {
    sendMail: async (message: SendMailOptions) => {
      const info: SentMessageInfo = {
        envelope: { from: message.from as string, to: Array.isArray(message.to) ? message.to : [message.to as string] },
        messageId: `<mock-${Date.now()}@local.test>`,
        response: '250 OK: message accepted',
        accepted: [message.to],
        rejected: [],
        pending: [],
      };

      sentEmails.push({ message, info });
      return info;
    },
  };

  return {
    transporter: transporter as Transporter,
    getSentEmails: () => sentEmails,
    clear: () => sentEmails.splice(0, sentEmails.length),
  };
}
```

---

## dev/preview-email.ts
```ts
import { render as renderHtml } from '@react-email/render';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';

const templateName = process.argv[2];
const outputPath = process.argv[3] || `preview/${templateName}.html`;
const propsPath = process.argv[4] || `src/email/dev/props/${templateName}.json`;

async function main() {
  const { [templateName]: template } = await import(`../templates/${templateName}.ts`);
  const props = JSON.parse(fs.readFileSync(propsPath, 'utf8'));

  const html = renderHtml(template.html(props));
  const text = template.text(props);
  const subject = template.subject(props);

  const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Email Preview: ${subject}</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    iframe, pre { width: 100%; height: 80vh; border: 1px solid #ccc; margin-top: 1rem; }
    .toggle { margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>${subject}</h1>
  <div class="toggle">
    <button onclick="show('html')">Show HTML</button>
    <button onclick="show('text')">Show Text</button>
  </div>
  <iframe id="html-view" srcdoc='${html.replace(/'/g, "&apos;")}'></iframe>
  <pre id="text-view" style="display:none;">${text}</pre>

  <script>
    function show(type) {
      document.getElementById('html-view').style.display = type === 'html' ? 'block' : 'none';
      document.getElementById('text-view').style.display = type === 'text' ? 'block' : 'none';
    }
  </script>
</body>
</html>`;

  const fullPath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, previewHtml, 'utf8');

  console.log(`✅ Preview written to ${fullPath}`);
  exec(`open "${fullPath}"`); // macOS; swap for xdg-open or start if needed
}

main().catch((err) => {
  console.error(`❌ Failed to generate preview:`, err);
  process.exit(1);
});
```

---

## templates/sample.ts
```ts
import { Html, Head, Body, Container, Text, Link } from '@react-email/components';
import type { EmailTemplate } from '../EmailTemplateInterface';

type Props = {
  name: string;
  url: string;
};

const subject = ({ name }: Props) => `Welcome, ${name}!`;

const html = ({ name, url }: Props) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <Text>Hi {name},</Text>
        <Text>Click the link below to get started:</Text>
        <Link href={url}>Activate your account</Link>
      </Container>
    </Body>
  </Html>
);

const text = ({ name, url }: Props) => `
Hi ${name},

Click the link below to get started:

${url}

Thanks,
Your App Team
`.trim();

export const SampleEmailTemplate: EmailTemplate<Props> = {
  subject,
  html,
  text,
};
```

---

## Future Extensions
- Optional open + click tracking (pixel/link injection)
- Scheduled or queued emails (BullMQ, Redis)
- Admin dashboard for inspecting email history
- Switch transport config to SES or custom SMTP in prod
- SaaS version of this for multi-tenant email delivery
- `mailService.preview()` shortcut or CLI integration

