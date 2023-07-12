import {
  DeleteOutlined,
  LoadingOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Alert, Avatar, Card, List, Spin } from "antd";

import useUser from "../../hooks/useUser";
import { User, UsersList } from "../../services/users";
import { useState } from "react";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export default function UserList() {
  const [selectedUser, setSelectedUser] = useState(0);

  const {
    userList,
    isLoading,
    isError,
    isDeleting,
    contextHolder,
    handleAddNewUser,
    handleDelete,
  } = useUser();

  return (
    <Card
      style={{ width: 300 }}
      actions={[<UserAddOutlined key="add" onClick={handleAddNewUser} />]}
    >
      <List<User>
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={userList as UsersList | undefined}
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
            {isDeleting && selectedUser === user.id ? (
              <Spin indicator={antIcon} />
            ) : (
              <DeleteOutlined
                key="remove"
                onClick={() => {
                  setSelectedUser(user.id);
                  handleDelete(user.id);
                }}
              />
            )}
          </List.Item>
        )}
      />
      {isError && (
        <Alert message="Erro ao Listar Usuários" type="error" showIcon />
      )}
      {contextHolder}
    </Card>
  );
}
