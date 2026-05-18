// hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/Api";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("session_type", "contractor");
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.contractor));
      localStorage.setItem("project", JSON.stringify(data.projects));
      localStorage.removeItem("selectedProject");
      if (data.projects?.length === 1) {
        localStorage.setItem("selectedProject", JSON.stringify(data.projects[0]));
        localStorage.setItem("lastUsedProjectId", String(data.projects[0].project_id));
      }
    },
  });
};
