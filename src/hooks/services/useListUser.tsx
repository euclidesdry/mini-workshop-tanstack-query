import { useQuery } from "@tanstack/react-query";

import { listUsers } from "../../services/users";

export const USER_LIST_QUERY_KEY = ["userList"];

export default function useListUser(
  id?: number,
  onError?: (error?: Error) => void
) {
  return useQuery({
    queryKey: [...USER_LIST_QUERY_KEY, id],
    queryFn: () => listUsers(id),
    onError: (error) => {
      if (!(error instanceof Error)) return;
      if (onError) onError(error);
    },
    // refetchOnWindowFocus: false,
  });
}
