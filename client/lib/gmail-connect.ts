export type GmailOAuthResult = 'success' | 'cancelled' | 'error' | 'access_denied';

/** Open Google OAuth in a popup and resolve when the user finishes or closes it. */
export async function openGmailOAuthPopup(
  getAuthUrl: () => Promise<{ data: unknown }>
): Promise<GmailOAuthResult> {
  const { data: responseData } = await getAuthUrl();

  let authUrl: string | null = null;
  if (typeof responseData === 'string') {
    authUrl = responseData;
  } else if (responseData && typeof responseData === 'object' && 'auth_url' in responseData) {
    authUrl = (responseData as { auth_url: string }).auth_url;
  }

  if (!authUrl) {
    return 'error';
  }

  const popup = window.open(authUrl, 'GmailAuth', 'width=600,height=700');
  if (!popup) {
    return 'error';
  }

  return new Promise((resolve) => {
    let cleaned = false;

    const cleanup = (result: GmailOAuthResult) => {
      if (cleaned) return;
      cleaned = true;
      clearInterval(pollInterval);
      window.removeEventListener('message', handleMessage);
      popup?.close();
      resolve(result);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'OAUTH_SUCCESS') cleanup('success');
      if (event.data?.type === 'OAUTH_CANCELLED') {
        cleanup(event.data?.reason === 'access_denied' ? 'access_denied' : 'cancelled');
      }
    };

    const pollInterval = setInterval(() => {
      if (popup?.closed) {
        // Allow postMessage from the callback page to arrive before treating as cancelled.
        setTimeout(() => {
          if (!cleaned) cleanup('cancelled');
        }, 900);
        return;
      }
      try {
        const href = popup?.location?.href ?? '';
        if (href.includes('/oauth/gmail/callback')) {
          const url = new URL(href);
          const status = url.searchParams.get('status');
          if (status === 'success') {
            cleanup('success');
            return;
          }
          const reason = url.searchParams.get('reason');
          if (reason === 'access_denied') {
            cleanup('access_denied');
            return;
          }
          cleanup('error');
        }
      } catch {
        // popup on accounts.google.com — keep waiting
      }
    }, 500);

    window.addEventListener('message', handleMessage);
  });
}
