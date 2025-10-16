'use client';

import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { useTheme } from 'next-themes';

import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-full overflow-hidden p-0 sm:!max-w-xl md:!max-w-2xl">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                <div className="max-h-[calc(70vh)] w-full overflow-y-auto px-6 py-4">
                    {/* Profile Information Section */}
                    <div className="mb-8 space-y-6">
                        <div>
                            <h2 className="mb-2 text-lg font-semibold">Profile Information</h2>
                            <p className="text-muted-foreground mb-4 text-sm">Update your personal information and profile photo.</p>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={profileForm.photo} alt={profileForm.name} />
                                    <AvatarFallback className="text-lg">{profileForm.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="photo">Profile Photo URL</Label>
                                    <Input
                                        id="photo"
                                        type="url"
                                        placeholder="https://example.com/photo.jpg"
                                        value={profileForm.photo}
                                        onChange={e => setProfileForm(prev => ({ ...prev, photo: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    value={profileForm.name}
                                    onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter your display name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={user?.email || ''} disabled />
                                <p className="text-muted-foreground text-sm">Email cannot be changed.</p>
                            </div>

                            {profileValidation.hasErrors && <p className="text-destructive text-sm">{profileValidation.errorMessage}</p>}

                            <Button type="submit" disabled={isUpdatingProfile}>
                                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </form>
                    </div>

                    <Separator className="mb-8" />

                    {/* Change Password Section */}
                    <div className="mb-8 space-y-6">
                        <div>
                            <h2 className="mb-2 text-lg font-semibold">Change Password</h2>
                            <p className="text-muted-foreground mb-4 text-sm">Update your password to keep your account secure.</p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        placeholder="Enter current password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="Enter new password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}>
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Confirm new password"
                                />
                                {passwordForm.newPassword &&
                                    passwordForm.confirmPassword &&
                                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                                        <p className="text-destructive text-sm">Passwords do not match</p>
                                    )}
                            </div>

                            {passwordValidation.hasErrors && <p className="text-destructive text-sm">{passwordValidation.errorMessage}</p>}

                            <Button
                                type="submit"
                                disabled={isChangingPassword || passwordForm.newPassword !== passwordForm.confirmPassword}>
                                {isChangingPassword ? 'Changing...' : 'Change Password'}
                            </Button>
                        </form>
                    </div>

                    <Separator className="mb-8" />

                    {/* Appearance Section */}
                    <div className="mb-8 space-y-6">
                        <div>
                            <h2 className="mb-2 text-lg font-semibold">Appearance</h2>
                            <p className="text-muted-foreground mb-4 text-sm">Customize the look and feel of the application.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <div className="flex gap-2">
                                    <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')}>
                                        Light
                                    </Button>
                                    <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')}>
                                        Dark
                                    </Button>
                                    <Button
                                        variant={theme === 'system' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTheme('system')}>
                                        System
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-8" />

                    {/* Notifications Section */}
                    <div className="mb-8 space-y-6">
                        <div>
                            <h2 className="mb-2 text-lg font-semibold">Notifications</h2>
                            <p className="text-muted-foreground mb-4 text-sm">Manage your notification preferences.</p>
                        </div>

                        <p className="text-muted-foreground">Notification settings coming soon...</p>
                    </div>

                    <Separator className="mb-8" />

                    {/* Advanced Section */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-2 text-lg font-semibold">Advanced Settings</h2>
                            <p className="text-muted-foreground mb-4 text-sm">Advanced options and account management.</p>
                        </div>

                        <p className="text-muted-foreground">Advanced settings coming soon...</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
