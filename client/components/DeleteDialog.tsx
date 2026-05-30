"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, ArchiveRestore } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

type DeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id?: string | number | null) => Promise<unknown>;
  id?: string | number | null;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  requireConfirmation?: boolean;
  confirmationText?: string;
  isArchive?: boolean;
};

export const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  id = null,
  title,
  description,
  itemName = "",
  confirmText,
  cancelText,
  requireConfirmation = false,
  confirmationText = "confirm",
  isArchive = false,
}: DeleteDialogProps) => {
  const tc = useTranslations("common");
  const td = useTranslations("common.deleteDialog");

  const resolvedTitle = title ?? td("defaultTitle");
  const resolvedDescription = description ?? td("defaultDescription");
  const resolvedConfirm = confirmText ?? (isArchive ? td("archive") : tc("delete"));
  const resolvedCancel = cancelText ?? tc("cancel");

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");

  const isConfirmationValid =
    !requireConfirmation || confirmationInput.trim() === confirmationText;

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;

    setIsDeleting(true);
    try {
      const result = await onConfirm(id);
      onClose();
      setConfirmationInput("");
      return result || id;
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmationInput("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg z-[999]" overlayClassName="z-[999]">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 ${
              isArchive ? "bg-stone-100" : "bg-red-100"
            }  rounded-full flex items-center justify-center`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${isArchive ? "text-black" : "text-red-600"} `}
            />
          </div>
          <div>
            <DialogTitle>{resolvedTitle}</DialogTitle>
            {itemName && (
              <p
                title={itemName}
                className="text-sm truncate max-w-[320px] text-muted-foreground mt-1"
              >
                &ldquo;{itemName}&rdquo;
              </p>
            )}
          </div>
        </DialogHeader>

        <DialogDescription className="text-sm text-muted-foreground">
          {resolvedDescription}
        </DialogDescription>

        {requireConfirmation && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-700">
              {td("confirmPrompt")}{" "}
              <code className="bg-stone-100 px-1.5 py-0.5 rounded text-red-600 text-xs">
                {confirmationText}
              </code>{" "}
              :
            </p>
            <Input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={td("confirmPlaceholder", { text: confirmationText })}
              disabled={isDeleting}
            />
          </div>
        )}

        <DialogFooter className="mt-3 flex gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            {resolvedCancel}
          </Button>
          <Button
            type="button"
            variant={isArchive ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isDeleting || !isConfirmationValid}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {tc("deleting")}
              </>
            ) : (
              <>
                {isArchive ? (
                  <ArchiveRestore className="w-4 h-4 mr-1" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                {resolvedConfirm}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
