import React from 'react';
import { Link } from 'react-router-dom';
import backImageL from '../../assets/img/back_left.png';
import backImageR from '../../assets/img/back_right.png';
import logoImage from '../../assets/img/logo.png';
import checkcircle from '../../assets/img/tick-circle.svg'

const ChangeSuccess = () => {

    return (
      <div className='w-full flex flex-col items-center justify-center xl:flex-row '>
        <div className='w-full flex flex-col items-center justify-center p-3 2xl:w-1/2 xl:items-end'>
        <img src={backImageL} alt='back' className='object-cover max-w-[90%]' />
      </div>
      <div className='w-full flex flex-col items-center justify-center p-3 2xl:w-1/2 xl:items-start'>
        <img src={backImageR} alt='back' className='object-cover max-w-[90%]' />
      </div>
        <div className='flex flex-col items-center justify-center p-6 bg-white rounded-3xl fixed xl:absolute'>
          <div className='w-full'>
            <div className='flex flex-col items-start mb-5'>
              <img className='mb-3' alt='logo' src={logoImage} />
              <img src={checkcircle} alt='check' />
            </div>
            <div className='text-left font-bold text-3xl mb-7 2xl:text-4xl' style={{fontFamily:'Montserrat', color:'#001132'}}>
              Password changed!
            </div>
            <div className='text-left font-light text-md mb-7 2xl:text-lg text-black' style={{fontFamily:'Montserrat'}}>
              Your password has been changed successfully
            </div>
            <Link to='/login' className='flex justify-center items-center text-white text-base font-medium rounded-md p-3 mb-7' style={{backgroundColor:'#FF385C', fontFamily:'Montserrat'}}>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
};

export default ChangeSuccess;