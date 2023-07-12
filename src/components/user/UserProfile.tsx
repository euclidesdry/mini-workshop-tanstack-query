import { message, Button, Form, Input, Radio, Card, Alert } from "antd";
import { useCallback, useEffect, useState } from "react";

import {
  User,
  UserInfoProps,
  listUsers,
  updateUserInfo,
} from "../../services/users";
import { SERVER_ERROR } from "../../constants/errors";
import UserInfo from "./UserInfo";

const USER_ID = 1;

export default function UserProfile() {
  const [form] = Form.useForm<UserInfoProps>();
  const [messageApi, contextHolder] = message.useMessage();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDataChange, setLoadingDataChange] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorChangingData, setErrorChangingData] = useState<Error | null>(
    null
  );

  function handleSubmit() {
    form
      .validateFields()
      .then((values) => {
        setLoadingDataChange(true);

        updateUserInfo(USER_ID, {
          name: values.name,
          email: values.email,
        })
          .then((updatedUserData) => {
            setUser(updatedUserData);
            setErrorChangingData(null);
          })
          .catch((err) => {
            if (!(err instanceof Error)) return;

            setErrorChangingData(err);
            void messageApi.open({ type: "error", content: SERVER_ERROR });
          })
          .finally(() => {
            setLoadingDataChange(false);
          });
      })
      .catch((err) => {
        console.log("Failed:", err);
      });
  }

  const handleListUserData = useCallback(() => {
    listUsers(USER_ID)
      .then((users) => {
        setUser(users as User);
        setError(null);
      })
      .catch((error) => {
        if (!(error instanceof Error)) return;

        setUser(null);
        setError(error);
        void messageApi.open({ type: "error", content: SERVER_ERROR });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [messageApi]);

  useEffect(() => {
    handleListUserData();
  }, [handleListUserData]);

  return (
    <>
      <UserInfo user={user} loading={loading} error={error} />

      <Card style={{ width: 300, marginTop: 16 }}>
        <Form layout={"horizontal"} form={form}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input your name" }]}
          >
            <Input placeholder="John Doe" type="name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your e-mail address" },
            ]}
          >
            <Input placeholder="john@doe.com" type="email" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loadingDataChange}
            >
              Atualizar
            </Button>
          </Form.Item>
        </Form>
        {errorChangingData && (
          <Alert
            message="Erro ao Atualizar os Dados do Usuário"
            type="error"
            showIcon
          />
        )}
      </Card>

      {contextHolder}
    </>
  );
}
