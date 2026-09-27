import React from 'react';
import {motion} from 'framer-motion';
import {useState} from 'react'

const ResetPassword = () => {

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const[active, setActive]= useState(false);

  return (
    <div className="pt-[30px] flex justify-center items-center ">
      <motion.div
        className=" bg-white/80 backdrop-blur-md border border-white rounded-2xl shadow-lg ml-20 w-[550px] h-[500px] "
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        

        <div className=' flex flex-col pt-7 ml-20'>
          <h1 className=' text-3xl font-bold text-accent'>Reset password</h1>
          <div className='relative  mt-10 w-[280px]'>
          <input className=' relative  p-4 border text-black text-md w-full border-accent border-sm rounded-sm'
          placeholder="Enter new password"
         type={showPassword ? "text" : "password"}>
          </input>
          <button
                type="button"
                className="text-accent mr-10 absolute right-1 top-1/2 -translate-y-1/2 "
                onClick={() => setShowPassword(!showPassword)}
                
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
               
          </div>
          <div className='mt-5'>
        <p className={active ? "text-green-600 text-sm" : "text-gray-400 text-sm"}>
               ✓ At least 5 characters
           </p>
            <p className={active ? "text-green-600 text-sm" : "text-gray-400 text-sm"}>
               ✓ At least one uppercase letter
           </p>
            <p className={active ? "text-green-600 text-sm" : "text-gray-400 text-sm"}>
               ✓ At least one number
           </p>
               
            </div>
          
       
    </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword
