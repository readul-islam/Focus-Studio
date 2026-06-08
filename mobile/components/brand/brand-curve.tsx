import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants/theme';

export const BRAND_CURVE_VIEWBOX = '0 0 104 7';
export const BRAND_CURVE_PATH = 'M2 5.25C22 1.5 42 1.5 52 3.25C62 5 82 5 102 1.75';

type BrandCurveProps = {
  width: number;
  opacity?: number;
};

export function BrandCurve({ width, opacity = 1 }: BrandCurveProps) {
  if (width <= 0) return null;

  return (
    <Svg
      width={width}
      height={7}
      viewBox={BRAND_CURVE_VIEWBOX}
      preserveAspectRatio="none"
      opacity={opacity}
      accessibilityElementsHidden
    >
      <Path
        d={BRAND_CURVE_PATH}
        stroke={colors.clayCurve}
        strokeWidth={1.75}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
