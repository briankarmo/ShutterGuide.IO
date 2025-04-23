import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Main from './Layout/Main';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
// import PrivateRoute from './routes/PrivateRoute';
import ResetPassword from './components/ResetPassword/ResetPassword';
import ProtectedResetPassword from './components/ResetPassword/ProtectedResetPassword';
import ChangeSuccess from './components/ChangeSuccess/ChangeSuccess';
import InvalidLink from './components/InvalidLink/InvalidLink';
import ProjectRequest from './components/ProjectRequest/ProjectRequest';
import SubscriptionSuccess from './components/Subscription/SubscriptionSuccess'
import SubscriptionCancel from './components/Subscription/SubscriptionCancel'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Main></Main>,
      children: [
        {
          path: '/',
          element: <Home></Home>
        },
        {
          path: 'login',
          element: <Login></Login>
        },
        {
          path: 'success',
          element: <SubscriptionSuccess></SubscriptionSuccess>
        },
        {
          path: 'cancel',
          element: <SubscriptionCancel></SubscriptionCancel>
        },
        {
          path: 'register',
          element: <Register></Register>
        },
        {
          path: 'forgot-password',
          element: <ForgotPassword></ForgotPassword>
        },
        {
          path: 'invalid-link',
          element: <InvalidLink></InvalidLink>
        },
        {
          path: 'reset-password',
          element: <ProtectedResetPassword><ResetPassword></ResetPassword></ProtectedResetPassword>
        },
        {
          path: 'changesuccess',
          element: <ChangeSuccess></ChangeSuccess>
        },
        {
          path: 'projectrequest/:projectId',
          element: <ProjectRequest></ProjectRequest>
        }
      ]
    }
  ])
  return (
    <div className="App w-full">
      <RouterProvider router={router}></RouterProvider>
      <ToastContainer /> 
    </div>
  );
}

export default App;
