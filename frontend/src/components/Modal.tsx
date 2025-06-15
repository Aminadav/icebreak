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
    if (onClose) {
      onClose();
    }
    closeModal();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      handleClose();
    }
  };

  if (!isModalOpen) return <></>;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isModalOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
      
      {/* Modal content */}
      <div 
        className={`relative z-10 transform transition-all duration-300 ${
          isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
