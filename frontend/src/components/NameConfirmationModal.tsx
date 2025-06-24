import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useModal } from '../contexts/ModalContext';
import Modal from './Modal';
import Button from './Button';
import AnimatedImage from './AnimatedImage';

interface NameConfirmationModalProps {
  name: string;
  onYes: () => void;
  onNo: () => void;
}

export default function NameConfirmationModal({ name, onYes, onNo }: NameConfirmationModalProps): JSX.Element {
  const { texts } = useLanguage();
  const { closeModal } = useModal();

  // Handle Enter key press to trigger "Yes" action
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleYes();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleYes = () => {
    closeModal();
    onYes();
  };

  const handleNo = () => {
    closeModal();
    onNo();
  };

  const handleClose = () => {
    closeModal();
    onNo(); // Treat close as "No"
  };

  // Format the message with the name in orange and handle line breaks
  const formatMessage = (message: string, userName: string) => {
    const parts = message.split('{name}');
    
    // Process the entire message to handle \n properly
    const beforeName = parts[0];
    const afterName = parts[1] || '';
    
    return (
      <>
        {beforeName.split('\n').map((line, index, array) => (
          <span key={`before-${index}`}>
            {line}
            {index < array.length - 1 && <br />}
          </span>
        ))}
        <span className="text-[#F3A257] font-bold text-3xl align-sub">{userName}</span>
        {afterName.split('\n').map((line, index, array) => (
          <span key={`after-${index}`}>
            {line}
            {index < array.length - 1 && <br />}
          </span>
        ))}
      </>
    );
  };

  return (
    <Modal onClose={handleClose} closeOnOverlayClick={true}>
      <div className="bg-[#733f8e] rounded-3xl p-4 max-w-sm w-full mx-4 shadow-2xl border-4 border-white max-h-[90vh] overflow-y-auto">
        {/* Suspecting Character Image */}
        <div className="flex justify-center mb-3">
          <AnimatedImage
            src="/images/game-assets/suspecting.png"
            alt="Suspecting character"
            size="small"
            className="w-[100px] h-[100px]"
          />
        </div>

        {/* Title and Message */}
        <div className="mb-4 text-center">
          <div className="mb-2 text-lg font-normal leading-tight tracking-wide text-white">
            {texts.nameConfirmation.title}
          </div>
          <div className="text-lg font-normal leading-tight tracking-wide text-white">
            {formatMessage(texts.nameConfirmation.message, name)}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={handleYes}
            className="w-full text-lg py-3 rounded-[20px]"
            data-testid="name-confirmation-yes"
          >
            {texts.nameConfirmation.yesButton}
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleNo}
            className="w-full text-lg py-3 rounded-[20px]"
            data-testid="name-confirmation-no"
          >
            {texts.nameConfirmation.noButton}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
