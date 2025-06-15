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
    const lines = parts[0].split('\n');
    
    return (
      <>
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            {line}
          </div>
        ))}
        <div className="mt-2">
          <span className="text-[#F3A257] font-bold text-xl">{userName}</span>
          <span> {parts[1]}</span>
        </div>
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
        <div className="text-center mb-4">
          <div className="text-white text-lg font-normal leading-tight tracking-wide mb-2">
            {texts.nameConfirmation.title}
          </div>
          <div className="text-white text-lg font-normal leading-tight tracking-wide">
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
