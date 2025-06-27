import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGame } from '../contexts/GameContext';
import { useSocket } from '../contexts/SocketContext';

/**
 * Example how to use:
 *  var shareModal=useFullScreenModal()
 *
*   <shareModal.element>
         <ShareGamePage onClose={() => shareModal.close()} />
  </shareModal.element>
 */
export function useFullScreenModal() {
  const [open, setOpen] = useState(false);

  function FullScreenModalHelper({ children, preventAlwaysMounted = false }: { children: React.ReactNode, preventAlwaysMounted?: boolean }) {
    if (preventAlwaysMounted && !open) {
      // If alwaysMounted is true and modal is not open, render an empty fragment
      return <></>;
    }
    return <FullScreenModal open={open} onRequestClose={() => setOpen(false)}>
      {children}
    </FullScreenModal>;
  }

  return {
    element: FullScreenModalHelper,
    open: () => setOpen(true),
    close: () => setOpen(false),
  }
}

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
  const { texts } = useLanguage();
  const isRTL = texts.direction === 'rtl';

  var modalRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    function handler(event: MouseEvent) {
      if (!open) return
      if (event.target instanceof HTMLElement) {
        if (event.target.clientHeight >= window.innerHeight) {
          onRequestClose();
          return
        }
      }
    }
    setTimeout(() => {
      if (!modalRef.current) return;
      modalRef.current.addEventListener('click', handler)
    }, 0);
    return () => {
      if (!modalRef.current) return;
      modalRef.current.removeEventListener('click', handler);
    };
  }, [modalRef.current]);


  if (!shouldRender) return <></>;
  return (
    <div ref={modalRef}>
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

      <div className="relative px-6 pt-6 mb-8">
        <div
          className={`overflow-y-scroll fixed inset-0 z-[9999] transition-opacity duration-300 ${open && !isClosing ? 'opacity-100' : 'opacity-0'
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
            className={`absolute inset-0 w-full h-full overflow-y-auto ${isClosing ? 'modal-slide-out' : 'modal-slide-in'
              }`}
          >
          </div>
          <div
            className="w-full min-h-full"
          >
            <div
              style={{ zIndex: 1000 }}
              className={`absolute  top-2 ${isRTL ? 'left-6' : 'right-6'}`}>
              <button
                onClick={onRequestClose}
                className="flex items-center px-3 py-1 font-medium text-white transition-all duration-300 ease-out transform border shadow-lg cursor-pointer bg-white/20 backdrop-blur-md rounded-2xl border-white/30 hover:bg-white/30 hover:scale-105 hover:shadow-xl"
              >
                <span className={`text-3xl transform transition-transform duration-200 ${isRTL ? 'rotate-180' : ''}`}>
                  →
                </span>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
