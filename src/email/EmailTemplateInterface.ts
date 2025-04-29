import type { JSX } from 'react';

export interface EmailTemplate<T> {
    subject: (props: T) => string;
    html: (props: T) => JSX.Element;
    text: (props: T) => string;
}
