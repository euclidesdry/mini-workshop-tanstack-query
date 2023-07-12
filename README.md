# Mini Workshop Tanstack Query

Presentation about Tanstack Query v4 to Devs

## Steps

To complete the challenge, you should follow the steps below and see the results of the implementation

### Step 1: Transform any API calls into a React Hooks

Create a new hook on the folder named `hooks` inside `src` folder, with the file name `useUser.tsx`, adding the content:

```tsx
import { Modal, message } from "antd";
import { useCallback, useEffect, useState } from "react";

import {
  UserInfoProps,
  UsersList,
  createUser,
  deleteUser,
  listUsers,
} from "../services/users";

import { SERVER_ERROR } from "../constants/errors";

import UserUpdateForm from "../components/form/UserUpdateFom";

const { confirm } = Modal;

export default function useUser() {
  const [messageApi, contextHolder] = message.useMessage({
    duration: 5,
  });

  const [userList, setUserList] = useState<UsersList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState({ status: false, item: 0 });
  const [error, setError] = useState<null | Error>(null);

  const [formData, setFormData] = useState<UserInfoProps>({
    name: "",
    email: "",
  });

  const handleGetUserList = useCallback(() => {
    listUsers()
      .then((users) => {
        setUserList(users as UsersList);
        setError(null);
      })
      .catch((error) => {
        if (!(error instanceof Error)) return;

        setUserList([]);
        setError(error);
        void messageApi.open({ type: "error", content: SERVER_ERROR });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [messageApi]);

  function handleDelete(id: number) {
    const selectedUser = userList?.filter((user) => user.id === id)[0];

    setIsDeleting({
      status: true,
      item: id,
    });

    deleteUser(id)
      .then(() => {
        void messageApi.open({
          type: "success",
          content: `O usuário "${selectedUser.name}" foi removido com sucesso!`,
        });

        setUserList((userCurrentValue) =>
          userCurrentValue.filter((user) => user.id !== id)
        );

        handleGetUserList();
      })
      .catch((error) => {
        if (!(error instanceof Error)) return;

        setUserList([]);
        setError(error);
        void messageApi.open({
          type: "error",
          content: `Oops! Não foi possível remover o usuário "${selectedUser.name}"`,
        });
      })
      .finally(() => {
        setIsDeleting({
          status: false,
          item: id,
        });
      });
  }

  async function handleSubmit() {
    const newUserID = userList.length + 1;

    await createUser({ ...formData, id: newUserID })
      .then((createdUser) => {
        void messageApi.open({
          type: "success",
          content: `O usuário "${createdUser.name}" foi criado com sucesso!`,
        });

        handleGetUserList();
      })
      .catch((error) => {
        if (!(error instanceof Error)) return;
        void messageApi.open({
          type: "error",
          content: `Oops! Não foi possível criar o usuário "${formData.name}".`,
        });
      });
  }

  const handleAddNewUser = () => {
    confirm({
      title: "Adicionar novo Usuário",
      content: <UserUpdateForm onUpdate={setFormData} />,
      onOk() {
        return handleSubmit();
      },
      onCancel() {
        console.log("Canceled adding new user");
      },
    });
  };

  useEffect(() => {
    handleGetUserList();
  }, [handleGetUserList]);

  return {
    userList,
    isLoading,
    isDeleting,
    error,
    handleGetUserList,
    handleAddNewUser,
    handleDelete,
    contextHolder,
  };
}
```

and, on the component `UserList` change the state and function:

- **`users`** to **`userList`**
- and **`showNewUserModal`** to **`handleAddNewUser`**

at teh end remove all the business logic from `UserList` component.

### Step 2: Change logic to get user list by creating a new hook with useQuery hook

starts by creating the hook `useListUser.tsx` inside of the `hooks` folder:

```tsx
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
  });
}
```

### Step 3: add the useListUser hook into the useUser hook

```tsx
const { data: userList } = useListUser(undefined, () => {
  void messageApi.open({ type: "error", content: SERVER_ERROR });
});
```

and change the constants `newUserID` value inside the function `handleSubmit` in `useUser` hook to the following code:

```tsx
const users = userList as UsersList | undefined;
const newUserID = Number(users ? users[users?.length - 1].id + 1 : 0);
```

### Step 4: remove the old way to get user from the api inside useUser hook

remove the useEffect inside `useUser` hook:

```tsx
useEffect(() => {
  handleGetUserList();
}, [handleGetUserList]);
```

remove the old `handleGetUserList` function that gets the list of users inside `useUser` hook:

```tsx
const handleGetUserList = useCallback(() => {
  listUsers()
    .then((users) => {
      setUserList(users as UsersList);
      setError(null);
    })
    .catch((error) => {
      if (!(error instanceof Error)) return;

      setUserList([]);
      setError(error);
      void messageApi.open({ type: "error", content: SERVER_ERROR });
    })
    .finally(() => {
      setIsLoading(false);
    });
}, [messageApi]);
```

remove the `isLoading` state from the `useUser` hook:

```tsx
const [isLoading, setIsLoading] = useState(true);
```

### Step 5: changing the `isLoading` state to `useListUser` loader state

add extract `isFetching` prop as `isLoading` from the `useListUser` hook inside the `useUser` hook:

```tsx
const {
  data: userList,
  isFetching: isLoading, // <- Here
} = useListUser(undefined, () => {
  void messageApi.open({ type: "error", content: SERVER_ERROR });
});
```

### Step 6: extract function to reload user list from query from `useListUser` hook

add extract `isFetching` prop as `isLoading` from the `useListUser` hook inside the `useUser` hook:

```tsx
const {
  data: userList,
  isFetching: isLoading,
  refetch: reloadUserList, // <- Here
} = useListUser(undefined, () => {
  void messageApi.open({ type: "error", content: SERVER_ERROR });
});
```

and change the old function `handleGetUserList()` to `reloadUserList()` inside the `useUser` hook.

remove `handleGetUserList` from exported props on the `useUser` hook.

change `selectedUser` const inside `handleDelete` function on the `useUser` hook to:

```tsx
const selectedUser = (userList as UsersList)?.find((user) => user.id === id);
```

and change the old function `handleGetUserList()` to `reloadUserList()` inside `handleDelete()` function on the `useUser` hook.

### Step 7: Adding types to `List` on the `UserList.txs` component

```tsx
<List<User> // <- Here
  loading={isLoading}
  itemLayout="horizontal"
  dataSource={userList as UsersList | undefined} // <- Here
  renderItem={(user, index) => (
    <List.Item>
      <List.Item.Meta
        avatar={
          <Avatar
            src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
          />
        }
        title={<a href="#">{user.name}</a>}
        description={user.email}
      />
      {isDeleting.status && isDeleting.item === user.id ? (
        <Spin indicator={antIcon} />
      ) : (
        <DeleteOutlined key="remove" onClick={() => handleDelete(user.id)} />
      )}
    </List.Item>
  )}
/>
```

### Step 8: Change logic to delete user into the `useDeleteUserMutation.tsx` hook

starts by creating the hook `useDeleteUserMutation.tsx` inside of the `hooks` folder:

```tsx
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
```

add the into the `useUser` hook:

```tsx
const deleteUserMutation = useDeleteUserMutation(messageApi);
```

and change the `handleDelete` function to:

```tsx
function handleDelete(id: number) {
  const selectedUserData = (userList as UsersList)?.find(
    (user) => user.id === id
  );

  deleteUserMutation.mutate({
    userId: id,
    userData: selectedUserData,
  });
}
```

### Step 9: Change logic to delete user into the `useCreateUserMutation.tsx` hook

starts by creating the hook `useCreateUserMutation.tsx` inside of the `hooks` folder:

```tsx
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
```

add the into the `useUser` hook:

```tsx
const createUserMutation = useCreateUserMutation(messageApi);
```

and change the `handleSubmit` function to:

```tsx
function handleSubmit() {
  const users = userList as UsersList | undefined;
  const newUserID = Number(users ? users[users?.length - 1].id + 1 : 0);

  createUserMutation.mutate({ ...formData, id: newUserID });
}
```

### At the end of all the `useUser.tsx` hook will be

Equal to the following:

```tsx
import { Modal, message } from "antd";
import { useState } from "react";

import { UserInfoProps, UsersList } from "../services/users";

import { SERVER_ERROR } from "../constants/errors";

import UserUpdateForm from "../components/form/UserUpdateFom";
import useListUser from "./services/useListUser";
import useDeleteUserMutation from "./services/useDeleteUserMutation";
import useCreateUserMutation from "./services/useCreateUserMutation";

const { confirm } = Modal;

export default function useUser() {
  const [messageApi, contextHolder] = message.useMessage();

  const [formData, setFormData] = useState<UserInfoProps>({
    name: "",
    email: "",
  });

  const {
    data: userList,
    isFetching: isLoading,
    isError,
  } = useListUser(undefined, () => {
    void messageApi.error(SERVER_ERROR, 5);
  });

  const deleteUserMutation = useDeleteUserMutation(messageApi);
  const createUserMutation = useCreateUserMutation(messageApi);

  function handleDelete(id: number) {
    const selectedUserData = (userList as UsersList)?.find(
      (user) => user.id === id
    );

    deleteUserMutation.mutate({
      userId: id,
      userData: selectedUserData,
    });
  }

  function handleSubmit() {
    const users = userList as UsersList | undefined;
    const newUserID = Number(users ? users[users?.length - 1].id + 1 : 0);

    createUserMutation.mutate({ ...formData, id: newUserID });
  }

  const handleAddNewUser = () => {
    confirm({
      title: "Adicionar novo Usuário",
      content: <UserUpdateForm onUpdate={setFormData} />,
      onOk() {
        return handleSubmit();
      },
      onCancel() {
        console.log("Canceled adding new user");
      },
    });
  };

  return {
    userList,
    isLoading,
    isError,
    isDeleting: deleteUserMutation.isLoading,
    handleAddNewUser,
    handleDelete,
    contextHolder,
  };
}
```

## Extras

### How to remove reload on window change

by adding the option `refetchOnWindowFocus` to `false` value:

```tsx
useQuery("todos", fetchTodos, { refetchOnWindowFocus: false });
```
