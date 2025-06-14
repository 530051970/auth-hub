import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const oidcConfig = {
  authority: "https://your-oidc-provider.com",  // OIDC 服务器地址（如 Cognito, Auth0, Keycloak）
  client_id: "your-client-id",                 // OIDC 客户端 ID
  redirect_uri: "http://localhost:3000/callback",  // 登录后跳转回的地址
  response_type: "code",  // 使用 Authorization Code Flow
  scope: "openid profile email",  // OIDC 需要的 Scope
  post_logout_redirect_uri: "http://localhost:3000/",
  userStore: new WebStorageStateStore({ store: window.localStorage }), // 存储方式
};

export const userManager = new UserManager(oidcConfig);
