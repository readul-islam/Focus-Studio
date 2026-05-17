// hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/Api";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.contractor));
      localStorage.setItem("project", JSON.stringify(data.projects));
      // Clear any previously selected project so user picks fresh
      localStorage.removeItem("selectedProject");
    },
  });
};
