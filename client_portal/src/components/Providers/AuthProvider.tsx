import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ReactNode, useState } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const { toast } = useToast();

  const demoUser = {
    email: 'dev@intelleqt.ai',
    password: 'testpass11223344',
  };

  const login = async (email: string, password: string) => {
    // console.log("email", email);
    setUser(email);
  };

  const logout = () => {
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
