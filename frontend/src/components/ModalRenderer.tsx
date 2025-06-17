import React from 'react';
import { useModal } from '../contexts/ModalContext';
import Modal from './Modal';

/**
 * Global modal renderer component.
 * This component should be placed at the app level to render modals
 * across all routes and components.
 */
export default function ModalRenderer(): JSX.Element {
  const { isModalOpen, modalContent } = useModal();

  if (!isModalOpen || !modalContent) {
    return <></>;
  }

  return (
    <Modal>
      {modalContent}
    </Modal>
  );
}
