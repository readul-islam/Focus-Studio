import { useMutation } from '@tanstack/react-query';
import { loginSupplier } from '@/lib/api';

export function useLogin() {
  return useMutation({
    mutationFn: loginSupplier,
    onSuccess: data => {
      localStorage.setItem('session_type', 'supplier');
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('supplier', JSON.stringify(data.supplier));
    },
  });
}

export function logoutSupplier() {
  localStorage.clear();
  window.location.href = '/login';
}
