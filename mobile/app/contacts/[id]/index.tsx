import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { CrmContact } from '@focuspilot/shared';
import { ErrorState, LoadingInline, SectionHeader, StatusBadge } from '@/components/design-system';
import { StackHeaderActions } from '@/components/navigation/StackHeaderActions';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  contactDisplayName,
  contactStatusLabel,
  contactTypeStyle,
  formatAddress,
} from '@/lib/crm';
import { formatDate, formatTimeAgo } from '@/lib/format';
import { api } from '@/lib/api';

async function fetchContact(id: string): Promise<CrmContact> {
  const response = await api.get<CrmContact>(`/crm/clients/${id}/`);
  return response.data;
}

function DetailRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
  onPress?: () => void;
}) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.detailIcon} />
      <View style={styles.detailBody}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, onPress && styles.detailLink]} onPress={onPress}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['crm/clients', id],
    queryFn: () => fetchContact(String(id)),
    enabled: Boolean(id),
  });

  if (isLoading && !data) {
    return <LoadingInline />;
  }

  if ((isError && !data) || !data) {
    return <ErrorState title="Couldn't load contact" onRetry={refetch} />;
  }

  const name = contactDisplayName(data);
  const typeStyle = contactTypeStyle(data.contact_type);
  const address = formatAddress(data);
  const notes = data.client_notes ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Stack.Screen
        options={{
          title: name,
          headerRight: () => (
            <StackHeaderActions>
              <Pressable
                onPress={() => router.push(`/contacts/${id}/edit`)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Edit contact"
                style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
              >
                <Ionicons name="create-outline" size={22} color={colors.text} />
              </Pressable>
            </StackHeaderActions>
          ),
        }}
      />

      <View style={styles.hero}>
        <Text style={styles.heroName}>{name}</Text>
        {data.company_name ? <Text style={styles.heroCompany}>{data.company_name}</Text> : null}
        <View style={styles.badges}>
          <StatusBadge label={typeStyle.label} color={typeStyle.color} backgroundColor={typeStyle.backgroundColor} />
          {data.status ? (
            <StatusBadge
              label={contactStatusLabel(data.status)}
              color={colors.textSecondary}
              backgroundColor={colors.surfaceElevated}
            />
          ) : null}
        </View>
      </View>

      <SectionHeader title="Contact" />
      <View style={styles.card}>
        <DetailRow
          icon="mail-outline"
          label="Email"
          value={data.email}
          onPress={data.email ? () => Linking.openURL(`mailto:${data.email}`) : undefined}
        />
        <DetailRow
          icon="call-outline"
          label="Phone"
          value={data.phone}
          onPress={data.phone ? () => Linking.openURL(`tel:${data.phone}`) : undefined}
        />
        <DetailRow icon="location-outline" label="Address" value={address} />
        {data.currency ? <DetailRow icon="cash-outline" label="Currency" value={data.currency} /> : null}
        {data.created_at ? (
          <DetailRow icon="calendar-outline" label="Added" value={formatDate(data.created_at)} />
        ) : null}
      </View>

      {data.additional_contacts && data.additional_contacts.length > 0 ? (
        <>
          <SectionHeader title="Additional contacts" />
          {data.additional_contacts.map((entry, index) => (
            <View key={`${entry.email ?? entry.name}-${index}`} style={styles.card}>
              <Text style={styles.additionalName}>{entry.name ?? 'Contact'}</Text>
              {entry.relationship ? <Text style={styles.additionalMeta}>{entry.relationship}</Text> : null}
              {entry.email ? <Text style={styles.additionalMeta}>{entry.email}</Text> : null}
              {entry.phone ? <Text style={styles.additionalMeta}>{entry.phone}</Text> : null}
            </View>
          ))}
        </>
      ) : null}

      {notes.length > 0 ? (
        <>
          <SectionHeader title="Notes" />
          {notes.map(note => (
            <View key={note.id} style={styles.noteCard}>
              <Text style={styles.noteText}>{note.note}</Text>
              <Text style={styles.noteMeta}>{formatTimeAgo(note.created_at)}</Text>
            </View>
          ))}
        </>
      ) : null}

      <Text style={styles.webHint}>Notes and portal access can be managed on the web app.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroName: {
    ...typography.heading,
    fontSize: 22,
  },
  heroCompany: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailBody: {
    flex: 1,
  },
  detailLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: colors.text,
  },
  detailLink: {
    color: colors.primary,
  },
  additionalName: {
    ...typography.subheading,
  },
  additionalMeta: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  noteText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  noteMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  webHint: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  editButton: {
    padding: 4,
    borderRadius: 8,
  },
  editButtonPressed: {
    opacity: 0.6,
  },
});
