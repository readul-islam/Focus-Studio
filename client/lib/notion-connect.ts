export type NotionOAuthResult = 'success' | 'cancelled' | 'error';

/** Open Notion OAuth in a popup and resolve when the user finishes or closes it. */
export async function openNotionOAuthPopup(
  getAuthUrl: () => Promise<{ data: unknown }>
): Promise<NotionOAuthResult> {
  const { data: responseData } = await getAuthUrl();

  let authUrl: string | null = null;
  if (responseData && typeof responseData === 'object' && 'auth_url' in responseData) {
    authUrl = (responseData as { auth_url: string }).auth_url;
  }

  if (!authUrl) {
    return 'error';
  }

  const popup = window.open(authUrl, 'NotionAuth', 'width=600,height=700');
  if (!popup) {
    return 'error';
  }

  return new Promise((resolve) => {
    let cleaned = false;

    const cleanup = (result: NotionOAuthResult) => {
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
      if (event.data?.type === 'OAUTH_CANCELLED') cleanup('cancelled');
    };

    const pollInterval = setInterval(() => {
      if (popup?.closed) {
        setTimeout(() => {
          if (!cleaned) cleanup('cancelled');
        }, 900);
        return;
      }
      try {
        const href = popup?.location?.href ?? '';
        if (href.includes('/oauth/notion/callback')) {
          const status = new URL(href).searchParams.get('status');
          cleanup(status === 'success' ? 'success' : 'error');
        }
      } catch {
        // popup on notion.com — keep waiting
      }
    }, 500);

    window.addEventListener('message', handleMessage);
  });
}
