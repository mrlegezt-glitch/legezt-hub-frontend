/**
 * Escapes HTML special characters in a string to prevent XSS attacks.
 * Converts &, <, >, ", and ' to their HTML entity equivalents.
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Safely converts plain text with newlines into HTML with <br/> tags.
 * Escapes HTML entities first to prevent XSS, then replaces newlines.
 */
export function safeTextToHtml(text: string): string {
    return escapeHtml(text).replace(/\n/g, '<br/>');
}
