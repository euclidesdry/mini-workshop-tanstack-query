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
