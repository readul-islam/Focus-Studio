/** Extract bare email from "Name <user@host>" or plain address. */
export function extractEmailAddress(str: string | null | undefined): string {
  if (!str) return '';
  const match = str.match(/<([^>]+)>/);
  return (match ? match[1] : str).trim().toLowerCase();
}

/** True when the Gmail From address is the logged-in user. */
export function messageIsSentByUser(
  sender: string | null | undefined,
  currentUserEmail?: string | null
): boolean {
  const senderAddr = extractEmailAddress(sender);
  const self = extractEmailAddress(currentUserEmail);
  return Boolean(self && senderAddr && senderAddr === self);
}

const EMAIL_RE = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;

function externalAddressesFromField(
  field: string | null | undefined,
  isSelf: (addr: string) => boolean
): string[] {
  if (!field) return [];
  const seen = new Set<string>();
  const ordered: string[] = [];

  const push = (addr: string) => {
    const norm = addr.trim().toLowerCase();
    if (!norm || isSelf(norm) || seen.has(norm)) return;
    seen.add(norm);
    ordered.push(norm);
  };

  push(extractEmailAddress(field));
  for (const match of field.matchAll(EMAIL_RE)) {
    push(match[0]);
  }

  return ordered;
}

type ThreadMessage = {
  sender: string;
  recipient: string;
  is_sent: boolean;
  sender_label?: string;
};

/**
 * Pick who to reply to — never the current user's own address.
 * Scans thread participants so mis-flagged is_sent rows still resolve.
 */
export function resolveReplyToEmail(
  messages: ThreadMessage[],
  currentUserEmail?: string | null
): string {
  if (!messages.length) return '';

  const isSelf = (addr: string) => messageIsSentByUser(addr, currentUserEmail);

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!messageIsSentByUser(msg.sender, currentUserEmail)) {
      const addr = extractEmailAddress(msg.sender);
      if (addr) return addr;
    }
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    for (const field of [msg.sender, msg.recipient]) {
      for (const addr of externalAddressesFromField(field, isSelf)) {
        return addr;
      }
    }
  }

  return '';
}
