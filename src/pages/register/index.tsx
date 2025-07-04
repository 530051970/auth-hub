import { Button, Checkbox, FormField, Grid, Input, Link, Select, SpaceBetween } from '@cloudscape-design/components';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import yaml from 'yaml';
import './style.scss';
import { EN_LANG, ROUTES, ZH_LANG, ZH_LANGUAGE_LIST } from '../../common/const';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoginType {
  label: string;
  value: string;
  disabled: boolean;
}

interface OidcOption {
  label?: string;
  iconUrl?: string;
  value?: string;
  tags?: readonly string[];
}

// interface OidcProvider {
//   name: string;
//   label: string;
//   description: string;
// }

interface ThirdLogin {
  type: string;
  iconUrl: string;
  iconUrlSelected: string;
  iconStyle: React.CSSProperties;
}

const Register: FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [projectName] = useState("" as string);
  // const [selectedThird, setSelectedThird] = useState("" as string);
  const [loginType] = useState<LoginType[]>([]);
  const [thirdLogin] = useState<ThirdLogin[]>([]);
  const [author] = useState("" as string)
  const [selectedLoginType, setSelectedLoginType] = useState("oidc" as string)
  const [email, setEmail] = useState("" as string)
  const [oidcProvider, setOidcProvider] = useState<OidcOption | null>(null)
  const [oidcOptions] = useState<OidcOption[]>([]);
  const { t, i18n } = useTranslation();
  const [lang, setLang]= useState('')
  
  useEffect(()=>{
    // const tmp_login_type: LoginType[] =[]
    // let tmp_third_login: ThirdLogin[] =[]
    if (ZH_LANGUAGE_LIST.includes(i18n.language)) {
      setLang(ZH_LANG)
      i18n.changeLanguage(ZH_LANG);
    } else {
      setLang(EN_LANG)
      i18n.changeLanguage(EN_LANG);
    }
    // const loadConfig = async ()=> {
    //   let response = await fetch('/config.yaml')
    //   let data = await response.text()
    //   return yaml.parse(data);
    // }
    // loadConfig().then(configData =>{
    //   setProjectName(configData.project)
    //   setAuthor(configData.author)
    //   if(configData.login.user){
    //     tmp_login_type.push({
    //       label: t('auth:username'),
    //       value: configData.login.user.value,
    //       disabled: configData.login.user.disabled || false
    //     })
    //   }
    //   if(configData.login.sns){
    //     tmp_login_type.push({
    //       label: t('auth:sns'),
    //       value: configData.login.sns.value,
    //       disabled: configData.login.sns.disabled || false
    //     })
    //   }
    //   if(configData.login.oidc && configData.login.oidc.providers.length > 0){
    //     const oidcOptions:OidcOption[] =[]
    //     configData.login.oidc.providers.forEach((item: OidcProvider)=>{
    //       oidcOptions.push({
    //         label: item.label,
    //         iconUrl:`../../imgs/${item.name}.png`,
    //         value: item.name,
    //         tags: [genOIDCDesc(item.name)]
    //       })
    //     })
    //     tmp_login_type.push({
    //       label: t('auth:oidc'),
    //       value: configData.login.oidc.value,
    //       disabled: configData.login.oidc.disabled || false
    //     })
    //     setOidcOptions(oidcOptions)
    //   }
    //   if(configData.login.third && configData.login.third.length > 0){
    //     tmp_third_login = configData.login.third
    //     setThirdLogin(tmp_third_login)
    //   }
    //   setLoginType(tmp_login_type)
    // })
  }
)

  const changeLanguage = () => {
    if(lang===EN_LANG){
      setLang(ZH_LANG)
      i18n.changeLanguage(ZH_LANG);
    } else {
      setLang(EN_LANG)
      i18n.changeLanguage(EN_LANG);
    } 
  };
  
  // const genOIDCDesc=(name: string)=>{
  //   let description = ""
  //   switch(name){
  //     case "keycloak":
  //       description = t('auth:keycloakDesc');
  //       break;
  //     case "authing":
  //       description = t('auth:authingDesc');
  //       break;
  //     default:
  //       description = t('auth:cognitoDesc');
  //       break;
  //   }
  //   return description
  // }

  const toLogin =()=>{
    navigate(ROUTES.Login)
  }

  // const handleMouseEnter =(target: string)=>{
  //   setSelectedThird(target)
  // }

  // const handleMouseLeave =(target: string)=>{
  //   setSelectedThird("")
  // }

  const changeLoginType = (checked:boolean,loginType: string)=>{
    if(checked){ 
      setSelectedLoginType(loginType)
    } else{
      setSelectedLoginType("")
    }
    
  }

  const registerAccount = ()=>{
    setError(t('auth:waiting'))
  }

  return (
    <div className="register-div">
      <div className='container'>
        {/* <img src={banner} alt='banner' className='banner'/> */}
        <div className='banner'>{projectName}</div>
        <div className='sub-title'>{t('auth:support-prefix')} {author} {t('auth:support-postfix')} <Link variant="info" onFollow={()=>changeLanguage()}>{t('auth:changeLang')}</Link></div>
        <div className='tab' style={{paddingLeft:'10%'}}>
          <div style={{height:270,width:'90%'}}>
          <div style={{color:"#000000a6",fontSize:18, fontWeight:800, marginBottom:20}}>{t('auth:create.title')}</div>
          <div style={{width:'100%'}}>
            <Grid gridDefinition={[{colspan:4},{colspan:4},{colspan:4}]}>
              {loginType.map(item=>(<div>
                <Checkbox
                  disabled={item.disabled}
                  checked={selectedLoginType === item.value}
                  onChange={({ detail }) => {
                      changeLoginType(detail.checked,item.value);
                  }}
                >
                  {item.label}
                </Checkbox>
              </div>))}
            </Grid>
            {(selectedLoginType==='username')?(
              <div style={{marginTop:35}}>
                <FormField
                  description="Please enter a valid email address. If it exists and is associated with an existing user, we will send a password reset email to this address..."
                  label="Email"
                >
                  <Input
                    value={email}
                    placeholder='eg: developer@cloud.com'
                    onChange={event =>
                      setEmail(event.detail.value)
                    }
                  />
                </FormField>
              </div>):((selectedLoginType==='oidc')?(<div style={{marginTop:15}}>
                <SpaceBetween size='s' direction='vertical'>
                <FormField
                  description={t("auth:create:oidcDesc")}
                  label={t("auth:create:oidc")}
                >
                  {/* <div className='item'> */}
                    <Select
                      placeholder={t("auth:create:oidcPlaceholder").toString()}
                      selectedOption={oidcProvider||oidcOptions[0]}
                      onChange={({ detail }) =>
                        setOidcProvider(detail.selectedOption)
                      }
                      options={oidcOptions}
                    />
                  {/* </div> */}
                </FormField>
                <Grid gridDefinition={[{colspan:5},{colspan:7}]} >
                <FormField
                  description={t("auth:create:usernameDesc")}
                  label={t("auth:create:username")}
                >
                  <Input
                    value={email}
                    placeholder={t('auth:create:usernamePlaceHolder').toString()}
                    onChange={event =>
                      setEmail(event.detail.value)
                    }
                  />
                </FormField>
                <FormField
                  description={t("auth:create:emailDesc")}
                  label={t("auth:create:email")}
                >
                  <Input
                    value={email}
                    placeholder={t('auth:create:emailPlaceHolder').toString()}
                    onChange={event =>
                      setEmail(event.detail.value)
                    }
                  />
                </FormField>      
              </Grid>
            </SpaceBetween>
    
              </div>):(<>
              </>))}
          </div>
        </div>
        <div className='button-group'>
          <Button variant="primary" className='register' onClick={()=>registerAccount()}>{t('auth:create:register')}</Button>
        </div>
        <div style={{color: 'rgb(128, 128, 128)', fontSize: 14,marginTop: 30, width:'90%'}}>
          {(thirdLogin && thirdLogin.length>0)?(
          <Grid gridDefinition={[{colspan:4},{colspan:8}]}>
            {/* <SpaceBetween direction='horizontal' size='s'>
              {thirdLogin.map(item=>{
                return (<div key={item.type} onMouseEnter={()=>handleMouseEnter(item.type)} onMouseLeave={()=>handleMouseLeave(item.type)}>
                          <img src={selectedThird===item.type? `../imgs/${item.iconUrlSelected}.png`:`../imgs/${item.iconUrl}.png`} alt="" style={item.iconStyle}/>
                        </div>)
                })
              }
            </SpaceBetween> */}
            <div style={{paddingTop:15, textAlign:'right'}}>
              <span style={{color: 'rgb(128, 128, 128)'}}>{t('auth:create:hasAccount')}</span>
              <Link onFollow={toLogin}>{t('auth:create:login')}</Link>
            </div>
          </Grid>):(
          <Grid gridDefinition={[{colspan:12}]}>
            <div style={{paddingTop:5, textAlign:'right'}}>
              <span style={{color: 'rgb(128, 128, 128)'}}>{t('auth:create:hasAccount')}</span>
              <Link onFollow={toLogin}>{t('auth:create:login')}</Link>
            </div>
          </Grid>)}
          <div style={{marginTop:10,textAlign:'right',color:'red',fontWeight:800,height:16}}>{error}</div>
        </div>
      </div>   
    </div>
  </div>
  );
};

export default Register;
