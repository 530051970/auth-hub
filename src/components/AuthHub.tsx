import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import AutoLogout from '../secure/auto-logout';
import { hasPrefixKeyInLocalStorage, isTokenExpired } from '../common/utils';
import { OIDC_PREFIX, ROUTES } from '../common/const';
import Login from '../pages/login';
import Register from '../pages/register';
import FindPWD from '../pages/find-pwd';
import ChangePWD from '../pages/change-pwd';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { Spinner } from '@cloudscape-design/components';

// 导出认证页面组件
export { Login, Register, FindPWD, ChangePWD };

export interface AuthHubConfig {
  InactivityTimeout?: number;
  authProvider?: string;
  loginPage?: ReactNode;
  onAuthCheck?: () => Promise<boolean>;
  onLogin?: (credentials: any) => Promise<boolean>;
  onLogout?: () => Promise<void>;
  routes?: {
    login?: string;
    register?: string;
    findPassword?: string;
    changePassword?: string;
  };
  author?: string;
  projectName?: string;
  [key: string]: any;
}

interface AuthHubProps {
  config?: AuthHubConfig;
  children: ReactNode;
}

const i18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  resources: {
    en: {
      translation: {
        "auth:support-prefix": "Supported by ",
        "auth:support-postfix": "",
        "auth:username": "Username",
        "auth:sns": "SNS Code",
        "auth:oidc": "OIDC",
        "auth:keepLogin": "Keep me logged in",
        "auth:forgetPWD": "ForgotPassword",
        "auth:login": "Login",
        "auth:logout": "Log out",
        "auth:register": "Register",
        "auth:registerSuccess": "Register success",
        "auth:registerFailed": "Register failed",
        "auth:registerFailedReason": "Register failed reason",
        "auth:loginFailed": "Login failed",
        "auth:loginFailedReason": "Login failed reason",
        "auth:youCanAlso": "You can also ",
        "auth:loginWithMidway": "Login with Midway",
        "auth:changeLang": "change language",
        "auth:chooseOIDC": "Please choose one OIDC provider",
        "auth:inputUsername": "Please input username",
        "auth:inputPassword": "Please input password",
        "auth:inputPhone": "Please input phone number",
        "auth:inputSNS": "Please input SNS code",
        "auth:authingDesc": "Authentication service for ensuring application security",
        "auth:keycloakDesc": "Open Source Identity and Access Management",
        "auth:cognitoDesc": "AWS's built-in user authentication service",
        "auth:waiting":"The feature is under development. Stay tuned please.",
        "auth:unknownError": "Unknown error, please contact the administrator.",
        "auth:or": "or",
        "auth:sso": "Sign in with Amazon Midway",
        "auth:changePassword": "Change Password",
        "auth:needAccount": "Don't have an account? ",
        "auth:changePWD":{
          "loginType": "Login Type",
          "currentUser": "Current User",
          "oldPWD": "Old Password",
          "newPWD": "New Password",
          "confirmPWD": "Confirm Password",
          "oldPWDDesc": "Please input old password...",
          "newPWDDesc": "Please input new password...",
          "confirmPWDDesc": "Please input new password again.",
          "submit": "Submit",
          "requireOldPassword": "Old password is required.",
          "requireNewPassword": "New password is required.",
          "requireConfirmPassword": "Confirm password is required.",
          "invalidTempPassword": "Temporary password expired, Please contact the administrator.",
          "notSamePwd": "Please ensure the two entered passwords are consistent."
        },
        "auth:findPWD":{
          "title": "Find Password",
          "oidc": "OIDC Provider",
          "oidcDesc": "Please choose one OIDC provider ...",
          "oidcPlaceholder": "Please choose one OIDC provider",
          "username": "Username",
          "usernameDesc": "We will send an email to the email address associated with this user.",
          "usernamePlaceHolder": "eg: Peter",
          "send": "Send Me Email"
        },
        "auth:create":{
          "title": "Create Account",
          "oidc": "OIDC Provider",
          "oidcDesc": "Please choose one OIDC provider ...",
          "oidcPlaceholder": "Please choose one OIDC provider",
          "username": "Username",
          "usernameDesc": "You can use username to login.",
          "usernamePlaceHolder": "eg: Peter",
          "email": "Email",
          "emailDesc": "We will send a password to this email.",
          "emailPlaceHolder": "eg: peter@amazon.com",
          "register": "Register",
          "hasAccount": "Already have an account? ",
          "login": "Login"
        },
        "auth:error":{
          "username": "Username can not be empty.",
          "password": "Password can not be empty.",
          "phone": "Phone number can not be empty.",
          "sns": "SNS code can not be empty.",
          "email": "Email can not be empty."
        },
        "auth:userNotExists": "User does not exist.",
        "auth:incorrectPWD": "Incorrect password.",
        "auth:changePWDByFirstLogin": "First login, please change your password",
        "auth:userChange":"User-initiated change"
      }
    },
    zh: {
      translation: {
        'auth:username': '用户名',
        'auth:sns': '短信验证码',
        'auth:oidc': '统一身份认证',
        'auth:password': '密码',
        'auth:login': '登录',
        'auth:register': '注册',
        'auth:forgetPWD': '忘记密码',
        'auth:keepLogin': '保持登录',
        'auth:or': '或',
        'auth:sso': 'SSO登录',
        'auth:changeLang': 'English',
        'auth:support-prefix': '技术支持',
        'auth:support-postfix': '团队',
        'auth:error.username': '请输入用户名',
        'auth:error.password': '请输入密码',
        'auth:error.loginFailed': '登录失败',
      }
    }
  }
};

const defalutConfig: AuthHubConfig = {
  InactivityTimeout: 24 * 60 * 60 * 1000,
  routes: {
    login: ROUTES.Login,
  },
  projectName: 'Auth-Hub Demo',
  author: 'IndustryBuilders Team',
  login: {
    user: {
      value: 'username',
      disabled: true
    },
    sns: {
      value: 'sns',
      disabled: true
    },
  oidc: {
    value: 'oidc',
    providers: [
      {
        name: 'authing',
        label: 'Authing',
        clientId: '66b769cf5c2d439dfd37f237',
        redirectUri: 'https://demo-center.authing.cn'
      }
    ]
      }
  // sso: 
  //   midway: 
  //     provider: ''auth-hub-midwa',y',
  //     user_pool_id: ''us-east-1_IM5zGhc8',w',
  //     user_pool_client_id: ''2m165ontae26nt91gesos569p',l',
  //     auth: { {
  //       domain: us-east-1im5zghc8w.auth.us-east-1.amazoncognito.com
  //       redirect_signin_local: http://localhost:3088/login
  //       redirect_signout_local: http://localhost:3088
 }
};

// 创建 Context
export const AuthConfigContext = createContext<{
  config: AuthHubConfig;
  from: string;
}>({
  config: defalutConfig,
  from: '/'
});

// 初始化 i18n
const initI18n = async () => {
  if (!i18n.isInitialized) {
    await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: i18nConfig.resources,
        lng: i18nConfig.defaultLanguage,
        fallbackLng: i18nConfig.fallbackLanguage,
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
        keySeparator: false,
        nsSeparator: false,
      });
  }
};

export const AuthHub: React.FC<AuthHubProps> = ({ config, children }) => {
  config = config ?? defalutConfig;
  const timeout = config?.InactivityTimeout ?? 24 * 60 * 60 * 1000;
  const hasToken = hasPrefixKeyInLocalStorage(OIDC_PREFIX);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  
  const routes = {
    login: config.routes?.login ?? ROUTES.Login,
    register: config.routes?.register ?? ROUTES.Register,
    findPassword: config.routes?.findPassword ?? ROUTES.FindPWD,
    changePassword: config.routes?.changePassword ?? ROUTES.ChangePWD,
  };

  // 初始化 i18n
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        await initI18n();
        setIsI18nInitialized(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setIsI18nInitialized(true); // 即使失败也继续渲染，避免阻塞
      }
    };
    initializeI18n();
  }, []);

  const currentPath = window.location.pathname;
  const isAuthPage = [
    routes.login,
    routes.register,
    routes.findPassword,
    routes.changePassword
  ].includes(currentPath);

  if (!isAuthPage) {
    if (hasToken) {
      if (isTokenExpired()) {
        window.location.href = routes.login;
        return null;
      }
    } else {
      window.location.href = routes.login;
      return null;
    }
  } else {
    if (!isI18nInitialized) {
      return (
        <div style={{ paddingTop: '20%', paddingLeft: '50%' }}>
          <Spinner size="large" />
        </div>
      );
    }

    switch (currentPath) {
      case routes.login:
        return (
          <AuthConfigContext.Provider value={{ config, from: currentPath }}>
            <Login />
          </AuthConfigContext.Provider>
        );
      case routes.register:
        return (
          <AuthConfigContext.Provider value={{ config, from: currentPath }}>
            <Register />
          </AuthConfigContext.Provider>
        );
      case routes.findPassword:
        return (
          <AuthConfigContext.Provider value={{ config, from: currentPath }}>
            <FindPWD />
          </AuthConfigContext.Provider>
        );
      case routes.changePassword:
        return (
          <AuthConfigContext.Provider value={{ config, from: currentPath }}>
            <ChangePWD />
          </AuthConfigContext.Provider>
        );
      default:
        return null;
    }
  }
  
  return (
    <>
      <AutoLogout timeout={timeout} />
      {children}
    </>
  );
};

export default AuthHub; 