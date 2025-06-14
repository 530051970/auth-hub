import {
  Button,
  Checkbox,
  Grid,
  Link,
  SpaceBetween,
  Spinner,
  Tabs,
} from '@cloudscape-design/components';
import { FC, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import yaml from 'yaml';
import OIDC from './component/oidc';
import SNS from './component/sns';
import User from './component/user';
import './style.scss';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import {
  EN_LANG,
  LOGIN_TYPE,
  OIDC_STORAGE,
  ROUTES,
  ZH_LANG,
  ZH_LANGUAGE_LIST,
} from '@/common/const';
import { Amplify } from 'aws-amplify';
import { signIn, fetchAuthSession } from '@aws-amplify/auth';
import { changeLanguage, removeKeysWithPrefix } from '../../common/utils';
import { AuthConfigContext } from '@/components/AuthHub';

const Login: FC = () => {
  const { config, from } = useContext(AuthConfigContext);
  const [activeTabId, setActiveTabId] = useState(LOGIN_TYPE.OIDC);
  const [logging, setLogging] = useState(false as boolean);
  const [username, setUsername] = useState(null as any);
  const [password, setPassword] = useState(null as any);
  const [keep, setKeep] = useState(false);
  // const navigate = useNavigate();
  // const location = useLocation();
  const { t, i18n } = useTranslation();
  const [error, setError] = useState('' as string);
  const [selectedProvider, setSelectedProvider] = useState(null as any);
  const [selectedProviderName, setSelectedProviderName] = useState(null as any);
  const [tabs, setTabs] = useState([] as any[]);
  // const [projectName, setProjectName] = useState('' as string);
  // const [author, setAuthor] = useState('' as string);
  const [version, setVersion] = useState(0);
  const [lang, setLang] = useState('');
  const [isLoading, setIsloading] = useState(true as boolean);
  const [oidcList, setOidcList] = useState([] as any[]);
  const oidcOptions: any[] = [];

  useEffect(() => {
    if (config.i18nConfig) {
      const currentLang = ZH_LANGUAGE_LIST.includes(i18n.language) ? ZH_LANG : EN_LANG;
      setLang(currentLang);
      if (i18n.language !== currentLang) {
        i18n.changeLanguage(currentLang);
      }
    }
    setError('');
  }, [i18n, config.i18nConfig]);

  useEffect(() => {
    updateEnv(config);
  }, [config, username, password, lang, selectedProvider]);

  const handleLanguageChange = () => {
    if (config.i18nConfig) {
      const newLang = lang === ZH_LANG ? EN_LANG : ZH_LANG;
      setLang(newLang);
      i18n.changeLanguage(newLang);
    }
  };

  const updateEnv = (config: any) => {
    setIsloading(true);
    if (config !== null) {
      let tmp_tabs: any[] = [];
      // setAuthor(config.author);
      if (config.login?.user) {
        tmp_tabs.push({
          label: (
            <div style={{ width: 100, textAlign: 'right' }}>
              {t('auth:username')}
            </div>
          ),
          id: 'user',
          content: (
            <User
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
            />
          ),
          disabled: config.login?.user?.disabled || false,
        });
      }
      if (config.login?.sns) {
        tmp_tabs.push({
          label: (
            <div style={{ paddingLeft: 15, width: 120, textAlign: 'center' }}>
              {t('auth:sns')}
            </div>
          ),
          id: 'sns',
          disabled: config.login.sns.disabled || false,
          content: (
            <SNS
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
            />
          ),
        });
      }
      if (config.login?.oidc && config.login.oidc.providers.length > 0) {
        oidcOptions.push({
          label: 'Cognito',
          iconUrl: 'imgs/cognito.png',
          value: 'cognito',
          clientId: config?.oidcClientId,
          redirectUri: config?.oidcRedirectUrl,
          tags: [t('auth:cognitoDesc')],
        });

        setOidcList(oidcOptions);

        tmp_tabs.push({
          label: (
            <div style={{ width: 120, textAlign: 'center' }}>
              {t('auth:oidc')}
            </div>
          ),
          id: 'oidc',
          disabled: config.login?.oidc.disabled || false,
          content: (
            <OIDC
              provider={selectedProvider || oidcOptions[0]}
              username={username}
              password={password}
              oidcOptions={oidcOptions}
              setSelectedProviderName={setSelectedProviderName}
              setProvider={setSelectedProvider}
              setUsername={setUsername}
              setPassword={setPassword}
              setError={setError}
            />
          ),
        });
      }
      setTabs(tmp_tabs);
      setIsloading(false);
    }
  };

  const forgetPwd = () => {
    window.location.href = ROUTES.FindPWD;
  };

  const toRegister = () => {
    window.location.href = ROUTES.Register;
  };

  const loginSystem = () => {
    let currentProvider = selectedProvider;
    const ver = version;
    setError("");
    setLogging(true);
    if(activeTabId === LOGIN_TYPE.OIDC && currentProvider == null){
      setSelectedProvider(oidcList[0]);
      currentProvider = oidcList[0];
    }
    if(username == null || username === ''){
      setError(t('auth:error.username').toString());
      setVersion(ver + 1);
      setLogging(false);
      return;
    }
    if(password == null || password === ''){
      setError(t('auth:error.username').toString());
      setVersion(ver + 1);
      setLogging(false);
      return;
    }
    
    // 使用配置的登录方法
    if (config?.onLogin) {
      config.onLogin({ username, password, provider: currentProvider })
        .then(success => {
          if (success) {
            // 登录成功后跳转回原页面
            window.location.href = from;
          } else {
            setError(t('auth:error.loginFailed').toString());
          }
        })
        .catch(err => {
          setError(err.message || t('auth:error.loginFailed').toString());
        })
        .finally(() => {
          setLogging(false);
        });
    } else {
      // 使用默认的登录方法
      oidcLogin(currentProvider);
    }
  };

  const loginWithCognito = async (currentProvider: any) => {
    let res = '';
    try {
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId: config?.oidcPoolId || '',
            userPoolClientId: config?.oidcClientId || ''
          },
        },
      });
      const user = await signIn({ 
        username, 
        password
      });
      if(!user.isSignedIn && user.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") return "first-login"
      console.log(`user is ${user}`);
      const session = await fetchAuthSession();
      localStorage.setItem(
        `oidc.${currentProvider.value}.${currentProvider.clientId}`,
        JSON.stringify({
          accessToken: session.tokens?.accessToken.toString(),
          idToken: session.tokens?.idToken?.toString(),
          username: session.tokens?.signInDetails?.loginId
        }),
      );
      removeKeysWithPrefix("CognitoIdentityServiceProvider")
      console.log(session)
    } catch (error: any) {
      if(error.name === 'NotAuthorizedException') {
        if(error.message === 'Temporary password has expired and must be reset by an administrator.') {
          res = "first-login"
        } else {
          res = t('auth:incorrectPWD');
        }
      } else if(error.name === 'UserNotFoundException') {
        res = t('auth:userNotExists');
      } else {
        res = t('auth:unknownError');
      }
    }
    return res;
  };

  const loginWithAuthing = async (currentProvider: any, provider: string) => {
    let res = '';
    try {
      const response = {body: {error: 'error', error_description: 'error_description'}}
      if(response.body.error) {
        res = response.body.error_description
        return res;
      }
      localStorage.setItem(
        `oidc.${currentProvider.value}.${currentProvider.clientId}`,
        JSON.stringify(response.body),
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        let detail = error.response?.data.detail;
        if (typeof detail === 'string') detail = JSON.parse(detail);
        if (detail) {
          res = detail.error_description;
        } else {
          res = t('auth:unknownError').toString();
        }
      } else {
        res = t('auth:unknownError').toString();
      }
    }
    return res;
  };

  const oidcLogin = async (currentProvider: any) => {
    let returnMsg = '';
    const provider = currentProvider.value;
    if (provider === 'cognito') {
      returnMsg = await loginWithCognito(currentProvider);
    } else {
      returnMsg = await loginWithAuthing(currentProvider, provider);
    }
    if (returnMsg === "first-login") {
      // localStorage.setItem('auth_hub_config', JSON.stringify({
      //   ...config,
      //   username: username,
      //   reason: "first-login",
      //   loginType: 'OIDC',
      //   provider: 'cognito',
      //   author: author,
      //   projectName: config.projectName,
      //   clientId: currentProvider.clientId,
      //   redirectUri: currentProvider.redirectUri
      // }));
      window.location.href = ROUTES.ChangePWD;
      return;
    }
    if (returnMsg) {
      setError(returnMsg);
      setLogging(false);
      return;
    }
    localStorage.setItem(
      OIDC_STORAGE,
      JSON.stringify({
        username,
        provider: currentProvider.value,
        clientId: currentProvider.clientId,
        redirectUri: currentProvider.redirectUri,
      }),
    );
    window.location.href = ROUTES.Home;
  };

  return isLoading ? (
    <div style={{ paddingTop: '20%', paddingLeft: '50%' }}>
      <Spinner size="large" />
    </div>
  ) : (<>
    <div className="login-div">
      <SpaceBetween direction="vertical" size="m">
        <div className="container">
        <div className="banner">{config.projectName}</div>
          <div className="sub-title">
            {t('auth:support-prefix')} {config.author} {t('auth:support-postfix')}{' '}
            {config.i18nConfig && (
              <Link variant="info" onFollow={handleLanguageChange}>
                {t('auth:changeLang')}
              </Link>
            )}
          </div>
          <div className="tab" style={{ paddingLeft: '10%' }}>
            <Tabs
              onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
              activeTabId={activeTabId}
              tabs={tabs}
            />
            <div className="bottom-setting">
              <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
                <div>
                  <Checkbox
                    onChange={({ detail }) => setKeep(detail.checked)}
                    checked={keep}
                  >
                    <span className="keep">{t('auth:keepLogin')}</span>
                  </Checkbox>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Link onFollow={forgetPwd}>{t('auth:forgetPWD')}</Link>
                  &nbsp;&nbsp;&nbsp;
                  <Link onFollow={toRegister}>{t('auth:register')}</Link>
                </div>
              </Grid>
            </div>
            <div className="button-group">
              <Button
                variant="primary"
                className="login"
                loading={logging}
                onClick={loginSystem}
              >
                {t('auth:login')}
              </Button>
              <Grid
                gridDefinition={[
                  { colspan: 5 },
                  { colspan: 2 },
                  { colspan: 5 },
                ]}
              >
                <div
                  style={{ marginTop: 20, borderBottom: '1px solid #ccc' }}
                ></div>
                <div
                  style={{ textAlign: 'center', paddingTop: 8, color: '#ccc' }}
                >
                  {t('auth:or')}
                </div>
                <div
                  style={{ marginTop: 20, borderBottom: '1px solid #ccc' }}
                ></div>
              </Grid>
              <div style={{ marginTop: 12 }}>
                <Button
                  className="login"
                  onClick={() => {
                    console.log('SSO');
                  }}
                  disabled
                >
                  {t('auth:sso')}
                </Button>
              </div>
              <div
                style={{
                  marginTop: 30,
                  fontFamily:'Open Sans',
                  fontSize: 14,
                  textAlign: 'right',
                  color: 'red',
                  fontWeight: 800,
                  height: 16,
                }}
              >
                {error}
              </div>
            </div>
            <div style={{ display: 'none' }}>{selectedProviderName}</div>
          </div>
        </div>
      </SpaceBetween>
    </div></>
  );
};

export default Login;
