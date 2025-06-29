import { ReactNode } from 'react';

interface OnClickCopyToClipboardProps {
  textToCopy: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function OnClickCopyToClipboard({ 
  textToCopy, 
  children, 
  className = '', 
  title = 'לחץ להעתקה' 
}: OnClickCopyToClipboardProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      // You could add a toast notification here if needed
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`cursor-pointer ${className}`}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}
