import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { BrandCurve } from '@/components/brand/brand-curve';
import { colors, spacing } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const logoArrow = require('@/assets/brand/logo-arrow.png');
const logoFull = require('@/assets/brand/logo-transparent.png');

/** Sized to match BrandMark proportions; ring geometry from Logo.png analysis. */
const LOGO_SIZE = 80;
const VIEW = 100;
const CENTER = 50;
const RING_R = 37.4;
const RING_STROKE = 6.6;
const RING_CIRC = 2 * Math.PI * RING_R;
/** Ring visible arc ~264° (gap ~96° at top). */
const RING_ARC = RING_CIRC * (264 / 360);
/** Dash begins where the logo ring starts (348°). */
const RING_ROTATION = 348;

type AnimatedSplashProps = {
  onFinish: () => void;
};

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const [wordmarkWidth, setWordmarkWidth] = useState(0);

  const overlayOpacity = useSharedValue(1);
  const ringProgress = useSharedValue(0);
  const arrowRotation = useSharedValue(-14);
  const markScale = useSharedValue(0.9);
  const markOpacity = useSharedValue(0);
  const ringLayerOpacity = useSharedValue(1);
  const fullLogoOpacity = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(12);
  const curveOpacity = useSharedValue(0);

  useEffect(() => {
    markOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    markScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });

    ringProgress.value = withTiming(1, {
      duration: 1500,
      easing: Easing.inOut(Easing.cubic),
    });

    arrowRotation.value = withTiming(346, {
      duration: 1500,
      easing: Easing.inOut(Easing.cubic),
    });

    fullLogoOpacity.value = withDelay(
      1320,
      withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }),
    );
    ringLayerOpacity.value = withDelay(
      1320,
      withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) }),
    );

    wordmarkOpacity.value = withDelay(
      1180,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    wordmarkTranslateY.value = withDelay(
      1180,
      withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) }),
    );
    curveOpacity.value = withDelay(
      1380,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );

    overlayOpacity.value = withDelay(
      2100,
      withTiming(0, { duration: 480, easing: Easing.inOut(Easing.cubic) }, finished => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [
    arrowRotation,
    curveOpacity,
    fullLogoOpacity,
    markOpacity,
    markScale,
    onFinish,
    overlayOpacity,
    ringLayerOpacity,
    ringProgress,
    wordmarkOpacity,
    wordmarkTranslateY,
  ]);

  const ringProps = useAnimatedProps(() => ({
    strokeDasharray: `${ringProgress.value * RING_ARC} ${RING_CIRC}`,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: 1 - fullLogoOpacity.value,
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  const ringLayerStyle = useAnimatedStyle(() => ({
    opacity: ringLayerOpacity.value,
  }));

  const fullLogoStyle = useAnimatedStyle(() => ({
    opacity: fullLogoOpacity.value,
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));

  const curveStyle = useAnimatedStyle(() => ({
    opacity: curveOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="auto">
      <View style={styles.content}>
        <Animated.View style={[styles.markWrap, markStyle]}>
          <View style={[styles.logoStage, { width: LOGO_SIZE, height: LOGO_SIZE }]}>
            <Animated.View style={[styles.ringLayer, ringLayerStyle]}>
              <Svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox={`0 0 ${VIEW} ${VIEW}`}>
                <AnimatedCircle
                  cx={CENTER}
                  cy={CENTER}
                  r={RING_R}
                  stroke={colors.text}
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeLinecap="round"
                  origin={`${CENTER}, ${CENTER}`}
                  rotation={RING_ROTATION}
                  animatedProps={ringProps}
                />
              </Svg>
            </Animated.View>

            <Animated.View style={[styles.arrowLayer, arrowStyle]}>
              <Image
                source={logoArrow}
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                resizeMode="contain"
                accessibilityLabel=""
              />
            </Animated.View>

            <Animated.View style={[styles.fullLogoLayer, fullLogoStyle]}>
              <Image
                source={logoFull}
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                resizeMode="contain"
                accessibilityLabel="Focuspilot"
              />
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.wordmarkBlock, wordmarkStyle]}>
          <Text
            style={styles.wordmarkText}
            onLayout={event => setWordmarkWidth(event.nativeEvent.layout.width)}
          >
            Focus<Text style={styles.wordmarkMuted}>pilot</Text>
          </Text>
          <Animated.View style={[styles.curveWrap, curveStyle]}>
            <BrandCurve width={wordmarkWidth} />
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  markWrap: {
    marginBottom: spacing.lg,
  },
  logoStage: {
    position: 'relative',
  },
  ringLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  arrowLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  fullLogoLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  wordmarkBlock: {
    alignItems: 'center',
  },
  wordmarkText: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.9,
    lineHeight: 22,
    color: colors.text,
  },
  wordmarkMuted: {
    fontWeight: '500',
    color: colors.textMuted,
  },
  curveWrap: {
    marginTop: 6,
    alignSelf: 'center',
  },
});
