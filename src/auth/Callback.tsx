import  {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { userManager } from "./config/authConfig";
import { Spinner } from "@cloudscape-design/components";
import { ROUTES } from "../common/const";
// import { ROUTES } from "common/constants";

const Callback = () => {

  const navigate = useNavigate();

  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then(() => {
        navigate(ROUTES.Home);
      })
      .catch((error) => console.error("OIDC Callback Error:", error));
  }, [navigate]);

  return <Spinner size="large"/>;
};

export default Callback;
