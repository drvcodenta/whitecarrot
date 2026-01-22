/**
 * Extracts the YouTube video ID from various URL formats.
 * Supports: watch?v=, youtu.be/, and embed/
 */
export const getYouTubeVideoId = (url: string | undefined | null): string | null => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
        /(?:youtu\.be\/)([^&\n?#]+)/,
        /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};
