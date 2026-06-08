import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CrmContact } from '@focuspilot/shared';
import { AvatarCircle, StatusBadge } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { contactDisplayName, contactTypeStyle } from '@/lib/crm';

type ContactRowProps = {
  contact: CrmContact;
  onPress: () => void;
};

export function ContactRow({ contact, onPress }: ContactRowProps) {
  const name = contactDisplayName(contact);
  const typeStyle = contactTypeStyle(contact.contact_type);
  const subtitle = contact.company_name && contact.name ? contact.company_name : undefined;
  const meta = [contact.email, contact.phone].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <AvatarCircle name={name} size={44} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <StatusBadge label={typeStyle.label} color={typeStyle.color} backgroundColor={typeStyle.backgroundColor} />
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    ...typography.subheading,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
