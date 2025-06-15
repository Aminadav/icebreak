import React from 'react';
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
  const isRTL = texts.direction === 'rtl';

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

  // Format the message with the name in orange
  const formatMessage = (message: string, userName: string) => {
    const parts = message.split('{name}');
    return (
      <>
        {parts[0]}
        <span className="text-[#f3a257] font-bold">{userName}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <Modal onClose={handleClose} closeOnOverlayClick={true}>
      <div className="bg-[#733f8e] rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-white">
        {/* Suspecting Character Image */}
        <div className="flex justify-center mb-6">
          <AnimatedImage
            src="/images/game-assets/suspecting.png"
            alt="Suspecting character"
            size="medium"
            className="w-[139px] h-[139px]"
          />
        </div>

        {/* Title and Message */}
        <div className="text-center mb-8">
          <div className="text-white text-[30px] font-normal leading-[48px] tracking-[0.6px] mb-4">
            {texts.nameConfirmation.title}
          </div>
          <div className="text-white text-[30px] font-normal leading-[48px] tracking-[0.6px]">
            {formatMessage(texts.nameConfirmation.message, name)}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Button
            variant="primary"
            onClick={handleYes}
            className="w-full text-[28px] py-5 rounded-[20px] border-2 border-white bg-transparent hover:bg-white hover:bg-opacity-20"
            data-testid="name-confirmation-yes"
          >
            {texts.nameConfirmation.yesButton}
          </Button>
          
          <Button
            variant="primary"
            onClick={handleNo}
            className="w-full text-[28px] py-5 rounded-[20px] border-2 border-white bg-transparent hover:bg-white hover:bg-opacity-20"
            data-testid="name-confirmation-no"
          >
            {texts.nameConfirmation.noButton}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
