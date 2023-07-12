import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInstance } from "antd/es/message/interface";

import { User, deleteUser } from "../../services/users";
import { USER_LIST_QUERY_KEY } from "./useListUser";

export default function useDeleteUserMutation(alertInstance: MessageInstance) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: number; userData?: User }) =>
      deleteUser(userId),
    onSuccess: (_, { userData }) => {
      void queryClient.invalidateQueries({
        queryKey: USER_LIST_QUERY_KEY,
      });
      void alertInstance.success(
        `O usuário ${userData?.name || ""} foi removido com sucesso!`,
        3
      );
    },
    onError: (_, { userData }) => {
      void alertInstance.error(
        `Oops! Não foi possível remover o usuário "${userData?.name || ""}"`,
        5
      );
    },
  });
}
