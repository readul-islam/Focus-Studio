import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId =
    process.env.EAS_PROJECT_ID ?? config.extra?.eas?.projectId ?? undefined;

  return {
    ...config,
    name: config.name ?? 'Focuspilot',
    slug: config.slug ?? 'focuspilot',
    owner: process.env.EXPO_OWNER ?? config.owner,
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      ...config.android,
      permissions: [
        ...(config.android?.permissions ?? []),
        'android.permission.POST_NOTIFICATIONS',
      ],
    },
    extra: {
      ...config.extra,
      eas: {
        ...(typeof config.extra?.eas === 'object' ? config.extra.eas : {}),
        projectId,
      },
    },
  };
};
