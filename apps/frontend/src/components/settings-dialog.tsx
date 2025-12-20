'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import * as React from 'react';
import { useTheme } from 'next-themes';

import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Avatar components are used inside the upload component
import { ProfilePhotoUpload } from '@/components/profile/profile-photo-upload';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfileApi, changePasswordApi } from '@/lib/api/user';
import { updateProfileSchema, changePasswordSchema } from '@/shared/validation/user';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Separator } from './ui/separator';

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { user, checkAuth } = useAuth();
    const { theme, setTheme } = useTheme();

    // Listen for openSettings event from command palette
    React.useEffect(() => {
        const handleOpenSettings = () => {
            onOpenChange(true);
        };

        window.addEventListener('openSettings', handleOpenSettings);
        return () => window.removeEventListener('openSettings', handleOpenSettings);
    }, [onOpenChange]);

    // Profile form state
    const [profileForm, setProfileForm] = React.useState({
        name: user?.name || '',
        photo: user?.photo || '',
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
    const profileValidation = useFormValidation(updateProfileSchema);

    // Password form state
    const [passwordForm, setPasswordForm] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);
    const passwordValidation = useFormValidation(changePasswordSchema);

    // Update form when user changes
    React.useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                photo: user.photo || '',
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = profileValidation.validate(profileForm);
        if (!validation.success) return;

        setIsUpdatingProfile(true);
        try {
            const result = await updateProfileApi(validation.data);

            if (result.success) {
                await checkAuth(); // Refresh user data
                profileValidation.clearErrors();
            } else {
                // Handle API error - you might want to show a toast here
                console.error('Failed to update profile:', result.error);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return; // You might want to show an error here
        }

        const validation = passwordValidation.validate({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
        });
        if (!validation.success) return;

        setIsChangingPassword(true);
        try {
            const result = await changePasswordApi(validation.data);

            if (result.success) {
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                passwordValidation.clearErrors();
                // You might want to show a success toast here
            } else {
                // Handle API error
                console.error('Failed to change password:', result.error);
            }
        } catch (error) {
            console.error('Error changing password:', error);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent
                className="max-h-[90vh] w-[min(92vw,64rem)] max-w-2xl overflow-hidden p-0"
                onPointerDownOutside={e => e.preventDefault()}
                onInteractOutside={e => e.preventDefault()}>
                <DialogHeader className="m-0 border-b px-6 py-4 text-left">
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                <div className="max-h-[calc(90vh-80px)] w-full overflow-y-auto px-6 py-6">
                    {/* Profile Information Section */}
                    <div className="mb-8 space-y-5">
                        <div>
                            <h2 className="mb-1 text-base font-semibold">Profile</h2>
                            <p className="text-muted-foreground text-sm">Manage your profile information</p>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="flex w-full flex-col items-stretch gap-6">
                                <div className="flex w-full justify-center">
                                    <ProfilePhotoUpload
                                        currentPhotoUrl={profileForm.photo}
                                        userName={profileForm.name || user?.name || 'User'}
                                        onUploadSuccess={async newUrl => {
                                            setProfileForm(prev => ({ ...prev, photo: newUrl }));
                                            try {
                                                await checkAuth();
                                                showToast('Profile photo updated', 'success');
                                            } catch {
                                                // ignore
                                            }
                                        }}
                                    />
                                </div>

                                <div className="w-full">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            className="w-full"
                                            value={profileForm.name}
                                            onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Your name"
                                        />
                                    </div>
                                </div>

                                <div className="w-full">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Email</Label>
                                        <Input value={user?.email || ''} disabled className="bg-muted w-full text-left" />
                                        <p className="text-muted-foreground text-left text-xs">Email cannot be changed</p>
                                    </div>
                                </div>
                            </div>

                            {profileValidation.hasErrors && <p className="text-destructive text-sm">{profileValidation.errorMessage}</p>}

                            <Button type="submit" disabled={isUpdatingProfile} size="sm">
                                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </div>

                    <Separator className="mb-8" />

                    {/* Change Password Section */}
                    <div className="mb-8 space-y-5">
                        <div>
                            <h2 className="mb-1 text-base font-semibold">Password</h2>
                            <p className="text-muted-foreground text-sm">Update your password</p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword" className="text-sm">
                                    Current Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        placeholder="Current password"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-sm">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="New password"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}>
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Confirm password"
                                />
                                {passwordForm.newPassword &&
                                    passwordForm.confirmPassword &&
                                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                                        <p className="text-destructive text-xs">Passwords don&#39;t match</p>
                                    )}
                            </div>

                            {passwordValidation.hasErrors && <p className="text-destructive text-sm">{passwordValidation.errorMessage}</p>}

                            <Button
                                type="submit"
                                size="sm"
                                disabled={isChangingPassword || passwordForm.newPassword !== passwordForm.confirmPassword}>
                                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Change Password
                            </Button>
                        </form>
                    </div>

                    <Separator className="mb-8" />

                    {/* Appearance Section */}
                    <div className="mb-8 space-y-5">
                        <div>
                            <h2 className="mb-1 text-base font-semibold">Appearance</h2>
                            <p className="text-muted-foreground text-sm">Choose your theme</p>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm">Theme</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setTheme('light')}
                                    className="flex-1">
                                    Light
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setTheme('dark')}
                                    className="flex-1">
                                    Dark
                                </Button>
                                <Button
                                    variant={theme === 'system' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setTheme('system')}
                                    className="flex-1">
                                    System
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-8" />

                    {/* Notifications Section */}
                    <div className="mb-8 space-y-5">
                        <div>
                            <h2 className="mb-1 text-base font-semibold">Notifications</h2>
                            <p className="text-muted-foreground text-sm">Manage notification preferences</p>
                        </div>

                        <p className="text-muted-foreground text-sm">Coming soon...</p>
                    </div>

                    <Separator className="mb-8" />

                    {/* Advanced Section */}
                    <div className="space-y-5">
                        <div>
                            <h2 className="mb-1 text-base font-semibold">Advanced</h2>
                            <p className="text-muted-foreground text-sm">Advanced options</p>
                        </div>

                        <p className="text-muted-foreground text-sm">Coming soon...</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
