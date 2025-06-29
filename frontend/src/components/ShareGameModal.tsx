import { useModal } from '../contexts/ModalContext';
import Modal from './Modal';
import Button from './Button';

interface ShareGameModalProps {
  onStartPlay: () => void;
  onShareGame: () => void;
}

export default function ShareGameModal({ onStartPlay, onShareGame }: ShareGameModalProps): JSX.Element {
  const { closeModal } = useModal();

  const handleStartPlay = () => {
    closeModal();
    onStartPlay();
  };

  const handleShareGame = () => {
    closeModal();
    onShareGame();
  };

  const handleClose = () => {
    closeModal();
  };

  return (
    <Modal onClose={handleClose} closeOnOverlayClick={true}>
      <div className="bg-[#733f8e] rounded-3xl p-6 max-w-sm mx-auto shadow-2xl border-4 border-white max-h-[90vh] overflow-y-auto">
        
        {/* Main Content Text */}
        <div className="mb-8 text-center">
          <div className="text-lg font-normal leading-relaxed text-white space-y-3">
            {/* First line - normal white text */}
            <p>
              שים לב: כשכבר יש תוכן עליך, זה הרבה יותר קל ומזמין לאחרים להצטרף ולהתחיל לשחק.
            </p>
            
            {/* Second line - orange text */}
            <p className="text-[#F3A257] font-bold">
              ההמלצה היא קודם ליוצר המשחק להתחיל לשחק.
            </p>
            
            {/* Third line - normal white text */}
            <p>
              בזכותך המשחק מקבל חיים - וכל השאר ייכנסו בקלות בעקבותיך.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Button - Start Play */}
          <Button
            variant="primary"
            onClick={handleStartPlay}
            className="w-full text-lg py-3 rounded-[20px]"
            trackingId="share-modal-start-play"
          >
            התחל לשחק
          </Button>
          
          {/* Ghost Button - Share Game */}
          <Button
            variant="ghost"
            onClick={handleShareGame}
            className="w-full text-lg py-3 rounded-[20px]"
            trackingId="share-modal-share-game"
          >
            שיתוף המשחק
          </Button>
        </div>
      </div>
    </Modal>
  );
}
