'use client';

import * as React from 'react';

type ModalContextType = {
  isOpen: boolean;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
};

const ModalContext = React.createContext<ModalContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export function ModalProvider({ children }: { children: any }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState<React.ReactNode>(null);

  const openModal = React.useCallback((modalContent: React.ReactNode) => {
    setContent(modalContent);
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setContent(null), 300); // delay for animation
  }, []);

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
            {content}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => React.useContext(ModalContext);
