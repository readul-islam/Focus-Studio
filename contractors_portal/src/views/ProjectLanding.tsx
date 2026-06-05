import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLoginWithCode } from '@/hooks/useLoginWithCode';
import { useParams } from '@/lib/navigation';
import { Loader2 } from 'lucide-react';
import { fetchProjectByAccessToken } from '@/lib/Api';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function ProjectLanding() {
  const [accessCode, setAccessCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { accessToken } = useParams<{ accessToken: string }>();
  const { mutate: login, isPending } = useLoginWithCode();
  const t = useTranslations('projectLanding');

  useEffect(() => {
    const resolveProject = async () => {
      if (!accessToken) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchProjectByAccessToken(accessToken);
        setProjectName(data.project_name);
        setStudioName(data.studio_name);
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };

    resolveProject();
  }, [accessToken]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken || !accessCode.trim()) return;

    login(
      { accessToken, accessCode: accessCode.trim() },
      {
        onSuccess: () => {
          toast.success(t('welcomeLoading'));
          window.location.href = '/dashboard';
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            t('invalidAccessCode');
          toast.error(message);
        },
      },
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <p className="text-gray-600">{t('loadingProject')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('invalidLinkTitle')}</CardTitle>
            <CardDescription>{t('invalidLinkDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{studioName}</p>
          <CardTitle className="mt-1">{projectName}</CardTitle>
          <CardDescription>{t('accessDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="accessCode">{t('accessCode')}</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder={t('accessCodePlaceholder')}
                required
                autoComplete="off"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value.toUpperCase())}
                className="font-mono uppercase tracking-wider"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending || !accessCode.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? t('signingIn') : t('continue')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
