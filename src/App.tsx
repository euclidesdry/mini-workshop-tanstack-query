import { ConfigProvider } from "antd";
import "./App.css";

import UserList from "./components/user/UserList";
import UserProfile from "./components/user/UserProfile";

function App() {
  return (
    <ConfigProvider direction="ltr">
      {/* Example 1 */}
      <UserList />
      {/* Example 2 */}
      {/* <UserProfile /> */}
    </ConfigProvider>
  );
}

export default App;
