// import apiClient from './client';
import { signOut } from "aws-amplify/auth";
import axios from 'axios';
import yaml from 'yaml';
// import { API_URL, APP_URL, OIDC_REDIRECT_URL, OIDC_STORAGE, TOKEN, USER } from 'common/constants';
import { Amplify } from 'aws-amplify';
// import { APP_URL, OIDC_PREFIX, OIDC_REDIRECT_URL, OIDC_STORAGE } from '@/utils/const';
// import { getCredentialsFromLocalStorage } from '@/utils/utils';
// import useAxiosRequest from "@/hooks/useAxiosRequest";
import { APP_URL, OIDC_PREFIX, OIDC_REDIRECT_URL, OIDC_STORAGE } from "@/common/const";
import { getCredentialsFromLocalStorage } from "@/common/utils";

export const refreshAccessToken = async () => {
  const refreshToken = getCredentialsFromLocalStorage()?.refresh_token;
  const oidc = JSON.parse(localStorage.getItem(OIDC_STORAGE) || "")

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  if (!oidc.provider) {
    throw new Error('No provider available');
  }
  if (!oidc.client_id) {
    throw new Error('No client available');
  }
  // if (!apiClient) return
  // const fetchData = useAxiosRequest();
  // const response = await fetchData({
  //   url: '/auth/token/refresh',
  //   method: 'post',
  //   data: {
  //     provider: oidc.provider.toLowerCase(),
  //   clientId: oidc.clientId,
  //   refreshToken: refreshToken,
  //   redirectUri: oidc.redirectUri
  //   }
  // });
  const response = {data: {access_token: 'access_token'}}
  const { access_token } = response.data;
  localStorage.setItem(`${OIDC_PREFIX}${oidc.provider}.${oidc.clientId}`, JSON.stringify(response.data))
  return access_token;
};

// export const isTokenExpired = (token:string) => {
// const decoded:any = jwtDecode(token);
// const now = Date.now().valueOf() / 1000;

// return decoded.exp < now;
// };


export const logout = async () => {
  const oidc = localStorage.getItem(OIDC_STORAGE) || ""
  if (oidc === "midway") {
    let response = await fetch('/config.yaml')
    let data = await response.text()
    const config = yaml.parse(data)
    const midwayConfig = config?.login.sso.midway;
    const app_url = localStorage.getItem(APP_URL)
    let signInProd: null | string = null
    let signOutProd: null | string = null
    if (app_url) {
      signInProd = `https://${app_url}/login`;
      signOutProd = `https://${app_url}`
    }
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: midwayConfig?.user_pool_id,
          userPoolClientId: midwayConfig?.user_pool_client_id,
          identityPoolId: "",
          allowGuestAccess: true,
          loginWith: {
            oauth: {
              domain: midwayConfig?.auth.domain,
              scopes: ['aws.cognito.signin.user.admin', 'email', 'openid', 'profile'],
              redirectSignIn: [midwayConfig?.auth.redirect_signin_local, signInProd],
              redirectSignOut: [midwayConfig?.auth.redirect_signout_local, signOutProd],
              responseType: "code",
            }
          }
        }
      }
    }, { ssr: true }
    )
    await signOut({ global: true })
  } else {
    const redirectUri = JSON.parse(oidc).redirectUri
    const authToken = getCredentialsFromLocalStorage()
    if (!redirectUri || !authToken) return
    axios.get(
      `${redirectUri}/api/v2/logout`,
      {
        headers: {
          'Authorization': `Bearer ${authToken.access_token}`
        }
      }
    );
  }
  localStorage.clear();
  window.location.href = '/login';
};

export const changePassword = () => {
  const redirectUri = localStorage.getItem(OIDC_REDIRECT_URL)
  const token = getCredentialsFromLocalStorage()
  if (!redirectUri || !token) return
  axios.get(
    `${redirectUri}/api/v2/logout`,
    {
      headers: {
        'Authorization': `Bearer ${token.access_token}`
      }
    }
  );
  localStorage.clear();
  window.location.href = '/login';
  window.location.reload();
};
