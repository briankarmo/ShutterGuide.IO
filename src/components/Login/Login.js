import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/UserContext';
import { toast } from 'react-toastify';
import logoImage from '../../assets/img/SGAirStackedBlack.png';
import eyeImage from '../../assets/img/eye-slash.svg'
import backgroundImage from '../../assets/img/background.png'

const Login = () => {
  const navigate = useNavigate()
  const { signIn, user } = useContext(AuthContext);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const SESSION_DURATION = 3600000; // 1 hour in milliseconds

  useEffect(() => {
    const savedCredentials = localStorage.getItem('userCredentials');
    if (savedCredentials) {
      const { email, rememberMe } = JSON.parse(savedCredentials)
      setEmail(email);
      setRememberMe(rememberMe); // Check the checkbox if there's a saved email
    }
  }, [])

  const validateForm = () => {
    if (!email || !password) {
      return 'All fields are required.';
    }
    if (password.length === 6) {
      return 'Password must be at least 6 characters long.';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault()

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError); // Show error notification
      return;
    }

    signIn(email, password)
      .then(result => {

        if (rememberMe) {
          localStorage.setItem('userCredentials', JSON.stringify({
            email: email,
            rememberMe
          }));

          // await setPersistence(auth, browserLocalPersistence)
        } else {
          localStorage.removeItem('userCredentials');
          // await setPersistence(auth, browserSessionPersistence);
        }
        setSession()
      })
      .catch(err => {
        switch (err.code) {
          case 'auth/wrong-password':
            toast.error('Incorrect password. Please try again.');
            break;
          case 'auth/user-not-found':
            toast.error('No user found with this email address.');
            break;
          case 'auth/invalid-email':
            toast.error('Invalid email format.');
            break;
          case 'auth/too-many-requests':
            toast.error('Too many login attempts. Please try again later.');
            break;
          default:
            toast.error('Login failed. Please check your credentials.');
        }

        console.error(err)
      })
  }

  useEffect(() => {
    try {
      // Check if session exists and is still valid
      const sessionData = JSON.parse(localStorage.getItem('session'));
      if (sessionData && Date.now() < sessionData.expirationTime && user && user.uid) {
        navigate('/'); // Redirect if session is valid
      }
    } catch (error) {
      localStorage.removeItem('session')
    }
  }, [navigate, user])

  const setSession = () => {
    const expirationTime = Date.now() + SESSION_DURATION;
    localStorage.setItem('session', JSON.stringify({ expirationTime }));
  };

  const handleEyeIcon = () => {

    const passwordInput = document.getElementById('passwordInput')
    const typeInput = passwordInput.getAttribute('type')
    passwordInput.setAttribute('type', typeInput === 'text' ? 'password' : 'text')
  }

  return (
    <div className='w-full flex flex-col items-center justify-center h-full xl:flex-row' style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className='flex flex-col items-center justify-center p-8 fixed xl:absolute max-w-[80%] md:max-w-full'>
        <form onSubmit={handleSubmit} className='w-full'>
          <div className='text-center font-bold text-[14px] mb-10 sm:mb-12 sm:text-[26px]' style={{ fontFamily: 'Montserrat', color: '#001132' }}>
            WELCOME TO SHUTTERGUIDE
          </div>
          <div className='text-center text-[16px] mb-10 sm:mb-16 sm:text-3xl' style={{ fontFamily: 'Montserrat', color: '#001132' }}>
            LOG IN TO YOUR ACCOUNT
          </div>
          <div className='w-full mb-3'>
            <div className='relative flex items-center mb-3 w-full'>
              <input type='email' onChange={(e) => setEmail(e.target.value)} value={email} className='w-full flex items-center pl-3 text-[14px] sm:text-md py-2 text-black border-2 border-solid rounded-xl' style={{ borderColor: '#383E50' }} placeholder='EMAIL' />
            </div>
            <div className='relative flex items-center w-full'>
              <input id='passwordInput' type='password' onChange={(e) => setPassword(e.target.value)} value={password} className='w-full flex items-center pl-3 text-black text-[14px] sm:text-md py-2 border-2 border-solid rounded-xl' style={{ borderColor: '#383E50' }} placeholder='PASSWORD' />
              <img onClick={() => handleEyeIcon()} src={eyeImage} alt='eye' className='absolute right-3 cursor-pointer' style={{}} />
            </div>
          </div>
          <div className='w-full flex justify-between mb-10 sm:mb-14 font-medium'>
            <div className='text-[14px] flex items-center text-black' style={{ fontFamily: 'Montserrat', }}>
              <input id='rememberMe' onChange={(e) => setRememberMe(e.target.checked)} checked={rememberMe} type='checkbox' className='mr-1 w-6 text-base' />
              <label for='rememberMe' className='text-[14px]'>REMEMBER ME</label>
            </div>
            <Link to='/forgot-password' className='text-[14px]' style={{ fontFamily: 'Montserrat', color: '#000' }}>
              FORGOT PASSWORD?
            </Link>
          </div>
          <button type='submit' className='flex w-full justify-center items-center text-white text-[14px] sm:text-xl 2xl:text-2xl font-medium rounded-xl p-3 mb-3' style={{ backgroundColor: "#000", fontFamily: 'Montserrat' }}>
            LOGIN
          </button>
          <div className='flex justify-between mb-10 sm:mb-24 font-medium'>
            <div className='mr-1 text-[14px] text-black' style={{ fontFamily: 'Montserrat', }}>
              DON'T HAVE AN ACCOUNT?
            </div>
            <Link to='/register' className='text-[14px]' style={{ fontFamily: 'Montserrat', color: '#000' }}>
              CREATE AN ACCOUNT
            </Link>
          </div>
          <div className='flex justify-center items-center cursor-pointer' onClick={() => navigate('/')}>
            <img src={logoImage} className='w-[180px] sm:w-[220px] h-auto mx-auto' alt='logo' />
          </div>
        </form>
      </div>
    </div>
  )
};

export default Login;