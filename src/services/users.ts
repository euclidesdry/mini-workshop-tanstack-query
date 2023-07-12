import { api } from "./config";

export type User = { id: number; name: string; email: string };

export type UserInfoProps = Omit<User, "id">;

export type UsersList = User[];

export type IfUserIdExists<T = undefined> = T extends number ? User : UsersList;

export async function listUsers(id?: number) {
  const userList = await api.get<IfUserIdExists<typeof id>>(
    `/users${id ? `/${id}` : ""}`
  );
  return userList.data;
}

export async function createUser(userData: User) {
  const userList = await api.post<User>(`/users`, userData);
  return userList.data;
}

export async function updateUserInfo(id: number, userInfo: Omit<User, "id">) {
  const userList = await api.put<User>(`/users/${id}`, userInfo);
  return userList.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`);
}
