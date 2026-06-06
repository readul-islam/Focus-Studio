'use client';

import Image from 'next/image';
import useUser from '@/hooks/useUser';

type Props = {
  className?: string;
  compact?: boolean;
};

export function StudioLetterhead({ className, compact = false }: Props) {
  const { user } = useUser();
  const studio = user?.studio;

  if (!studio) return null;

  const addressLines = [
    studio.address_line_1,
    studio.address_line_2,
    [studio.city, studio.county].filter(Boolean).join(', '),
    studio.postcode,
    studio.country,
  ].filter(Boolean);

  const logoUrl = studio.primary_logo || studio.monochrome_logo;

  return (
    <div className={className}>
      {!compact && logoUrl ? (
        <Image
          alt={studio.name || 'Studio logo'}
          src={logoUrl}
          width={90}
          height={90}
          className="mb-4 h-[90px] w-[90px] object-contain"
        />
      ) : !compact ? (
        <div className="mb-4 flex h-[90px] w-[90px] items-center justify-center rounded-lg border border-border bg-muted text-lg font-semibold text-foreground">
          {(studio.name || 'S').slice(0, 1).toUpperCase()}
        </div>
      ) : null}
      <p
        className={
          compact
            ? 'text-sm font-medium leading-relaxed text-muted-foreground'
            : 'text-sm font-medium leading-relaxed text-muted-foreground sm:text-[14px]'
        }
      >
        {studio.name}
        {addressLines.map((line) => (
          <span key={line}>
            <br />
            {line}
          </span>
        ))}
        {studio.support_email && (
          <>
            <br />
            {studio.support_email}
          </>
        )}
        {studio.phone_number && (
          <>
            <br />
            {studio.phone_number}
          </>
        )}
      </p>
    </div>
  );
}
