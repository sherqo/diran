import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { onSyncStatusChange, SyncStatus } from './changes-engine';

export default function SyncStatusIndicator() {
    const [status, setStatus] = useState<SyncStatus>('saved');

    useEffect(() => {
        const unsubscribe = onSyncStatusChange(setStatus);
        return unsubscribe;
    }, []);

    if (status === 'saved') return null;

    return (
        <div className="text-xs">
            {status === 'saving' && (
                <span className="text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving
                </span>
            )}
            {status === 'error' && <span className="text-destructive">Error saving</span>}
        </div>
    );
}
