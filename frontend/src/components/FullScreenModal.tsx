import React, { useEffect, useState } from 'react';

interface FullScreenModalProps {
  open: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

export default function FullScreenModal({ open, onRequestClose, children }: FullScreenModalProps): JSX.Element {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      // Start closing animation
      setIsClosing(true);
      // After animation completes, stop rendering
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  const handleClose = () => {
    setIsClosing(true);
    // After animation completes, call the actual close handler
    setTimeout(() => {
      onRequestClose();
    }, 300); // Match animation duration
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isClosing) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, isClosing]);

  if (!shouldRender) return <></>;

  return (
    <>
      <style>{`
        @keyframes slideUpIn {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes slideDownOut {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }
        
        .modal-slide-in {
          animation: slideUpIn 0.3s ease-out forwards;
        }
        
        .modal-slide-out {
          animation: slideDownOut 0.3s ease-in forwards;
        }
      `}</style>
      
      <div 
        className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
          open && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ height: '100vh', width: '100vw' }}
      >
        {/* Background overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 cursor-pointer"
          onClick={handleClose}
        />
        
        {/* Modal content with slide animations */}
        <div 
          className={`absolute inset-0 w-full h-full overflow-y-auto ${
            isClosing ? 'modal-slide-out' : 'modal-slide-in'
          }`}
        >
          <div 
            className="w-full min-h-full"
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
