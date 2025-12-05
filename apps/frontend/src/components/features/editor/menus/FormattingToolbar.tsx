'use client';

import { BasicTextStyleButton, ColorStyleButton, CreateLinkButton, FormattingToolbar } from '@blocknote/react';

/**
 * Custom Formatting Toolbar - appears when selecting text.
 * Clean, essential buttons only. Fast and keyboard-friendly.
 */
export function CustomFormattingToolbar() {
    return (
        <FormattingToolbar>
            {/* Text styles */}
            <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
            <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
            <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
            <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
            <BasicTextStyleButton basicTextStyle="code" key="codeStyleButton" />

            {/* Colors */}
            <ColorStyleButton key="colorStyleButton" />

            {/* Links */}
            <CreateLinkButton key="createLinkButton" />
        </FormattingToolbar>
    );
}
