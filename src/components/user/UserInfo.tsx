import { Alert, Avatar, Card } from "antd";
import { User } from "../../services/users";

const { Meta } = Card;

type UserInfoProps = {
  user: User | null;
  loading: boolean;
  error?: Error | null;
};

export default function UserInfo({ user, loading, error }: UserInfoProps) {
  return (
    <Card style={{ width: 300, marginTop: 16 }} loading={loading}>
      {error ? (
        <Alert
          message="Erro ao Listar Dados do Usuário"
          type="error"
          showIcon
        />
      ) : (
        <Meta
          avatar={
            <Avatar
              src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${
                user?.id || 1
              }`}
            />
          }
          title={user?.name}
          description={user?.email}
        />
      )}
    </Card>
  );
}
