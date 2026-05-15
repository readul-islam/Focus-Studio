'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, FileText } from 'lucide-react';
import { confirmDrawingSurvey } from '@/lib/contractor/mock-data';
import type { ContractorDrawing } from '@/lib/contractor/types';
import { gooeyToast as toast } from 'goey-toast';

interface DrawingConfirmationDialogProps {
  drawing: ContractorDrawing | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (drawingId: string, notes?: string) => void;
}

export function DrawingConfirmationDialog({
  drawing,
  isOpen,
  onClose,
  onConfirm,
}: DrawingConfirmationDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!drawing || !confirmed) return;

    setIsSubmitting(true);
    try {
      await confirmDrawingSurvey(drawing.id, notes || undefined);
      onConfirm(drawing.id, notes || undefined);
      toast.success('Drawing survey confirmed');
      handleClose();
    } catch (error) {
      console.error('Failed to confirm survey:', error);
      toast.error('Failed to confirm survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    setNotes('');
    onClose();
  };

  if (!drawing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-row items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-sage-600" />
          </div>
          <div>
            <DialogTitle>Confirm Drawing Survey</DialogTitle>
            <DialogDescription className="text-sm text-neutral-500 mt-1">
              Please confirm you have reviewed and surveyed this drawing.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Drawing Preview */}
        <div className="bg-stone-50 rounded-lg p-4 border border-greige-500/30">
          <div className="flex items-start gap-3">
            {drawing.thumbnail_url ? (
              <img
                src={drawing.thumbnail_url}
                alt={drawing.name}
                className="w-16 h-16 rounded-lg object-cover border border-greige-500/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-white border border-greige-500/30 flex items-center justify-center">
                <FileText className="w-8 h-8 text-neutral-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-neutral-900 line-clamp-1">
                {drawing.name}
              </h4>
              <p className="text-sm text-neutral-500">
                {drawing.version} · {drawing.room || 'General'}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 py-2">
          <Checkbox
            id="confirm-survey"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="confirm-survey"
            className="text-sm text-neutral-700 leading-tight cursor-pointer"
          >
            I confirm that I have surveyed this drawing and understand the
            specifications and requirements detailed within.
          </label>
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <label
            htmlFor="survey-notes"
            className="text-sm font-medium text-neutral-700"
          >
            Notes (optional)
          </label>
          <Textarea
            id="survey-notes"
            placeholder="Add any notes or observations from your survey..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none h-20"
          />
        </div>

        <DialogFooter className="mt-4 flex gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-umber-900 text-white hover:bg-umber-800"
            onClick={handleSubmit}
            disabled={!confirmed || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Survey
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}