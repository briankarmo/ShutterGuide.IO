import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/UserContext';
import backImageL from '../../assets/img/back_left.png';
import backImageR from '../../assets/img/back_right.png';
import logoImage from '../../assets/img/logo.png';
import smsImage from '../../assets/img/sms.png'

const ForgotPassword = () => {
  const { passwordResetEmail } = useContext(AuthContext);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = event => {
    event.preventDefault();
    setMessage({ type: '', text: '' }); // Reset message on new submission

    const form = event.target;
    const email = form.email.value;

    passwordResetEmail(email)
      .then(() => {
        setMessage({
          type: 'success',
          text: 'Password reset link has been sent to your email!'
        });
        form.reset();
      })
      .catch(error => {
        setMessage({
          type: 'error',
          text: error.message
        });
      });
  };

  return (
    <div className='w-full flex flex-col justify-center items-center xl:flex-row '>
      <div className='w-full flex flex-col items-center justify-center p-3 2xl:w-1/2 xl:items-end'>
        <img src={backImageL} alt='back' className='object-cover max-w-[90%]' />
      </div>
      <div className='w-full flex flex-col items-center justify-center p-3 2xl:w-1/2 xl:items-start'>
        <img src={backImageR} alt='back' className='object-cover max-w-[90%]' />
      </div>
      <div className='flex flex-col items-center justify-center p-6 bg-white rounded-3xl fixed xl:absolute max-w-[80%] md:max-w-full'>
        <div className='w-full'>
          <div className='flex justify-start mb-5'>
            <img src={logoImage} alt='logo' />
          </div>
          <div className='text-left font-bold text-3xl mb-7 2xl:text-4xl' style={{ fontFamily: 'Montserrat', color: '#001132' }}>
            Forgot password?
          </div>
          <div className='text-left font-light text-md mb-7 2xl:text-lg text-black' style={{ fontFamily: 'Montserrat'}}>
            Don't worry! It happens. Please enter the email associated with your account.
          </div>
          <form onSubmit={handleSubmit} className='w-full mb-5'>
            <div className='relative flex items-center mb-3'>
              <img src={smsImage} alt='sms' className='absolute ml-3' style={{ color: '#383E50' }} />
              <input type='email' name='email' className='w-full flex items-center pl-11 text-lg py-3 border border-solid rounded-md text-black' style={{ borderColor: '#383E50' }} placeholder='Enter your email.. ' />
            </div>
            {message.text && (
              <div className={`text-center mb-3 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </div>
            )}
            <button type='submit' className='flex w-full justify-center items-center text-white text-base font-medium rounded-md p-3 mb-7' style={{ backgroundColor: '#FF385C', fontFamily: 'Montserrat' }}>
              Send Code
            </button>
          </form>
          <div className='flex justify-center items-center'>
            <div className='mr-1 font-medium' style={{ fontFamily: 'Montserrat', color: '#383E50' }}>
              Remember password?
            </div>
            <Link to='/login' className='font-medium' style={{ fontFamily: 'Montserrat', color: '#FF385C' }}>
              Sign In.
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ForgotPassword;