import React,{useRef, useState} from 'react';

import {motion} from 'framer-motion';
const GetPIN = () => {
           const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const[pin, setPin]=useState<string []>(['','','','']);
    const HandlePinChange=(value:string, index:number)=>{
         const NewPin=[...pin];
         NewPin[index]=value;
         setPin(NewPin);

         if(value && index<3){
            inputRefs.current[index+1]?.focus();
         }
    }

 
    

  return (
   <div className="pt-[30px]">
      <motion.div
        className=" ml-20 grid grid-cols-2 w-[1200px] h-[600px] "
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div>
        <img
          className="h-[500px] mt-10"
          src="./forgotpass.png"
          alt="forgot-password-image"
        />
        </div>

        <div className=' flex flex-col pt-[130px] '>
          <h1 className='text-3xl font-bold text-accent'>Forgot Password?</h1>
          <p className=' mt-5 text-sm color-muted '>Enter the PIN code sent to your email.</p>
          <div className='grid grid-cols-5 w-[400px] h-[100px] mt-10'>
             
                <input type='text'
                ref={(element) => {
                  inputRefs.current[0] = element;
                 }}
                value={pin[0]}
                 maxLength={1}
                  onChange={(e)=>HandlePinChange(e.target.value, 0)}
                className='border-2 border-gray-500 w-[40px] h-[50px] rounded-xl  p-2'
                />
            
               
                <input type='text'
                ref={(element) => {
                  inputRefs.current[1] = element;
                 }}
                value={pin[1]}
                maxLength={1}
                onChange={(e)=>HandlePinChange(e.target.value, 1)}
                className='border-2 border-gray-500 w-[40px] h-[50px] rounded-xl p-2'
                />
            
               
                <input type='text'
                ref={(element) => {
                  inputRefs.current[2] = element;
                 }}
                value={pin[2]}
                 maxLength={1}
                  onChange={(e)=>HandlePinChange(e.target.value, 2)}
                    className='border-2 border-gray-500 w-[40px] h-[50px] rounded-xl p-2'
                />
             
                
                    <input type='text'
                    ref={(element) => {
                  inputRefs.current[3] = element;
                 }}
                value={pin[3]}
                 maxLength={1}
                  onChange={(e)=>HandlePinChange(e.target.value, 3)}
                 className='border-2 border-gray-500 w-[40px] h-[50px] rounded-xl p-2'

                />
               </div>
       
          <div className="flex ">

            <button
              type="button"
              className=" button-pin w-[280px] h-[50px] bg-accent text-white flex items-center justify-center rounded-xl"
            >
              Verify PIN
            </button>
        </div>
       
    </div>
      </motion.div>
    </div>
  );
};

export default GetPIN
