import { useEffect, useState } from 'react';
import { onSyncStatusChange, SyncStatus } from './changes-engine';

export default function SyncStatusIndicator() {
    const [status, setStatus] = useState<SyncStatus>('saved');

    useEffect(() => {
        const unsubscribe = onSyncStatusChange(setStatus);
        return unsubscribe;
    }, []);

    return (
        <div className="text-xs">
            {status === 'saved' && <span className="text-muted-foreground">Saved</span>}
            {status === 'saving' && <span className="text-muted-foreground animate-pulse">Saving...</span>}
            {status === 'error' && <span className="text-destructive">Error saving</span>}
        </div>
    );
}
