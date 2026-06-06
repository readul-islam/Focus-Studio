export const RULER_MAJOR_STEP = 100;
export const RULER_MEDIUM_STEP = 50;
export const RULER_MINOR_STEP = 10;

export type RulerTick = {
  pos: number;
  kind: 'major' | 'medium' | 'minor';
  label?: number;
};

export type RulerTickVisibility = {
  minor: boolean;
  medium: boolean;
};

export function getRulerTickVisibility(zoom: number): RulerTickVisibility {
  const minorScreen = RULER_MINOR_STEP * zoom;
  if (minorScreen < 5) return { minor: false, medium: false };
  if (minorScreen < 9) return { minor: false, medium: true };
  return { minor: true, medium: true };
}

export function buildRulerTicks(
  contentMin: number,
  contentMax: number,
  maxContent: number,
  visibility: RulerTickVisibility
): RulerTick[] {
  const start = Math.floor(contentMin / RULER_MINOR_STEP) * RULER_MINOR_STEP;
  const end = Math.ceil(contentMax / RULER_MINOR_STEP) * RULER_MINOR_STEP;
  const ticks: RulerTick[] = [];

  for (let value = start; value <= end; value += RULER_MINOR_STEP) {
    if (value < 0 || value > maxContent) continue;

    const isMajor = value % RULER_MAJOR_STEP === 0;
    const isMedium = value % RULER_MEDIUM_STEP === 0;

    if (isMajor) {
      ticks.push({ pos: value, kind: 'major', label: value });
      continue;
    }
    if (isMedium && visibility.medium) {
      ticks.push({ pos: value, kind: 'medium' });
      continue;
    }
    if (visibility.minor) {
      ticks.push({ pos: value, kind: 'minor' });
    }
  }

  return ticks;
}

export function contentToScreen(contentPos: number, offset: number, zoom: number) {
  return offset + contentPos * zoom;
}
