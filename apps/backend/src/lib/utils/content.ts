/**
 * Extracts plain text from Block.content for search indexing.
 *
 * Content formats:
 * - Pages: { title?: string, icon?: string }
 * - Blocks: { __props: {...}, __content: [{ type: "text", text: "...", styles: {} }] }
 */

interface BlockContent {
    // Page
    title?: string;
    // Block
    __content?: Array<{ text?: string; content?: Array<{ text?: string }> }>;
}

/**
 * Extracts plain text from Block.content field.
 */
export function extractPlainTextFromContent(content: unknown): string {
    if (!content || typeof content !== 'object') {
        return '';
    }

    const c = content as BlockContent;

    // Page content - return title
    if (c.title) {
        return c.title;
    }

    // Block content - extract text from __content array
    if (Array.isArray(c.__content)) {
        return c.__content
            .map(item => {
                // Direct text
                if (item.text) return item.text;
                // Link with nested content
                if (item.content) return item.content.map(i => i.text || '').join('');
                return '';
            })
            .join('');
    }

    return '';
}
