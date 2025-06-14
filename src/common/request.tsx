import Axios, { AxiosInstance } from 'axios';
// import { AuthContext } from "auth/AuthProvider";
import { useContext } from "react";
// import { COMMON_ALERT_TYPE } from 'pages/common-alert/types/data_config';
import { alertMsg } from './utils';
import { AlertType, ApiRequest } from './types';
import { AuthContext } from '../auth/AuthProvider';
// import { useAuth } from 'hooks/useAuth';

const COMMON_ALERT_TYPE = {
  Success: 'success',
  Error: 'error',
  Warning: 'warning',
  Info: 'info',
};

const STORAGE_BACK_URL = '';

export const BASE_URL =
  process.env.REACT_APP_ENV === 'local'
    ? '//localhost:8000/'
    : STORAGE_BACK_URL || '';
const axios = Axios.create({
  baseURL: BASE_URL,
  timeout: 100000,
});

const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext is not available");
  return auth;
};

const SUCCESS_STATUS = 'success';

const NO_ACCESS_CODE = 1003;

export function useAxiosAuth() {
  const { user } = useAuth();

  axios.interceptors.request.use(
    (config: any) => {
      config.data = JSON.stringify(config.data);
      config.headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.access_token}`,
      };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return axios;
}


/**
 * 封装get方法
 * @param url  请求url
 * @param params  请求参数
 * @returns {Promise}
 */
export const get = (axios: AxiosInstance, url: string, params?: Record<string, object> | string) => {
  // 如果传入的是string 手动拼接一下
  if (params && typeof params === 'string') {
    url = url.indexOf('?') > -1 ? url + '&' + params : url + '?' + params;
  } else if (params && typeof params === 'object') {
    const keys = Object.keys(params);
    let strParam = '';
    keys.forEach((item, index) => {
      if (index !== 0) {
        strParam = strParam + '&';
      }
      strParam += `${item}=${encodeURIComponent((params as any)[item])}`;
    });
    url += `?${strParam}`;
  }
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        resolve(response?.data);
      })
      .catch((err) => {
        errMsg(err);
        reject(err);
      });
  });
};

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export const post = (axios: AxiosInstance, url: string, data?: Record<string, object> | string) => {
  return new Promise((resolve, reject) => {
    axios.post(url, data).then(
      (response) => {
        resolve(response?.data);
      },
      (err) => {
        errMsg(err);
        reject(err);
      }
    );
  });
};

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export const patch = (axios: AxiosInstance, url: string, data?: Record<string, object> | string) => {
  return new Promise((resolve, reject) => {
    axios.patch(url, data).then(
      (response) => {
        resolve(response?.data);
      },
      (err) => {
        errMsg(err);
        reject(err);
      }
    );
  });
};

/**
 * 封装delete请求
 * @param url
 * @param params
 * @returns
 */
export const deleteRequest = (
  axios: AxiosInstance,
  url: string,
  params?: Record<string, object> | string
) => {
  if (typeof params === 'string') {
    url = url.indexOf('?') > -1 ? url + '&' + params : url + '?' + params;
  } else if (params && typeof params === 'object') {
    const keys = Object.keys(params);
    let strParam = '';
    keys.forEach((item, index) => {
      if (index !== 0) {
        strParam = strParam + '&';
      }
      strParam += `${item}=${encodeURIComponent((params as any)[item])}`;
    });
    url += `?${strParam}`;
  }
  return new Promise((resolve, reject) => {
    axios.delete(url).then(
      (response) => {
        resolve(response?.data);
      },
      (err) => {
        errMsg(err);
        reject(err);
      }
    );
  });
};

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export const put = (axios: AxiosInstance, url: string, data?: Record<string, object> | string) => {
  return new Promise((resolve, reject) => {
    axios.put(url, data).then(
      (response) => {
        resolve(response?.data);
      },
      (err) => {
        errMsg(err);
        reject(err);
      }
    );
  });
};

function checkAuth(result: ApiRequest) {
  if (result && result.code === NO_ACCESS_CODE) {
    window.location.replace(`${window.location.origin}/noaccess`);
    return false;
  }
  return true;
}

export const AuthApiRequest = (
  fecth: 'get' | 'post' | 'patch' | 'put' | 'delete',
  url: string,
  param: string | Record<string, any> | undefined
) => {
  const authAxios = useAxiosAuth();
  return new Promise((resolve, reject) => {
    switch (fecth) {
      case 'get':
        get(authAxios, url, param)
          .then((response) => {
            const result = response as ApiRequest;
            if (!checkAuth(result)) {
              reject(result?.message);
            }
            if (result && result.status === SUCCESS_STATUS) {
              resolve(result.data);
            } else {
              alertMsg(
                result?.message || 'error',
                COMMON_ALERT_TYPE.Error as AlertType
              );
              reject(result?.message);
            }
          })
          .catch(function (error) {
            console.log('get request GET failed.', error);
            reject(error);
          });
        break;
      case 'post':
        post(authAxios , url, param)
          .then((response: unknown) => {
            const result = response as ApiRequest;
            if (!checkAuth(result)) {
              reject(result?.message);
            }
            if (result && result.status === SUCCESS_STATUS) {
              resolve(result.data);
            } else {
              alertMsg(
                result?.message || 'error',
                COMMON_ALERT_TYPE.Error as AlertType
              );
              reject(result?.message);
            }
          })
          .catch(function (error) {
            console.log('get request POST failed.', error);
            reject(error);
          });
        break;
      case 'patch':
        patch(authAxios, url, param)
          .then((response) => {
            const result = response as ApiRequest;
            if (!checkAuth(result)) {
              reject(result?.message);
            }
            if (result && result.status === SUCCESS_STATUS) {
              resolve(result.data);
            } else {
              alertMsg(
                result?.message || 'error',
                COMMON_ALERT_TYPE.Error as AlertType
              );
              reject(result?.message);
            }
          })
          .catch(function (error) {
            console.log('get request PATCH failed.', error);
            reject(error);
          });
        break;
      case 'put':
        put(authAxios, url, param)
          .then((response) => {
            const result = response as ApiRequest;
            if (!checkAuth(result)) {
              reject(result?.message);
            }
            if (result && result.status === SUCCESS_STATUS) {
              resolve(result.data);
            } else {
              alertMsg(
                result?.message || 'error',
                COMMON_ALERT_TYPE.Error as AlertType
              );
              reject(result?.message);
            }
          })
          .catch(function (error) {
            console.log('get request PUT failed.', error);
            reject(error);
          });
        break;
      case 'delete':
        deleteRequest(authAxios, url, param)
          .then((response) => {
            const result = response as ApiRequest;
            if (!checkAuth(result)) {
              reject(result?.message);
            }
            if (result && result.status === SUCCESS_STATUS) {
              resolve(result.data);
            } else {
              const errorMsg = getDeleteErrorMsg(result);
              if (errorMsg) {
                alertMsg(
                  result?.message || 'error',
                  COMMON_ALERT_TYPE.Error as AlertType
                );
              }
              if (url.indexOf('template/identifiers/') > -1) {
                reject(result);
              } else {
                reject(result?.message);
              }
            }
          })
          .catch(function (error) {
            console.log('get request GET failed.', error);
            reject(error);
          });
        break;
      default:
        break;
    }
  });
};

const ERROR_TEXT: any = {
  1404: 'Identifier is being used by templates.',
  1405: 'Identifier is being used by buckets.',
  1406: 'Identifier is being used by templates and buckets.',
};

function getDeleteErrorMsg(responseRes: ApiRequest) {
  if (!responseRes || !responseRes.code) {
    return responseRes;
  }
  const errorMsg = ERROR_TEXT[responseRes.code];
  return errorMsg ? null : responseRes;
}

//失败提示
function errMsg(err: {
  response: { status: any; data: { error: { details: any } } };
}) {
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        alertMsg(
          err.response.data.error.details,
          COMMON_ALERT_TYPE.Error as AlertType
        );
        break;
      case 401:
        alertMsg('未授权，请登录', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 403:
        alertMsg('拒绝访问', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 404:
        alertMsg('请求地址出错', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 408:
        alertMsg('请求超时', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 500:
        alertMsg('服务器内部错误', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 501:
        alertMsg('服务未实现', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 502:
        alertMsg('网关错误', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 503:
        alertMsg('服务不可用', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 504:
        alertMsg('网关超时', COMMON_ALERT_TYPE.Error as AlertType);
        break;

      case 505:
        alertMsg('HTTP版本不受支持', COMMON_ALERT_TYPE.Error as AlertType);
        break;
      default:
        alertMsg(
          'Network error please try again later',
          COMMON_ALERT_TYPE.Error as AlertType
        );
        break;
    }
    return;
  }
  alertMsg(
    'Network error please try again later',
    COMMON_ALERT_TYPE.Error as AlertType
  );
}
