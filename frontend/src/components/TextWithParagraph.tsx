import React from 'react';

interface TextWithParagraphProps {
  text: string;
  className?: string;
}

export default function TextWithParagraph({ text, className = '' }: TextWithParagraphProps): JSX.Element {
  // Split text by double newlines and create paragraphs
  const paragraphs = text.split('\n\n').map(paragraph => paragraph.trim()).filter(paragraph => paragraph.length > 0);

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={`${index > 0 ? 'mt-4' : ''}`}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
