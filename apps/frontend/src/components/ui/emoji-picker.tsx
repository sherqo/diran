'use client';

import * as React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
    value?: string;
    onChange: (emoji: string) => void;
    disabled?: boolean;
}

export function EmojiPicker({ value, onChange, disabled }: EmojiPickerProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (emoji: { native: string }) => {
        onChange(emoji.native);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="icon" disabled={disabled} className="h-10 w-10 text-lg">
                    {value || <Smile className="h-4 w-4" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto border-none p-0 shadow-xl" align="start" sideOffset={8}>
                <Picker
                    data={data}
                    onEmojiSelect={handleSelect}
                    theme="auto"
                    previewPosition="none"
                    skinTonePosition="search"
                    maxFrequentRows={2}
                />
            </PopoverContent>
        </Popover>
    );
}
