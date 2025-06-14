import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { Spinner } from '@cloudscape-design/components';
// import ReSignIn from './comps/ReSignIn';

// import LoginCallback from './comps/LoginCallback';

// import { ROUTES } from './utils/const';
import Login from './pages/login';
import FindPWD from './pages/find-pwd';
import Register from './pages/register';
import ChangePWD from './pages/change-pwd';
import { ROUTES } from './common/const';

const SignedInRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.Login} element={<Login />} />
        <Route path={ROUTES.FindPWD} element={<FindPWD />} />
        <Route path={ROUTES.Register} element={<Register />} />
        <Route path={ROUTES.ChangePWD} element={<ChangePWD />} />
      </Routes>
      {/* <CommonAlert /> */}
    </BrowserRouter>
  );
};

const AppRouter = () => {
  const auth = useAuth();
  if (auth?.isLoading) {
    return (
      <div className="page-loading">
        <Spinner />
      </div>
    );
  }

  if (auth?.error) {
    return (
      <>
        <ReSignIn />
        <SignedInRouter />
      </>
    );
  }

  // auth.isAuthenticated = true
  if (auth?.isAuthenticated) {
  return <SignedInRouter />;
  }
  return (
    <SignedInRouter />
  );
};

export default AppRouter;
