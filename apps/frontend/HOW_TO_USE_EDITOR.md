# 📝 Simple Editor.js Guide

## Basic Usage - Just 3 Steps!

### 1. Import the Editor

```tsx
import { useRef } from 'react';
import { SimpleEditor, SimpleEditorRef } from '@/components/features/editor';
```

### 2. Use it in your component

```tsx
function MyPage() {
    const editorRef = useRef<SimpleEditorRef>(null);

    return <SimpleEditor ref={editorRef} />;
}
```

### 3. Get the data when YOU want it

```tsx
const handleSave = async () => {
    const data = await editorRef.current?.save();
    console.log(data); // This is your content!

    // Now do whatever you want with it:
    // - Send to backend API
    // - Store in localStorage
    // - Process it
    // - etc.
};
```

---

## What the Editor Outputs

When you call `editorRef.current?.save()`, you get this:

```json
{
    "blocks": [
        {
            "id": "abc123",
            "type": "header",
            "data": {
                "text": "My Heading",
                "level": 1
            }
        },
        {
            "id": "xyz789",
            "type": "paragraph",
            "data": {
                "text": "Some paragraph text here..."
            }
        },
        {
            "id": "def456",
            "type": "list",
            "data": {
                "style": "unordered",
                "items": ["Item 1", "Item 2", "Item 3"]
            }
        }
    ],
    "time": 1732550400000,
    "version": "2.31.0"
}
```

---

## Adding Custom Tools (Blocks)

Want code blocks, images, tables? Easy!

### Step 1: Install the tool

```bash
cd apps/frontend
npm install @editorjs/code
npm install @editorjs/quote
npm install @editorjs/checklist
```

### Step 2: Add it to the editor

Edit `apps/frontend/src/components/features/editor/BlockEditor.tsx`:

```tsx
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Code from '@editorjs/code';      // NEW
import Quote from '@editorjs/quote';    // NEW
import Checklist from '@editorjs/checklist'; // NEW

// In the EditorJS config:
tools: {
    header: Header,
    list: List,
    code: Code,        // Add this
    quote: Quote,      // Add this
    checklist: Checklist, // Add this
}
```

That's it! Now you have more blocks.

---

## Creating Your OWN Custom Block

Want a totally custom block? Here's how:

### Example: Simple Alert Block

Create `apps/frontend/src/components/features/editor/tools/AlertTool.ts`:

```typescript
export class AlertTool {
    static get toolbox() {
        return {
            title: 'Alert',
            icon: '⚠️',
        };
    }

    constructor({ data }: { data: { text: string; type: string } }) {
        this.data = data || { text: '', type: 'info' };
        this.wrapper = null;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('alert-tool');

        // Create input for text
        const input = document.createElement('input');
        input.value = this.data.text || '';
        input.placeholder = 'Alert message...';
        input.addEventListener('input', e => {
            this.data.text = (e.target as HTMLInputElement).value;
        });

        // Create type selector
        const select = document.createElement('select');
        ['info', 'warning', 'error', 'success'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            option.selected = this.data.type === type;
            select.appendChild(option);
        });
        select.addEventListener('change', e => {
            this.data.type = (e.target as HTMLSelectElement).value;
        });

        this.wrapper.appendChild(input);
        this.wrapper.appendChild(select);

        return this.wrapper;
    }

    save() {
        return this.data;
    }
}
```

Then add it to your editor:

```tsx
import { AlertTool } from './tools/AlertTool';

tools: {
    header: Header,
    list: List,
    alert: AlertTool,  // Your custom block!
}
```

Output will be:

```json
{
    "data": {
        "text": "Be careful!",
        "type": "warning"
    },
    "type": "alert"
}
```

---

## Configuring Tool Options

You can customize how tools work:

```tsx
tools: {
    header: {
        class: Header,
        config: {
            placeholder: 'Enter a heading',
            levels: [1, 2, 3],  // Only H1, H2, H3
            defaultLevel: 2      // Start with H2
        }
    },
    list: {
        class: List,
        inlineToolbar: true,  // Show formatting toolbar
        config: {
            defaultStyle: 'unordered'  // Start with bullets
        }
    },
    code: {
        class: Code,
        config: {
            placeholder: 'Enter code here...'
        }
    }
}
```

---

## Loading Existing Data

```tsx
const existingData = {
    blocks: [
        {
            type: 'paragraph',
            data: { text: 'Previously saved content' },
        },
    ],
};

<SimpleEditor ref={editorRef} initialData={existingData} />;
```

---

## Backend Integration Example

### Saving to your API:

```tsx
import { createBlockApi } from '@/lib/api/block';

const handleSave = async () => {
    // 1. Get data from editor
    const editorData = await editorRef.current?.save();

    // 2. Send to your backend
    const result = await createBlockApi({
        type: 'PARAGRAPH', // Your block type from Prisma
        parentId: null,
        content: editorData, // Store the whole Editor.js output
        prevId: null,
        nextId: null,
    });

    if (result.success) {
        alert('Saved!');
    }
};
```

### Loading from your API:

```tsx
import { getBlockApi } from '@/lib/api/block';

useEffect(() => {
    async function loadBlock() {
        const result = await getBlockApi(blockId);
        if (result.success && result.data) {
            // The content field has your Editor.js data
            setInitialData(result.data.block.content);
        }
    }
    loadBlock();
}, [blockId]);

return <SimpleEditor ref={editorRef} initialData={initialData} />;
```

---

## Popular Tools to Add

```bash
npm install @editorjs/image        # Images
npm install @editorjs/table        # Tables
npm install @editorjs/code         # Code blocks
npm install @editorjs/quote        # Quotes
npm install @editorjs/checklist    # Todo lists
npm install @editorjs/embed        # YouTube/Vimeo
npm install @editorjs/delimiter    # Dividers
npm install @editorjs/warning      # Warning boxes
npm install @editorjs/marker       # Highlight text
npm install @editorjs/inline-code  # Inline code
```

---

## Complete Example

```tsx
'use client';

import { useRef } from 'react';
import { SimpleEditor, SimpleEditorRef } from '@/components/features/editor';
import { createBlockApi } from '@/lib/api/block';

export default function MyEditor() {
    const editorRef = useRef<SimpleEditorRef>(null);

    const saveToBackend = async () => {
        // Get the data
        const data = await editorRef.current?.save();

        // Send to your API
        const result = await createBlockApi({
            type: 'PARAGRAPH',
            parentId: null,
            content: data, // Editor.js output goes here
            prevId: null,
            nextId: null,
        });

        if (result.success) {
            console.log('Saved!', result.data);
        }
    };

    return (
        <div>
            <SimpleEditor ref={editorRef} />
            <button onClick={saveToBackend}>Save to Backend</button>
        </div>
    );
}
```

---

## That's It!

**Super simple:**

1. Put `<SimpleEditor ref={editorRef} />` in your component
2. Call `await editorRef.current?.save()` when you want the data
3. Do whatever you want with that data

No auto-save, no complexity, YOU control everything!
