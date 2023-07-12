import {
  DeleteOutlined,
  LoadingOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Alert, Avatar, Card, List, Modal, Spin, message } from "antd";
import { useCallback, useEffect, useState } from "react";

import {
  UserInfoProps,
  UsersList,
  createUser,
  deleteUser,
  listUsers,
} from "../../services/users";
import { SERVER_ERROR } from "../../constants/errors";
import UserUpdateForm from "../form/UserUpdateFom";

const { confirm } = Modal;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export default function UserList() {
  const [messageApi, contextHolder] = message.useMessage({
    duration: 5,
  });

  const [users, setUsers] = useState<UsersList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState({ status: false, item: 0 });
  const [error, setError] = useState<null | Error>(null);

  const [formData, setFormData] = useState<UserInfoProps>({
    name: "",
    email: "",
  });

  const handleUserList = useCallback(() => {
    listUsers()
      .then((users) => {
        setUsers(users as UsersList);
        setError(null);
      })
      .catch((error) => {
        if (!(error instanceof Error)) return;

        setUsers([]);
        setError(error);
        void messageApi.open({ type: "error", content: SERVER_ERROR });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [messageApi]);

  function handleDelete(id: number) {
    const selectedUser = users?.filter((user) => user.id === id)[0];

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

        setUsers((userCurrentValue) =>
          userCurrentValue.filter((user) => user.id !== id)
        );

        handleUserList();
      })
      .catch((error) => {
        if (!(error instanceof Error)) return;

        setUsers([]);
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
    const newUserID = users.length + 1;

    await createUser({ ...formData, id: newUserID })
      .then((createdUser) => {
        console.log("User created: " + JSON.stringify(createdUser));
        handleUserList();
      })
      .catch((error) => {
        if (!(error instanceof Error)) return;
        void messageApi.open({
          type: "error",
          content: `Oops! Não foi possível criar o usuário "${formData.name}".`,
        });
      });
  }

  const showNewUserModal = () => {
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
    handleUserList();
  }, [handleUserList]);

  return (
    <Card
      style={{ width: 300 }}
      actions={[<UserAddOutlined key="add" onClick={showNewUserModal} />]}
    >
      <List
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={users}
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
              <DeleteOutlined
                key="remove"
                onClick={() => handleDelete(user.id)}
              />
            )}
          </List.Item>
        )}
      />
      {error && (
        <Alert message="Erro ao Listar Usuários" type="error" showIcon />
      )}
      {contextHolder}
    </Card>
  );
}
