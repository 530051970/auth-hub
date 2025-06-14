import { Dispatch, SetStateAction } from "react";
import { EN_LANG, OIDC_PREFIX, OIDC_STORAGE, ZH_LANG } from "./const";
import { AlertType } from "./types";
import jwtDecode from "jwt-decode";

export const getCredentials = () => {
  const oidcInfo = JSON.parse(localStorage.getItem(OIDC_STORAGE) || '')
  const credentials = localStorage.getItem(`oidc.${oidcInfo?.provider}.${oidcInfo?.clientId}`);
  if (!credentials) {
    return null;
  }
  return JSON.parse(credentials);
}

export const alertMsg = (alertTxt: string, alertType: AlertType) => {
  const patchEvent = new CustomEvent('showAlertMsg', {
    detail: {
      alertTxt,
      alertType,
    },
  });
  window.dispatchEvent(patchEvent);
};

export const hasPrefixKeyInLocalStorage = (prefix: string) => {
  const oidcInfo = JSON.parse(localStorage.getItem(OIDC_STORAGE) || '{}');
  return oidcInfo && Object.keys(oidcInfo).length > 0;
};

export const isTokenExpired = () => {
  const oidcInfo = JSON.parse(localStorage.getItem(OIDC_STORAGE) || '{}');
  if (!oidcInfo || !oidcInfo.accessToken) return true;
  try {
    const decoded = jwtDecode<{ exp?: number }>(oidcInfo.accessToken);
    if (!decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export const changeLanguage = (lang: string, setLang: Dispatch<SetStateAction<string>>, i18n: any) => {
  if (lang === EN_LANG) {
    setLang(ZH_LANG);
    i18n.changeLanguage(ZH_LANG);
  } else {
    setLang(EN_LANG);
    i18n.changeLanguage(EN_LANG);
  }
};

export const removeKeysWithPrefix = (prefix: string) => {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}

export const getCredentialsFromLocalStorage = () => {
  const oidc = localStorage.getItem(OIDC_STORAGE)
  if (!oidc) return null
  const oidcRes = JSON.parse(oidc)
  const authToken = localStorage.getItem(`${OIDC_PREFIX}${oidcRes.provider}.${oidcRes.clientId}`)
  if(!authToken) return null
  return JSON.parse(authToken)    
}
