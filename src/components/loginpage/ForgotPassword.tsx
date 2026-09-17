import React,{useState} from 'react';
import {motion} from 'framer-motion';
import {Link} from 'react-router-dom';
import './ForgotPassword.css'

const ForgotPassword = () => {
        const [email, setEmail] = useState<string>('');
        const [error, setError] = useState<string | null>(null);
    const isValidEmail = (emailStr: string): boolean => {
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr);
};

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
     
    if (!email ) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(email)) {
    setError('Invalid email format. Must contain "@" and a valid domain (e.g., name@domain.com).');
    return;
  }
}
  return (
    <div className="border-3 border-accent m-15 h-[500px] rounded-xl bg-gradient-to-r from-violet-200 to-violet-100">
      <motion.div
        className="m-20 grid grid-cols-2 w-[800px] h-[200px] ml-50 rounded-xl gradient"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}>
          <img className=" " src="https://static.vecteezy.com/system/resources/previews/029/726/216/non_2x/3d-purple-illustration-icon-of-using-smartphone-for-sign-up-or-login-to-profile-account-with-security-padlock-side-free-png.png" alt="forgot-password-image"></img>
      
        <form className=" flex p-10  " >

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-accent">Forgot Password?</h1>
            <p className='mt-5 text-sm'>Enter your email adress and we will send you a pin code to confirm your identity.</p>
            <input 
            placeholder="Email"
            value={email}
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            className=' rounded-xl border-2 border-accent  mt-10 p-3 w-[300px]' >
            </input>
            <div className='flex justify-center'>
            <Link to='/input-pin'><div className='mr-3 mt-10 button-pin w-[300px] justify-center h-[50px] p-5 bg-accent text-white flex items-center  rounded-xl'>Send PIN</div></Link>
          </div>
          </div>

          
        </form>
       </motion.div>
    </div>
  )
}

export default ForgotPassword
