'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseBirthdayGreetingProps {
  userEmail: string | null | undefined;
  birthdayEmail: string;
}

interface UseBirthdayGreetingReturn {
  showModal: boolean;
  closeModal: () => void;
  hasBeenGreeted: boolean;
}

export function useBirthdayGreeting({
  userEmail,
  birthdayEmail,
}: UseBirthdayGreetingProps): UseBirthdayGreetingReturn {
  const [showModal, setShowModal] = useState(false);
  const [hasBeenGreeted, setHasBeenGreeted] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Get the localStorage key for this user and year
  const getStorageKey = useCallback(() => {
    const year = new Date().getFullYear();
    return `birthday-greeted-${birthdayEmail}-${year}`;
  }, [birthdayEmail]);

  // Check if user should see the birthday modal
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;

    // Check if this is the birthday user
    if (!userEmail || userEmail.toLowerCase() !== birthdayEmail.toLowerCase()) {
      setHasBeenGreeted(true);
      setShowModal(false);
      return;
    }

    // Check if already greeted this year
    const storageKey = getStorageKey();
    const alreadyGreeted = localStorage.getItem(storageKey);

    if (alreadyGreeted) {
      setHasBeenGreeted(true);
      setShowModal(false);
    } else {
      setHasBeenGreeted(false);
      // Small delay for better UX - let the page load first
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userEmail, birthdayEmail, mounted, getStorageKey]);

  const closeModal = useCallback(() => {
    if (typeof window === 'undefined') return;

    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, 'true');
    setShowModal(false);
    setHasBeenGreeted(true);
  }, [getStorageKey]);

  return {
    showModal,
    closeModal,
    hasBeenGreeted,
  };
}
