import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInstance } from "antd/es/message/interface";

import { User, createUser } from "../../services/users";
import { USER_LIST_QUERY_KEY } from "./useListUser";

export default function useCreateUserMutation(alertInstance: MessageInstance) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: User) => createUser(userData),
    onSuccess: (_, { name }) => {
      void queryClient.invalidateQueries({
        queryKey: USER_LIST_QUERY_KEY,
      });
      void alertInstance.success(
        `O usuário ${name} foi adicionado com sucesso!`,
        3
      );
    },
    onError: (_, { name }) => {
      void alertInstance.error(
        `Oops! Não foi possível adicionar o usuário "${name}"`,
        5
      );
    },
  });
}
