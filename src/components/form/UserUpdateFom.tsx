import { Form, Input } from "antd";

import { UserInfoProps } from "../../services/users";

type UserUpdateFormProps = {
  onUpdate: (value: React.SetStateAction<UserInfoProps>) => void;
};

export default function UserUpdateForm({ onUpdate }: UserUpdateFormProps) {
  return (
    <Form
      labelAlign="left"
      style={{ maxWidth: 600 }}
      onValuesChange={(values: UserInfoProps) => {
        onUpdate((data) => Object.assign(data, values));
      }}
    >
      <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
        <Input type="name" placeholder="John Doe" />
      </Form.Item>

      <Form.Item label="Email" name="email" rules={[{ required: true }]}>
        <Input type="email" placeholder="john@doe.com" />
      </Form.Item>
    </Form>
  );
}
