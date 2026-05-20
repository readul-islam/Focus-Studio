'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { STATUS, type CallBackProps, type Step } from 'react-joyride';
import type { ProductTourStepConfig } from '@/lib/product-tour/types';
import { TourTooltip } from './TourTooltip';

const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

const joyrideStyles = {
  options: {
    zIndex: 10050,
    arrowColor: 'hsl(var(--card))',
    backgroundColor: 'hsl(var(--card))',
    textColor: 'hsl(var(--foreground))',
    overlayColor: 'rgba(0, 0, 0, 0.58)',
    spotlightPadding: 8,
  },
  spotlight: {
    borderRadius: 10,
  },
  overlay: {
    transition: 'opacity 300ms ease',
  },
};

function expandSidebarForTour() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sidebarCollapsed', 'false');
  window.dispatchEvent(
    new StorageEvent('storage', { key: 'sidebarCollapsed', newValue: 'false' }),
  );
}

function configsToJoyrideSteps(configs: ProductTourStepConfig[]): Step[] {
  if (typeof document === 'undefined') {
    return configs.map((c) => ({
      target: c.target,
      title: c.title,
      content: c.description,
      placement: c.placement ?? 'auto',
      disableBeacon: true,
      disableOverlayClose: true,
      spotlightClicks: false,
      disableScrolling: false,
    }));
  }
  return configs
    .filter((c) => document.querySelector(c.target))
    .map((c) => ({
      target: c.target,
      title: c.title,
      content: c.description,
      placement: c.placement ?? 'auto',
      disableBeacon: true,
      disableOverlayClose: true,
      spotlightClicks: false,
      disableScrolling: false,
      ...(c.disableInteraction ? { spotlightClicks: false } : {}),
    }));
}

type ProductTourProps = {
  run: boolean;
  stepConfigs: ProductTourStepConfig[];
  onRunChange: (run: boolean) => void;
  onComplete: () => void;
};

export function ProductTour({ run, stepConfigs, onRunChange, onComplete }: ProductTourProps) {
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    if (!run) return;
    expandSidebarForTour();
    const id = window.setTimeout(() => {
      setSteps(configsToJoyrideSteps(stepConfigs));
    }, 400);
    return () => window.clearTimeout(id);
  }, [run, stepConfigs]);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        onRunChange(false);
        onComplete();
      }
      if (type === 'tour:end') {
        onRunChange(false);
      }
    },
    [onComplete, onRunChange],
  );

  const joyrideSteps = useMemo(() => steps, [steps]);

  if (!run || joyrideSteps.length === 0) return null;

  return (
    <Joyride
      steps={joyrideSteps}
      run={run}
      continuous
      scrollToFirstStep
      scrollOffset={80}
      disableScrollParentFix={false}
      showProgress={false}
      showSkipButton={false}
      hideCloseButton
      disableCloseOnEsc={false}
      spotlightPadding={10}
      floaterProps={{
        styles: {
          floater: { filter: 'none' },
        },
      }}
      styles={joyrideStyles}
      tooltipComponent={TourTooltip}
      callback={handleCallback}
    />
  );
}
