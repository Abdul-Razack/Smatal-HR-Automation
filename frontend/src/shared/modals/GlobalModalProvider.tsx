'use client';

import * as React from 'react';
import { useModalStore } from './useModalStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalModalProvider() {
  const modals = useModalStore((state) => state.modals);
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <>
      {Object.values(modals).map((modal) => (
        <Dialog 
          key={modal.id} 
          open={modal.isOpen} 
          onOpenChange={(open) => !open && closeModal(modal.id)}
        >
          <DialogContent className={cn(
            modal.type === 'fullscreen' && 'max-w-[95vw] w-full h-[95vh]',
            'sm:max-w-[425px]'
          )}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {modal.type === 'delete' && <AlertCircle className="text-destructive h-5 w-5" />}
                {modal.type === 'success' && <CheckCircle2 className="text-green-500 h-5 w-5" />}
                {modal.type === 'warning' && <AlertTriangle className="text-yellow-500 h-5 w-5" />}
                {modal.type === 'info' && <Info className="text-blue-500 h-5 w-5" />}
                {modal.title}
              </DialogTitle>
              {modal.description && (
                <DialogDescription>
                  {modal.description}
                </DialogDescription>
              )}
            </DialogHeader>
            
            {modal.content && (
              <div className="py-4">
                {modal.content}
              </div>
            )}

            <DialogFooter>
              {modal.onCancel && (
                <Button variant="outline" onClick={() => {
                  modal.onCancel?.();
                  closeModal(modal.id);
                }}>
                  {modal.cancelText || 'Cancel'}
                </Button>
              )}
              {modal.onConfirm && (
                <Button 
                  variant={modal.type === 'delete' ? 'destructive' : 'default'}
                  onClick={async () => {
                    await modal.onConfirm?.();
                    closeModal(modal.id);
                  }}
                >
                  {modal.confirmText || 'Confirm'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}
