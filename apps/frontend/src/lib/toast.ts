/**
 * Simple toast notification utility
 * Creates a temporary toast notification at the bottom of the screen
 */

type ToastType = 'success' | 'error' | 'info';

export function showToast(message: string, type: ToastType = 'info') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.textContent = message;

    const bgColors = {
        success: 'hsl(142.1 76.2% 36.3%)',
        error: 'hsl(0 84.2% 60.2%)',
        info: 'hsl(222.2 47.4% 11.2%)',
    };

    toast.style.cssText = `
        background-color: ${bgColors[type]};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.2s, transform 0.2s;
        pointer-events: auto;
        max-width: 350px;
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => {
            container?.removeChild(toast);
            // Remove container if empty
            if (container && container.children.length === 0) {
                document.body.removeChild(container);
            }
        }, 200);
    }, 3000);
}
