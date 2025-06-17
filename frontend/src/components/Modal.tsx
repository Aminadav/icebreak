import React, { useEffect } from 'react';
import { useModal } from '../contexts/ModalContext';

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
}

export default function Modal({ children, onClose, closeOnOverlayClick = true }: ModalProps): JSX.Element {
  const { isModalOpen, closeModal } = useModal();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleClose = () => {
    console.log('Modal handleClose called');
    if (onClose) {
      console.log('Calling onClose callback');
      onClose();
    }
    console.log('Calling closeModal');
    closeModal();
  };

  const handleOverlayClick = () => {
    // Always close when clicking on the background overlay
    console.log('Modal overlay clicked, closeOnOverlayClick:', closeOnOverlayClick);
    if (closeOnOverlayClick) {
      console.log('Closing modal...');
      handleClose();
    }
  };

  if (!isModalOpen) return <></>;

  return (
    <div 
      className={`fixed inset-0 z-[9999] transition-all duration-300 ${
        isModalOpen ? 'opacity-100' : 'opacity-0'
      }`}
      data-testid="modal-overlay"
    >
      {/* Background overlay - clickable to close */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 bg-black bg-opacity-50 cursor-pointer"
        onClick={handleOverlayClick}
        onMouseDown={(e) => {
          console.log('Mouse down on overlay');
          e.preventDefault();
        }}
      />
      
      {/* Modal container - centered */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ 
          pointerEvents: 'none' // Allow clicks to pass through to overlay
        }}
      >
        {/* Modal content */}
        <div 
          className={`relative transform transition-all duration-300 w-full max-w-md ${
            isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          style={{ 
            pointerEvents: 'auto' // Re-enable pointer events for modal content
          }}
          onClick={(e) => {
            console.log('Click on modal content, stopping propagation');
            e.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
