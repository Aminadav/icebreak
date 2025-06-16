import { useLanguage } from '../contexts/LanguageContext';
import { useModal } from '../contexts/ModalContext';
import Modal from './Modal';
import Button from './Button';

interface SkipConfirmationModalProps {
  onTakePhoto: () => void;
  onSkip: () => void;
}

export default function SkipConfirmationModal({ onTakePhoto, onSkip }: SkipConfirmationModalProps): JSX.Element {
  const { texts } = useLanguage();
  const { closeModal } = useModal();

  const handleTakePhoto = () => {
    closeModal();
    onTakePhoto();
  };

  const handleSkip = () => {
    closeModal();
    onSkip();
  };

  const handleClose = () => {
    closeModal();
    // Treat close as cancel - do nothing
  };

  // Format the intro text to handle line breaks
  const formatIntroText = (text: string) => {
    const parts = text.split('\n');
    
    return (
      <>
        {parts.map((line, index, array) => (
          <span key={index}>
            {line}
            {index < array.length - 1 && <br />}
          </span>
        ))}
      </>
    );
  };

  return (
    <Modal onClose={handleClose} closeOnOverlayClick={true}>
      <div className="bg-[#733f8e] rounded-3xl p-6 max-w-sm mx-auto shadow-2xl border-4 border-white max-h-[90vh] overflow-y-auto">
        {/* Sad Character Image */}
        <div className="flex justify-center mb-4">
          <div className="w-[120px] h-[120px]">
            <img
              src="/images/icons/sad.png"
              alt="Sad character"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">
            {texts.skipConfirmationModal.title}
          </h2>
        </div>

        {/* Intro Text */}
        <div className="mb-6 text-center">
          <div className="text-lg font-normal leading-relaxed text-white">
            {formatIntroText(texts.skipConfirmationModal.introText)}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {/* Main Button - Take Photo */}
          <Button
            variant="primary"
            onClick={handleTakePhoto}
            className="w-full text-lg py-3 rounded-[20px]"
            data-testid="skip-confirmation-take-photo"
          >
            {texts.skipConfirmationModal.mainButton}
          </Button>
          
          {/* Ghost Button - Skip */}
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-lg py-3 rounded-[20px]"
            data-testid="skip-confirmation-skip"
          >
            {texts.skipConfirmationModal.ghostButton}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
