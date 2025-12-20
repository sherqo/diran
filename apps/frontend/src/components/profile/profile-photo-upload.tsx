'use client';

import { useState, useRef } from 'react';
import { uploadProfilePhotoApi } from '@/lib/api/user';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface ProfilePhotoUploadProps {
    currentPhotoUrl?: string;
    userName: string;
    onUploadSuccess?: (newPhotoUrl: string) => void;
}

export function ProfilePhotoUpload({ currentPhotoUrl, userName, onUploadSuccess }: ProfilePhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        // Validate file size (20MB)
        if (file.size > 20 * 1024 * 1024) {
            showToast('Image size must be less than 20MB', 'error');
            return;
        }

        setUploading(true);

        try {
            const result = await uploadProfilePhotoApi(file);

            if (result.success) {
                const newPhotoUrl = result.data.user.photo;
                setPhotoUrl(newPhotoUrl);
                onUploadSuccess?.(newPhotoUrl || '');
                showToast('Profile photo updated successfully', 'success');
            } else {
                showToast(result.error.message || 'Failed to upload photo', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Failed to upload photo', 'error');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        // Prevent clicks from bubbling to parent Dialog overlay which may close the modal
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Avatar className="h-32 w-32">
                    <AvatarImage src={photoUrl} alt={userName} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>

                <Button
                    size="icon"
                    variant="secondary"
                    type="button"
                    className="absolute -right-2 -bottom-2 h-10 w-10 rounded-full shadow-lg"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={handleButtonClick}
                    disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={e => {
                    e.stopPropagation();
                    handleFileSelect(e);
                }}
                onClick={e => e.stopPropagation()}
                className="hidden"
                disabled={uploading}
            />

            <div className="text-center">
                <p className="text-muted-foreground text-sm">Click the camera icon to upload a new photo</p>
                <p className="text-muted-foreground text-xs">JPG, PNG, WebP or GIF (max 5MB)</p>
            </div>
        </div>
    );
}
