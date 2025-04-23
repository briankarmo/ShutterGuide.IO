import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/UserContext';
import backImageL from '../../assets/img/back_left.png';
import backImageR from '../../assets/img/back_right.png';
import logoImage from '../../assets/img/logo.png';
import lockImage from '../../assets/img/lock.svg'
import eyeImage from '../../assets/img/eye-slash.svg'

const ResetPassword = () => {
  const { passwordResetCode, passwordReset } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validCode, setValidCode] = useState(false);


  const location = useLocation();
  const navigate = useNavigate();
  const oobCode = new URLSearchParams(location.search).get('oobCode');

  const handleEyeIcon = (e) => {
    const passwordInput = e.target.parentElement.children[1]
    const typeInput = passwordInput.getAttribute('type')
    passwordInput.setAttribute('type', typeInput === 'text' ? 'password' : 'text')
  }


  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        return;
      }

      try {
        await passwordResetCode(oobCode);
        setValidCode(true);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    // Only call verifyCode if oobCode is present
    if (oobCode && !validCode) {
      verifyCode();
    }
  }, [oobCode, passwordResetCode, validCode]);

  const handleSubmit = async event => {
    event.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    if (password.length === 6) {
      return;
    }

    try {
      // Confirm password reset
      passwordReset(oobCode, password);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Error:', err);
    }
  }

  return (
    <div className='w-full flex flex-col justify-center items-center xl:flex-row '>
      <div className='w-full flex flex-col items-center justify-center p-3 2xl:w-1/2 xl:items-end'>
        <img src={backImageL} alt='back' className='object-cover max-w-[90%]' />
      </div>
      <div className='w-full flex flex-col items-center justify-center p-3 2xl:w-1/2 xl:items-start'>
        <img src={backImageR} alt='back' className='object-cover max-w-[90%]' />
      </div>
      <div className='flex flex-col items-center justify-center p-6 bg-white rounded-3xl fixed xl:absolute max-w-[80%] md:max-w-full'>
        <div className='w-full '>
          <div className='flex justify-start mb-5'>
            <img src={logoImage} alt='logo' />
          </div>
          <div className='text-left font-bold text-3xl mb-7 2xl:text-4xl' style={{ fontFamily: 'Montserrat', color: '#001132' }}>
            Reset password!
          </div>
          <div className='text-left font-light text-md mb-7 2xl:text-lg' style={{ fontFamily: 'Montserrat', color: '#383E50' }}>
            Please type something you'll remember
          </div>
          <form className='w-full mb-5'>
            <div className='relative flex items-center mb-3'>
              <img src={lockImage} alt='lock' className='absolute ml-3' style={{ color: '#383E50' }} />
              <input type='password' name='password' onChange={(e) => setPassword(e.target.value)} value={password} className='w-full flex items-center pl-11 text-lg py-3 border border-solid rounded-md' style={{ borderColor: '#383E50' }} placeholder='Enter new password.. ' />
              <img onClick={(e) => handleEyeIcon(e)} src={eyeImage} alt='eye' className='absolute right-3 cursor-pointer' style={{ color: '#383E50' }} />
            </div>
            <div className='relative flex items-center mb-3'>
              <img src={lockImage} alt='lock' className='absolute ml-3' style={{ color: '#383E50' }} />
              <input type='password' name='repassword' onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} className='w-full flex items-center pl-11 text-lg py-3 border border-solid rounded-md' style={{ borderColor: '#383E50' }} placeholder='Confirm password.. ' />
              <img onClick={(e) => handleEyeIcon(e)} src={eyeImage} alt='eye' className='absolute right-3 cursor-pointer' style={{ color: '#383E50' }} />
            </div>
            <button onClick={handleSubmit} className='flex w-full justify-center items-center text-white text-base font-medium rounded-md p-3 mb-9' style={{ backgroundColor: '#FF385C', fontFamily: 'Montserrat' }}>
              Reset Password
            </button>
          </form>
          <div className='flex justify-center items-center'>
            <div className='mr-1 font-medium' style={{ fontFamily: 'Montserrat', color: '#383E50' }}>
              Already have an account?
            </div>
            <div className='font-medium' style={{ fontFamily: 'Montserrat', color: '#FF385C' }}>
              Sign In.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ResetPassword;