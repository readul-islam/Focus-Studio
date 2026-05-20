import type { Placement } from 'react-joyride';

export type ProductTourStepConfig = {
  /** CSS selector, e.g. `[data-tour="nav-home"]` */
  target: string;
  title: string;
  description: string;
  placement?: Placement;
  /** Block clicks outside spotlight until user advances */
  disableInteraction?: boolean;
};

export type ProductTourId = 'main-app-v1';
