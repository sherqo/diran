// https://www.blocknotejs.org/docs/ui-components/formatting-toolbar

'use client';

import { BasicTextStyleButton, ColorStyleButton, CreateLinkButton, FormattingToolbar } from '@blocknote/react';
import AiToolbarButton from './AiToolbarButton';

/**
 * Custom Formatting Toolbar - appears when selecting text.
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

            {/* AI */}
            <AiToolbarButton />
        </FormattingToolbar>
    );
}
