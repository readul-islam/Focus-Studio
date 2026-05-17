import { useMutation } from "@tanstack/react-query";
import { loginWithCode } from "@/lib/Api";

export const useLoginWithCode = () => {
  return useMutation({
    mutationFn: loginWithCode,
    onSuccess: (data) => {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.contractor));
      localStorage.setItem("project", JSON.stringify(data.projects));
    },
  });
};
