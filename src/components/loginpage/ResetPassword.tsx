import React from 'react';
import {motion} from 'framer-motion';
import {useState} from 'react'
import api from '../../api';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
    const location = useLocation();
  const [password, setPassword]=useState('');
  const [error, setError]=useState<string | null>(null);
   const email = location.state?.email;
   const pin_=location.state?.pin_;
  const [loading, setLoading]=useState(false);
  const handleResetPassword=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setError(null);
    if( password.length < 5 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)){
      setError('Please enter a valid password');
      return;
    }


try{
setLoading(true);
  let response;
  const resetData={email, pin_, password};
  response= await api.post('/data/reset-password', resetData);
  navigate('/reset-password');
  
}
catch(err:any){
   console.log('error response:', err.response?.data);
         const serverErrorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
               setError(serverErrorMessage);
  }
  finally{
   setLoading(false);
  }
};

  return (
    <div className=" mt-40 lg:mt-5 pt-[30px] flex justify-center items-center "
    >
      <motion.div
        className=" bg-white/80 backdrop-blur-md border border-white rounded-2xl shadow-lg lg:ml-20 w-[340px] h-[340px] lg:w-[500px] lg:h-[480px] "
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        

        <form className=' flex flex-col pt-7 ml-10 lg:ml-20'
        onSubmit={handleResetPassword}>
          <h1 className=' text-xl lg:text-4xl font-bold text-accent'>Reset password</h1>
          <div className='relative  mt-10 w-[270px] lg:w-[300px]'>
          <input className=' relative  p-4 border text-black text-lg lg:text-xl w-full border-accent border-sm rounded-sm'
          placeholder="Enter new password"
           value={password}
         type={showPassword ? "text" : "password"}
         onChange={(e)=>setPassword(e.target.value)}>
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
        <p className={password.length>=5 ? "text-green-600 text-md" : "text-gray-400 text-md"}>
               ✓ At least 5 characters
           </p>
            <p className={/[A-Z]/.test(password) ? "text-green-600 text-md" : "text-gray-400 text-md"}>
               ✓ At least one uppercase letter
           </p>
            <p className={/[0-9]/.test(password) ? "text-green-600 text-md" : "text-gray-400 text-md"}>
               ✓ At least one number
           </p>
             {error && (
             <p className="text-red-600 mt-2 text-md">
                  {error}
               </p>
               )}
            </div>
            <div className=' mt-10 lg:mt-10 flex gap-6 text-lg lg:text-xl '>
            <button onClick={()=> navigate('/login')} className='p-1.5 lg:p-3 bg-accent  text-white  rounded-xl hover:bg-accent-hover'>Cancel</button>
            <button type='submit' className='p-1.5 lg:p-3 bg-accent text-white  rounded-xl hover:bg-accent-hover'>Confirm</button>
            </div>
          
       
    </form>
      </motion.div>
    </div>
  )
}

export default ResetPassword
