import React,{useRef, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import api from '../../api';
import {motion} from 'framer-motion';



const GetPIN = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const email = location.state?.email;
           const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const[pin, setPin]=useState<string []>(['','','','']);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading]=useState(false);
    const HandlePinChange=(value:string, index:number)=>{
         const NewPin=[...pin];
         NewPin[index]=value;
         setPin(NewPin);

         if(value && index<3){
            inputRefs.current[index+1]?.focus();
         }
    }

    const handleSubmit= async (e:React.FormEvent<HTMLFormElement>)=>{
      
      e.preventDefault();
      setError(null);

      if(!pin.every((digit)=>digit!== '')){
        setError('PIN is incomplete');
        return;
      }
     
      try{

        setLoading(true);
        let response;
        const pin_={email, pin:pin.join('')};
        console.log('email:', email);
        console.log('pin_ payload:', pin_);
        
        response=await api.post('/data/verify-pin' ,pin_);
        navigate('/data/reset-password');

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
   <div className="md:pt-[30px] pb-0 ">
      <motion.div
        className=" ml-5  g-1 grid lg:grid-cols-2 lg:w-[1200px] lg:h-[600px] "
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div>
        <img
          className="hidden md:block md:h-[500px] "
          src="./download5.png"
          alt="forgot-password-image"
        />
        </div>
  <div className='flex items-center justify-center  md:mb-37 md:mr-20'>
        <div className=' flex flex-col pt-[130px]  '>
          <h1 className='text-3xl font-bold text-accent'>Forgot Password?</h1>
          <p className=' mt-5 text-sm color-muted '>Enter the PIN code sent to your email.</p>
          <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-5  w-[400px] mt-5 h-[80px] md:mt-10 md:gap-2 gap-1'>
             
                <input type='text'
                ref={(element) => {
                  inputRefs.current[0] = element;
                 }}
                value={pin[0]}
                 maxLength={1}
                  onChange={(e)=>HandlePinChange(e.target.value, 0)}
                className='border-2 border-gray-500  w-[35px] h-[45px] rounded-xl  p-2 '
                />
            
               
                <input type='text'
                ref={(element) => {
                  inputRefs.current[1] = element;
                 }}
                value={pin[1]}
                maxLength={1}
                onChange={(e)=>HandlePinChange(e.target.value, 1)}
                 className='border-2 border-gray-500 w-[35px] h-[45px] rounded-xl  p-2'
                />
            
               
                <input type='text'
                ref={(element) => {
                  inputRefs.current[2] = element;
                 }}
                value={pin[2]}
                 maxLength={1}
                  onChange={(e)=>HandlePinChange(e.target.value, 2)}
                    className='border-2 border-gray-500 w-[35px] h-[45px] rounded-xl  p-2'
                />
             
                
                    <input type='text'
                    ref={(element) => {
                  inputRefs.current[3] = element;
                 }}
                value={pin[3]}
                 maxLength={1}
                  onChange={(e)=>HandlePinChange(e.target.value, 3)}
                 className='border-2 border-gray-500 w-[35px] h-[45px] rounded-xl  p-2'

                />
               </div>
       
               {error && (
               <p  className="text-red-500 text-sm pb-5">
                 {error}
               </p>
                )}

            <button
              type="submit"
              className=" button-pin w-[280px] h-[50px]  bg-accent text-white flex items-center justify-center rounded-xl"
              onClick={()=> navigate('/reset-password')}
            >
              Verify PIN
            </button>
        </form>
       
    </div>
    </div>
      </motion.div>
    </div>
  );
};

export default GetPIN