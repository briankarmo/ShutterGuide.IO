import React from 'react';
import backImageL from '../../assets/img/back_left.png';
import backImageR from '../../assets/img/back_right.png';
import logoImage from '../../assets/img/logo.png';

const VerifyCode = () => {

  return (
    <div className='w-full flex flex-col justify-center items-center xl:flex-row '>
      <div className='w-full flex flex-col items-center justify-center p-3 2xl:w-1/2 xl:items-end'>
        <img src={backImageL} alt='back' className='object-cover max-w-[90%]' />
      </div>
      <div className='w-full flex flex-col items-center justify-center p-3 2xl:w-1/2 xl:items-start'>
        <img src={backImageR} alt='back' className='object-cover max-w-[90%]' />
      </div>
      <div className='flex flex-col items-center justify-center p-6 bg-white rounded-3xl fixed xl:absolute'>
        <div className='w-full'>
          <div className='flex justify-start mb-5'>
            <img src={logoImage} alt='logo' />
          </div>
          <div className='text-left font-bold text-3xl mb-7 2xl:text-4xl' style={{ fontFamily: 'Montserrat', color: '#001132' }}>
            Please check your email!
          </div>
          <div className='text-left font-light text-md mb-7 2xl:text-lg' style={{ fontFamily: 'Montserrat', color: '#383E50' }}>
            We've send a code to <span className='font-medium' style={{ fontFamily: 'Montserrat', color: '#FF385C' }}>johndoe@gmail.com.</span>
          </div>
          <div className='w-full mb-5 flex justify-between'>
            <div className='w-full flex justify-between items-center py-3 mb-3'>
              <div className=' w-[25%]'>
                <input type='text' className='w-[90%] text-center py-6  border border-solid rounded-md' style={{ borderColor: '#383E50' }} maxLength={1} placeholder='' />
              </div>
              <div className=' w-[25%]'>
                <input type='text' className='w-[90%] text-center py-6  border border-solid rounded-md' style={{ borderColor: '#383E50' }} maxLength={1} placeholder='' />
              </div>
              <div className=' w-[25%]'>
                <input type='text' className='w-[90%] text-center py-6  border border-solid rounded-md' style={{ borderColor: '#383E50' }} maxLength={1} placeholder='' />
              </div>
              <div className=' w-[25%]'>
                <input type='text' className='w-[90%] text-center py-6  border border-solid rounded-md' style={{ borderColor: '#383E50' }} maxLength={1} placeholder='' />
              </div>
            </div>
          </div>
          <div className='flex justify-center items-center text-white text-base font-medium rounded-md p-3 mb-7' style={{ backgroundColor: '#FF385C', fontFamily: 'Montserrat' }}>
            Send Code
          </div>
          <div className='flex justify-center items-center'>
            <div className='mr-1 font-medium' style={{ fontFamily: 'Montserrat', color: '#383E50' }}>
              Send code again? 00:20
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default VerifyCode;