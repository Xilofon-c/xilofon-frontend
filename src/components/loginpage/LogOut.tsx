import React from 'react'
import {motion} from 'framer-motion';
import {useNavigate} from 'react-router-dom';



const LogOut = () => {
   const navigate=useNavigate();
   const handleLogOut=()=>{
    localStorage.removeItem('authToken');
    navigate('/');
   }
  return (
    <div className='flex justify-center items-center '>
        <div className=' relative  -rotate-2 lg:w-[500px] lg:h-[500px] w-[300px] h-[300px] lg:mt-10 mt-40 bg-accent rounded-xl flex '>

        
         <motion.div
        className=" absolute lg:w-[480px] lg:h-[480px] w-[280px] h-[280px] rotate-3 mt-10 bg-accent-hover rounded-xl flex flex-col "
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
       <h1 className="lg:text-[90px] text-[40px] pl-10 pt-4 font-extrabold  text-white">
  Log Out
       </h1>
       <p className="text-[20px] text-white  font-light pl-10 p-5 w-[300px]">
        You can log back to your account in any moment!
       </p>
       <div className='  pl-10 flex flex-row mt-5 gap-5'>
         
         <div>
          <h3 className='bg-white rounded-xl text-accent p-3  cursor-pointer'><a onClick={handleLogOut} >Log Me Out</a></h3>
         </div>

         <div>
          <h3 className='bg-white rounded-xl text-accent p-3  cursor-pointer'><a onClick={()=>navigate("/account")} >Cancel</a></h3>
         </div>
        </div>
   
      </motion.div>
      
    </div>
    </div>
  );
};

export default LogOut
