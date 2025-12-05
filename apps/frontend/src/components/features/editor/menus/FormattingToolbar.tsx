'use client';

import {
    BasicTextStyleButton,
    BlockTypeSelect,
    ColorStyleButton,
    CreateLinkButton,
    FormattingToolbar,
    TextAlignButton,
} from '@blocknote/react';

/**
 * Custom Formatting Toolbar - appears when selecting text.
 * Clean, essential buttons only. Fast and keyboard-friendly.
 */
export function CustomFormattingToolbar() {
    return (
        <FormattingToolbar>
            {/* Block type selector */}
            <BlockTypeSelect key="blockTypeSelect" />

            {/* Text styles */}
            <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
            <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
            <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
            <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
            <BasicTextStyleButton basicTextStyle="code" key="codeStyleButton" />

            {/* Colors */}
            <ColorStyleButton key="colorStyleButton" />

            {/* Alignment */}
            <TextAlignButton textAlignment="left" key="textAlignLeftButton" />
            <TextAlignButton textAlignment="center" key="textAlignCenterButton" />
            <TextAlignButton textAlignment="right" key="textAlignRightButton" />

            {/* Links */}
            <CreateLinkButton key="createLinkButton" />
        </FormattingToolbar>
    );
}
