'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function XeroRedirect() {
    const router = useRouter();
    const [count, setCount] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    const win = window.open('', '_self');
                    if (win) {
                        win.close();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
            <Card className="w-full max-w-md text-center shadow-lg border-gray-200">
                <CardHeader className="flex flex-col items-center space-y-4 pb-2">
                    <div className="rounded-full bg-emerald-100 p-3">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Xero Connected Successfully!
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600">
                        Your Xero account is now linked to your Techstyles Studio.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <div className="text-xs text-gray-400">
                            You can safely close this tab manually now.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}