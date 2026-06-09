// hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/Api";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.client));
      localStorage.setItem("projects", JSON.stringify(data.projects ?? []));
      localStorage.removeItem("project");
      const firstProjectId = data.projects?.[0]?.project_id;
      if (firstProjectId != null) {
        localStorage.setItem("selectedProjectId", String(firstProjectId));
      } else {
        localStorage.removeItem("selectedProjectId");
      }
    },
  });
};
