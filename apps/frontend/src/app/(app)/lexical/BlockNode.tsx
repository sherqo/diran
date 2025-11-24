// BlockNode.tsx - Custom block node with unique IDs
import {
    DOMConversionMap,
    DOMConversionOutput,
    ElementNode,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
    $applyNodeReplacement,
} from 'lexical';

// Generate unique IDs without external dependency
function generateId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function $convertParagraphElement(): DOMConversionOutput | null {
    const node = $createBlockNode({ type: 'paragraph' });
    return { node };
}

export type SerializedBlockNode = Spread<
    {
        blockType: string;
        id: string;
    },
    SerializedElementNode
>;

export class BlockNode extends ElementNode {
    __blockType: string;
    __id: string;

    static getType(): string {
        return 'block';
    }

    static clone(node: BlockNode): BlockNode {
        return new BlockNode(node.__blockType, node.__id, node.__key);
    }

    constructor(blockType = 'paragraph', id = generateId(), key?: NodeKey) {
        super(key);
        this.__blockType = blockType;
        this.__id = id;
    }

    createDOM(): HTMLElement {
        const element = document.createElement('div');
        element.className = 'block-node';
        element.setAttribute('data-block-id', this.__id);
        element.setAttribute('data-block-type', this.__blockType);
        return element;
    }

    updateDOM(): boolean {
        return false;
    }

    // This is what gets sent to your backend
    exportJSON(): SerializedBlockNode {
        return {
            ...super.exportJSON(),
            type: 'block',
            blockType: this.__blockType,
            id: this.__id,
            version: 1,
        };
    }

    // This is what you get back when you load from your DB
    static importJSON(serializedNode: SerializedBlockNode): BlockNode {
        const node = $createBlockNode({ type: serializedNode.blockType });
        node.__id = serializedNode.id;
        return node;
    }

    // HTML → Lexical (when pasting, etc.)
    static importDOM(): DOMConversionMap | null {
        return {
            div: (element: HTMLElement) => {
                if (element.hasAttribute('data-block-id')) {
                    return {
                        conversion: $convertParagraphElement,
                        priority: 1,
                    };
                }
                return null;
            },
        };
    }

    getBlockType(): string {
        return this.__blockType;
    }

    getBlockId(): string {
        return this.__id;
    }
}

export function $createBlockNode({ type = 'paragraph' }: { type?: string } = {}): BlockNode {
    return $applyNodeReplacement(new BlockNode(type));
}

export function $isBlockNode(node: LexicalNode | null | undefined): node is BlockNode {
    return node instanceof BlockNode;
}
