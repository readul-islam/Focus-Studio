import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLoginWithCode } from '@/hooks/useLoginWithCode';
import { useNavigate, useParams } from '@/lib/navigation';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

export default function ProjectLanding() {
  const [loginCode, setLoginCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { accessToken } = useParams<{ accessToken: string }>();
  const { mutate: login, isPending } = useLoginWithCode();

  useEffect(() => {
    const resolveProject = async () => {
      if (!accessToken) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/contractor_portal/resolve-project/${accessToken}/`
        );
        setProjectName(response.data.project_name);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    resolveProject();
  }, [accessToken]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    login(
      { login_code: loginCode },
      {
        onSuccess: () => {
          navigate('/dashboard');
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Invalid login code');
        },
      },
    );

    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <p className="text-gray-600">Loading project information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid QR Code</CardTitle>
            <CardDescription>Invalid or expired QR code</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{projectName}</CardTitle>
          <CardDescription>
            You have been invited to access this project on the TechStyles Contractor Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="loginCode">Your contractor code</Label>
              <Input
                id="loginCode"
                type="text"
                placeholder="e.g. TS-4829"
                required
                value={loginCode}
                onChange={e => setLoginCode(e.target.value.toUpperCase())}
                className="uppercase"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
