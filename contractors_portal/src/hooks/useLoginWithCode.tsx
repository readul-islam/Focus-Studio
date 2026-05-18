import { useMutation } from "@tanstack/react-query";
import { authenticateProjectAccess } from "@/lib/Api";
import { storeContractorSession } from "@/lib/contractor-auth";

export const useLoginWithCode = () => {
  return useMutation({
    mutationFn: authenticateProjectAccess,
    onSuccess: (data) => {
      storeContractorSession(data);
    },
  });
};
