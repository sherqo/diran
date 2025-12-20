import { AiRequest, AiResponseData } from '@diran/shared';
import type { BlockOperation } from '@diran/shared/types/collaboration';
import { ApiError } from '#lib/middleware/errorHandler';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

function buildDocumentContext(documentContext: AiRequest['documentContext'], currentBlock?: AiRequest['currentBlock']): string {
    if (!documentContext || documentContext.length === 0) return '';

    let context = '\n\nDocument Context (surrounding blocks):\n';
    documentContext.forEach((block, idx) => {
        const isCurrent = block.id === currentBlock?.id;
        context += `${idx + 1}. [${isCurrent ? 'CURRENT' : ''}] Block ID: ${block.id}, Type: ${block.type}\n   Content: ${JSON.stringify(block.content)}\n`;
    });
    return context;
}

function buildSystemPrompt(prompt: string, currentBlock: AiRequest['currentBlock'], selectedText?: string, contextInfo?: string): string {
    return `You are a document editor AI assistant. Your job is to help users with their documents.

You must ALWAYS respond with valid JSON in this exact format:

{
  "type": "edit",
  "operations": [...]
}

OR

{
  "type": "message",
  "message": "your response here"
}

## When to use type "edit":
- User wants to change, modify, rewrite, or improve existing text
- User wants to add new content (paragraphs, headings, lists)
- User wants to delete or remove content
- User wants to format or style text
- User asks to summarize, expand, shorten, or rephrase
- Any instruction that requires modifying the document
- Keywords: make, change, add, delete, rewrite, fix, improve, summarize, expand, create, insert, update, remove

## When to use type "message":
- User asks general questions about writing
- User asks for explanations without applying changes
- User requests advice or tips
- User asks "what" or "how" questions about concepts

## Edit Response Structure:
{
  "type": "edit",
  "operations": [
    { "op": "update", "blockId": "actual-block-id", "changes": {"content": [{"type": "text", "text": "..."}]} },
    { "op": "insert", "blockId": "new-block-id", "afterBlockId": "actual-block-id-or-null", "block": {...} },
    { "op": "delete", "blockId": "actual-block-id" }
  ]
}

Operation types:
- update: Modify an existing block. Use "changes" object with the properties to update (e.g., {"content": [...]})
- insert: Add a new block. Provide "blockId" for the new block, "afterBlockId" where to insert (null = at start), and "block" object
- delete: Remove a block by its ID

Block object structure:
{
  "id": "unique-block-id",
  "type": "paragraph" | "heading" | "bulletListItem" | "numberedListItem" | "checkListItem",
  "content": [{"type": "text", "text": "..."}],
  "props": {} // Optional properties like {"level": 2} for headings
}

Examples:
- Update content: {"op": "update", "blockId": "block-123", "changes": {"content": [{"type": "text", "text": "new text"}]}}
- Insert paragraph: {"op": "insert", "blockId": "new-456", "afterBlockId": "block-123", "block": {"id": "new-456", "type": "paragraph", "content": [{"type": "text", "text": "text"}]}}
- Insert heading: {"op": "insert", "blockId": "new-789", "afterBlockId": "block-123", "block": {"id": "new-789", "type": "heading", "props": {"level": 2}, "content": [{"type": "text", "text": "Title"}]}}
- Delete: {"op": "delete", "blockId": "block-123"}

Content format:
- Plain: [{"type": "text", "text": "text"}]
- Bold: [{"type": "text", "text": "bold", "styles": {"bold": true}}]
- Mixed: [{"type": "text", "text": "normal "}, {"type": "text", "text": "bold", "styles": {"bold": true}}]

## Message Response Structure:
{
  "type": "message",
  "message": "Your helpful response here in plain text"
}

${contextInfo || ''}

Current Block: ${currentBlock ? `ID: ${currentBlock.id}, Type: ${currentBlock.type}, Content: ${JSON.stringify(currentBlock.content)}` : 'None'}
${selectedText ? `Selected Text: "${selectedText}"` : ''}

User Request: ${prompt}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no extra text.`;
}

// this is AI generated function...
function cleanOperations(operations: unknown[]): BlockOperation[] {
    if (!Array.isArray(operations)) return [];

    return operations
        .map((op: unknown) => {
            if (!op || typeof op !== 'object') return null;

            const operation = op as Record<string, unknown>;

            // Ensure all operations have required fields
            if (operation.op === 'insert' && typeof operation.block === 'object' && operation.block) {
                const block = operation.block as Record<string, unknown>;
                // Ensure block has an id
                if (!block.id) {
                    block.id = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                }
            }

            return operation as BlockOperation;
        })
        .filter((op): op is BlockOperation => op !== null);
}

function parseAiResponse(aiText: string): AiResponseData {
    let trimmed = aiText.trim();

    // Remove markdown code blocks if present
    if (trimmed.includes('```')) {
        trimmed = trimmed
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();
    }

    const parsed = JSON.parse(trimmed);

    if (parsed.type === 'edit' && parsed.operations && Array.isArray(parsed.operations)) {
        console.log('[AI Service] Edit response with operations:', parsed.operations.length);
        return {
            type: 'edit',
            operations: cleanOperations(parsed.operations),
        };
    }

    if (parsed.type === 'message' && parsed.message) {
        console.log('[AI Service] Message response');
        return {
            type: 'message',
            message: parsed.message,
        };
    }

    console.error('[AI Service] Invalid response format:', parsed);
    throw new Error('Invalid response format from AI');
}

export async function callAi(request: AiRequest): Promise<AiResponseData> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new ApiError('AI service not configured', HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.AI_SERVICE_ERROR);
    }

    const { prompt, selectedText, currentBlock, documentContext } = request;

    console.log('[AI Service] Request:', {
        prompt,
        hasCurrentBlock: !!currentBlock,
        hasSelectedText: !!selectedText,
        contextBlocks: documentContext?.length,
    });

    const contextInfo = buildDocumentContext(documentContext, currentBlock);
    const systemPrompt = buildSystemPrompt(prompt, currentBlock, selectedText, contextInfo);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096,
            },
        }),
    });

    if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || response.statusText;

        if (response.status === 429) {
            throw new ApiError('AI rate limit exceeded. Please wait and try again.', HttpStatus.TOO_MANY_REQUESTS, ErrorCode.AI_RATE_LIMIT);
        }

        if (response.status === 503) {
            throw new ApiError(
                'AI service is temporarily unavailable. Please try again.',
                HttpStatus.SERVICE_UNAVAILABLE,
                ErrorCode.AI_SERVICE_ERROR
            );
        }

        throw new ApiError(`AI service error: ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.AI_SERVICE_ERROR);
    }

    const data: any = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log('[AI Service] Raw AI response (first 300 chars):', aiText?.substring(0, 300));

    if (!aiText) {
        throw new ApiError('No response from AI', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.AI_SERVICE_ERROR);
    }

    try {
        console.log('[AI Service] Attempting to parse JSON response');
        return parseAiResponse(aiText);
    } catch (e) {
        console.error('[AI Service] JSON parse failed:', e);
        console.log('[AI Service] Attempted to parse:', aiText.substring(0, 500));
        throw new ApiError('Failed to parse AI response', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.AI_SERVICE_ERROR);
    }
}
