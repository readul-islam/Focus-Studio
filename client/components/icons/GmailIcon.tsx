import { cn } from '@/lib/utils';

type GmailIconProps = {
  className?: string;
};

/** Gmail product icon (Google brand colors). */
export function GmailIcon({ className }: GmailIconProps) {
  return (
    <svg
      className={cn('shrink-0', className)}
      viewBox="0 0 48 48"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4caf50"
        d="M45,16.18v21.82c0,1.66-1.34,3-3,3H6c-1.66,0-3-1.34-3-3V16.18L24,30.77L45,16.18z"
      />
      <path
        fill="#1e88e5"
        d="M45,16.18L24,30.77L3,16.18C3.93,15.45,5.16,15,6.39,15h35.22C42.84,15,44.07,15.45,45,16.18z"
      />
      <path fill="#e53935" d="M3,16.18v21.82c0,1.66,1.34,3,3,3h0V16.18H3z" />
      <path fill="#c62828" d="M45,16.18v21.82c0,1.66-1.34,3-3,3h0V16.18H45z" />
      <path
        fill="#fbc02d"
        d="M24,30.77L3,16.18C3.93,15.45,5.16,15,6.39,15h35.22C42.84,15,44.07,15.45,45,16.18L24,30.77z"
      />
    </svg>
  );
}
