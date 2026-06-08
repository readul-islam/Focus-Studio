import { useState } from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { BrandCurve } from '@/components/brand/brand-curve';
import { colors, spacing } from '@/constants/theme';

const logoSource = require('@/assets/brand/logo-transparent.png');

type BrandMarkProps = {
  style?: ViewStyle;
};

/** Matches client login + sidebar: Logo.png, wordmark, clay curve underline. */
export function BrandMark({ style }: BrandMarkProps) {
  const [wordmarkWidth, setWordmarkWidth] = useState(0);

  return (
    <View style={[styles.row, style]}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" accessibilityLabel="Focuspilot" />
      <View style={styles.wordmark}>
        <Text
          style={styles.wordmarkText}
          onLayout={event => setWordmarkWidth(event.nativeEvent.layout.width)}
        >
          Focus<Text style={styles.wordmarkMuted}>pilot</Text>
        </Text>
        {wordmarkWidth > 0 ? (
          <View style={styles.curve}>
            <BrandCurve width={wordmarkWidth} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 35,
    height: 35,
  },
  wordmark: {
    paddingTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  wordmarkText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.72,
    lineHeight: 17,
    color: colors.text,
    alignSelf: 'flex-start',
  },
  wordmarkMuted: {
    fontWeight: '500',
    color: colors.textMuted,
  },
  curve: {
    marginTop: 4,
    alignSelf: 'stretch',
  },
});
