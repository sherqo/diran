interface UploadFileResponseData {
    url: string;
}

/**
 * Upload a file (image or video) for the editor
 */
export const uploadEditorFileApi = async (
    file: File
): Promise<{ success: boolean; data?: UploadFileResponseData; error?: { message: string } }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include', // Include cookies for authentication
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: { message: result.error?.message || 'Upload failed' },
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: { message: 'Network error during upload' },
        };
    }
};
