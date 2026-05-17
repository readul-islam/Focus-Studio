// hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/Api";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Save tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.client));
      localStorage.setItem("project", JSON.stringify(data.projects));
    },
  });
};
