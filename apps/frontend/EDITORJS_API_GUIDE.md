# **Editor.js API - Complete Guide** 📚

Complete breakdown of the API object you see in the console. This is the **Core API** that Editor.js provides to interact with the editor programmatically.

---

## **🔥 MOST IMPORTANT - You'll Use These A LOT**

### **1. `api.saver` - Get Editor Data**

```javascript
// Get all content from the editor
const data = await api.saver.save();
console.log(data);
// Returns: { blocks: [...], time: 1234567890 }
```

**When to use:**

- Save to database
- Auto-save drafts
- Export content
- **You use this in every save operation**

---

### **2. `api.blocks` - Manipulate Blocks**

**Most useful methods:**

```javascript
// Get how many blocks exist
const count = api.blocks.getBlocksCount();

// Get current focused block index
const currentIndex = api.blocks.getCurrentBlockIndex();

// Get a specific block by index
const block = api.blocks.getBlockByIndex(0);

// Get a block by its ID
const block = api.blocks.getById('block-id-123');

// Insert a new block
api.blocks.insert(
    'paragraph', // type
    { text: 'Hello!' }, // data
    {}, // config
    0, // index (optional)
    true, // focus it (optional)
    false, // replace existing (optional)
    'custom-uuid' // custom ID (optional, 7th param!)
);

// Delete a block by index
api.blocks.delete(2); // Deletes 3rd block

// Move a block
api.blocks.move(0, 2); // Move block from index 2 to index 0

// Clear all blocks
api.blocks.clear();

// Render new content
api.blocks.render({
    blocks: [{ type: 'paragraph', data: { text: 'New content' } }],
});

// Update a block's data
api.blocks.update('block-id', { text: 'Updated text' });
```

**When to use:**

- Adding/removing blocks programmatically
- Reordering content
- Building custom toolbars
- Implementing undo/redo
- **Core functionality for dynamic editing**

---

### **3. `api.caret` - Move Cursor**

```javascript
// Move cursor to first block
api.caret.setToFirstBlock();

// Move to last block
api.caret.setToLastBlock();

// Move to previous block
api.caret.setToPreviousBlock();

// Move to next block
api.caret.setToNextBlock();

// Move to specific block (by index)
api.caret.setToBlock(2);

// Focus the editor
api.caret.focus();
```

**When to use:**

- After inserting new blocks
- Keyboard navigation
- Custom shortcuts
- **User experience improvements**

---

## **⚡ SOMETIMES USEFUL - Advanced Features**

### **4. `api.toolbar` - Control Toolbar**

```javascript
// Open toolbar
api.toolbar.open();

// Close toolbar
api.toolbar.close();

// Toggle block settings menu
api.toolbar.toggleBlockSettings();

// Toggle toolbox (+ button menu)
api.toolbar.toggleToolbox();
```

**When to use:**

- Custom UI interactions
- Building custom editing modes
- Mobile-specific behavior

---

### **5. `api.notifier` - Show Notifications**

```javascript
// Show a notification
api.notifier.show({
    message: 'Content saved!',
    style: 'success', // success, warning, error
    time: 2000, // duration in ms
});
```

**When to use:**

- User feedback (save success, errors)
- Validation messages
- **Great for UX**

---

### **6. `api.selection` - Work with Text Selection**

```javascript
// Find a parent tag of selected text
const tag = api.selection.findParentTag('A'); // Find <a> tag

// Expand selection to a specific tag
api.selection.expandToTag('P'); // Select entire paragraph

// Save current selection
api.selection.save();

// Restore saved selection
api.selection.restore();

// Remove fake selection background
api.selection.removeFakeBackground();
```

**When to use:**

- Building custom inline tools (bold, italic, links)
- Text manipulation features
- Advanced text editing

---

### **7. `api.listeners` - Event Handling**

```javascript
// Add event listener
api.listeners.on(element, 'click', handler, useCapture);

// Remove event listener
api.listeners.off(element, 'click', handler);

// Remove by ID
api.listeners.offById(listenerId);
```

**When to use:**

- Custom interactions
- Event management in tools
- **Prevents memory leaks** (auto-cleanup)

---

### **8. `api.sanitizer` - Clean HTML**

```javascript
// Clean unsafe HTML
const clean = api.sanitizer.clean(dirtyHTML, {
    b: true, // allow <b>
    i: true, // allow <i>
    a: {
        href: true, // allow <a> with href attribute
    },
});
```

**When to use:**

- Pasting content from external sources
- Security (XSS prevention)
- Data validation

---

### **9. `api.readOnly` - Toggle Edit Mode**

```javascript
// Toggle read-only mode
api.readOnly.toggle();

// Check if read-only
const isReadOnly = api.readOnly.isEnabled;
```

**When to use:**

- View-only mode
- Published content display
- Permissions control

---

### **10. `api.inlineToolbar` - Inline Formatting**

```javascript
// Open inline toolbar (bold, italic, link)
api.inlineToolbar.open();

// Close inline toolbar
api.inlineToolbar.close();
```

**When to use:**

- Custom text formatting triggers
- Mobile-specific behavior

---

## **🎨 RARELY NEEDED - Special Cases**

### **11. `api.tooltip` - Show Tooltips**

```javascript
// Show tooltip
api.tooltip.show(element, content, options);

// Hide tooltip
api.tooltip.hide();

// Show on hover
api.tooltip.onHover(element, content, options);
```

**When to use:**

- Custom tool hints
- Help text

---

### **12. `api.i18n` - Translations**

```javascript
// Translate a string
const translated = api.i18n.t('Save');
```

**When to use:**

- Multi-language support
- Custom tools with translations

---

### **13. `api.styles` - CSS Classes**

```javascript
console.log(api.styles);
// {
//   block: 'cdx-block',
//   inlineToolButton: 'ce-inline-tool',
//   input: 'cdx-input',
//   loader: 'cdx-loader',
//   ...
// }
```

**When to use:**

- Styling custom tools consistently
- Matching Editor.js design

---

### **14. `api.ui` - UI Nodes**

```javascript
// Access editor UI elements
console.log(api.ui.nodes);
// { holder, wrapper, redactor, ... }
```

**When to use:**

- Custom UI integrations
- Advanced DOM manipulation

---

### **15. `api.events` - Custom Events**

```javascript
// Emit custom event
api.events.emit('myCustomEvent', data);

// Listen to event
api.events.on('myCustomEvent', handler);

// Remove listener
api.events.off('myCustomEvent', handler);
```

**When to use:**

- Plugin communication
- Custom workflows

---

### **16. `api.tools` - Tool Information**

```javascript
// Get available block tools
const tools = api.tools.getBlockTools();
```

**When to use:**

- Building custom toolbox UI
- Tool discovery

---

## **📊 PRIORITY SUMMARY**

### **Must Learn (Use Daily):**

1. ✅ `api.saver.save()` - Get content
2. ✅ `api.blocks.insert()` - Add blocks
3. ✅ `api.blocks.getBlocksCount()` - Count blocks
4. ✅ `api.blocks.delete()` - Remove blocks
5. ✅ `api.caret.focus()` - Focus editor

### **Learn Next (Use Often):**

6. `api.blocks.render()` - Load content
7. `api.blocks.clear()` - Reset editor
8. `api.blocks.getById()` - Get specific block
9. `api.notifier.show()` - User feedback
10. `api.caret.setToBlock()` - Navigate

### **Advanced (Special Cases):**

11. `api.selection.*` - Text selection
12. `api.toolbar.*` - Toolbar control
13. `api.sanitizer.clean()` - Clean HTML
14. `api.readOnly.toggle()` - View mode
15. Everything else - Learn when needed

---

## **🎯 Quick Reference: Common Tasks**

```javascript
// Save content
const data = await editor.save();

// Add a paragraph
editor.blocks.insert('paragraph', { text: 'Hello!' });

// Clear everything
editor.blocks.clear();

// Get block count
const count = editor.blocks.getBlocksCount();

// Show notification
editor.notifier.show({
    message: 'Saved!',
    style: 'success',
});

// Focus editor
editor.caret.focus();
```

---

## **Additional Resources**

- [Editor.js Official API Docs](https://editorjs.io/api)
- [Block API Documentation](https://editorjs.io/blocks)
- [Creating Custom Tools](https://editorjs.io/creating-a-block-tool)
