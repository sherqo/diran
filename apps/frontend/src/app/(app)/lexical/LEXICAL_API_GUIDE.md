# Lexical Editor - API Integration Guide

## Overview

This Lexical editor implementation includes **real-time change tracking** that detects when nodes are added, deleted, or modified. You can use this to call your backend APIs and keep your database in sync.

---

## 📊 Editor Schema

### Registered Node Types

The editor supports these node types:

- `block` - Custom block node with unique IDs
- `heading` - H1, H2, H3, etc.
- `quote` - Blockquote
- `list` - Unordered/ordered lists
- `listitem` - List items
- `code` - Code blocks
- `code-highlight` - Syntax highlighted code
- `link` - Hyperlinks
- `paragraph` - Paragraphs (default)
- `text` - Text nodes
- `linebreak` - Line breaks

### JSON Schema Example

```json
{
  "root": {
    "children": [
      {
        "children": [
          {
            "detail": 0,
            "format": 0,
            "mode": "normal",
            "style": "",
            "text": "Hello world",
            "type": "text",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1
      }
    ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
}
```

---

## 🔄 Change Detection System

The editor automatically detects three types of changes:

### 1. **Node Added** 🟢

Triggered when a new node is created (new paragraph, heading, list, etc.)

```typescript
// Console output example:
{
  method: 'POST',
  url: '/api/nodes/add',
  body: {
    nodeKey: 'paragraph',
    data: {
      type: 'paragraph',
      children: [...],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1
    }
  }
}
```

**Your API Implementation:**
```typescript
// POST /api/nodes/add
export async function POST(request: Request) {
  const { nodeKey, data } = await request.json();
  
  // Save to database
  await db.nodes.create({
    key: nodeKey,
    type: data.type,
    content: data,
    pageId: getCurrentPageId(),
  });
  
  return Response.json({ success: true });
}
```

---

### 2. **Node Deleted** 🔴

Triggered when a node is removed from the editor

```typescript
// Console output example:
{
  method: 'DELETE',
  url: '/api/nodes/abc123'
}
```

**Your API Implementation:**
```typescript
// DELETE /api/nodes/[nodeKey]
export async function DELETE(
  request: Request,
  { params }: { params: { nodeKey: string } }
) {
  await db.nodes.delete({
    where: { key: params.nodeKey }
  });
  
  return Response.json({ success: true });
}
```

---

### 3. **Node Modified** 🟡

Triggered when a node's content changes (typing, formatting, etc.)

```typescript
// Console output example:
{
  method: 'PATCH',
  url: '/api/nodes/paragraph',
  body: {
    before: { /* previous state */ },
    after: { /* new state */ }
  }
}
```

**Your API Implementation:**
```typescript
// PATCH /api/nodes/[nodeKey]
export async function PATCH(
  request: Request,
  { params }: { params: { nodeKey: string } }
) {
  const { after } = await request.json();
  
  await db.nodes.update({
    where: { key: params.nodeKey },
    data: { content: after }
  });
  
  return Response.json({ success: true });
}
```

---

## 🚀 How to Enable API Calls

Currently, API calls are logged to the console. To enable actual API calls:

### Option 1: Uncomment the fetch calls

In `page.tsx`, find the `ChangeTrackingPlugin` and uncomment the fetch calls:

```typescript
case 'added':
  console.log('🟢 API Call: Add Node', {...});
  // Uncomment this:
  fetch('/api/nodes/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      nodeKey: change.nodeKey, 
      data: change.after 
    })
  });
  break;
```

### Option 2: Create a custom API handler

```typescript
// lib/api/nodes.ts
export async function syncNodeChange(change: NodeChange) {
  const apiMap = {
    added: async () => {
      return fetch('/api/nodes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeKey: change.nodeKey,
          data: change.after,
        }),
      });
    },
    deleted: async () => {
      return fetch(`/api/nodes/${change.nodeKey}`, {
        method: 'DELETE',
      });
    },
    modified: async () => {
      return fetch(`/api/nodes/${change.nodeKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: change.after,
        }),
      });
    },
  };

  return apiMap[change.type]();
}
```

Then in `ChangeTrackingPlugin`:
```typescript
import { syncNodeChange } from '@/lib/api/nodes';

// ...
changes.forEach((change) => {
  syncNodeChange(change).catch(console.error);
});
```

---

## 📦 Database Schema Example

Here's a suggested Prisma schema for storing Lexical nodes:

```prisma
model Page {
  id        String   @id @default(cuid())
  title     String
  nodes     Node[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Node {
  id        String   @id @default(cuid())
  key       String   @unique
  type      String
  content   Json
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([pageId])
  @@index([key])
}
```

---

## 🎯 Testing the System

1. **Start the dev server**: Open the Lexical page
2. **Type some text**: Watch the "Changes (API Calls)" panel
3. **See real-time changes**: 
   - Type text → `MODIFIED` events
   - Press Enter (new paragraph) → `ADDED` event
   - Delete content → `DELETED` event
4. **Check console**: See the API payloads that would be sent

---

## 🔍 Debugging Tips

### View the full JSON structure
The "Current JSON Schema" panel shows the complete editor state at any time.

### View individual change payloads
Each change in the log has a "View API payload" dropdown showing exactly what would be sent to your API.

### Throttle API calls
If changes happen too frequently, add debouncing:

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSync = useDebouncedCallback((change) => {
  syncNodeChange(change);
}, 500);

changes.forEach((change) => {
  debouncedSync(change);
});
```

---

## 🎨 Customization

### Change detection sensitivity
Modify the `detectChanges` function to customize what counts as a change.

### Add more metadata
Include user info, timestamps, or revision history:

```typescript
{
  nodeKey: change.nodeKey,
  data: change.after,
  userId: getCurrentUserId(),
  timestamp: Date.now(),
  revision: incrementRevision(),
}
```

### Batch operations
Collect multiple changes and send them together:

```typescript
const [pendingChanges, setPendingChanges] = useState<NodeChange[]>([]);

// Batch send every 2 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (pendingChanges.length > 0) {
      fetch('/api/nodes/batch', {
        method: 'POST',
        body: JSON.stringify({ changes: pendingChanges }),
      });
      setPendingChanges([]);
    }
  }, 2000);
  
  return () => clearInterval(interval);
}, [pendingChanges]);
```

---

## ✅ Summary

- ✅ **Working Lexical editor** with latest APIs
- ✅ **Change detection** for add/delete/modify operations
- ✅ **Visual feedback** showing what API calls to make
- ✅ **Full JSON schema** visible in real-time
- ✅ **8 node types** registered (block, heading, quote, list, etc.)
- ✅ **Ready to integrate** with your backend

**Next steps:** Uncomment the API calls or implement the custom handler to connect to your database!
