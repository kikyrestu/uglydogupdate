// Handle clipboard API errors gracefully
if (typeof navigator !== 'undefined' && navigator.clipboard) {
  const originalWriteText = navigator.clipboard.writeText;
  navigator.clipboard.writeText = async function(text) {
    try {
      return await originalWriteText.call(this, text);
    } catch (error) {
      // Silently fail or show a user-friendly message
      console.log('Clipboard access denied or not available');
      // Fallback: use document.execCommand for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve();
      } catch (fallbackError) {
        console.log('Clipboard fallback failed');
        return Promise.reject(error);
      }
    }
  };
}