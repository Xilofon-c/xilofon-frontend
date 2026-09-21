import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import axios from 'axios';


const api=axios.create({
    baseURL:'http://localhost:8000', 
    
  });


const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const isValidEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email format. Must contain "@" and a valid domain (e.g., name@domain.com).');
      return;
    }

    try {
      setLoading(true);
      let response;
      const forgot_password={email,};
      response= await api.post('/auth/forgot-password', forgot_password);
     
      navigate('/input-pin'); }
      catch(err:any){
        const serverErrorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
    setError(serverErrorMessage);
      }
      finally{
  setLoading(false);
      }
  };

  return (
    <div className="">
      <motion.div
        className=" ml-20 grid grid-cols-2 w-[1200px] h-[600px]  align-center justify-center"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <img
          className="h-[500px] mt-10"
          src="./forgotpass.png"
          alt="forgot-password-image"
        />

        <form className="flex p-10" onSubmit={handleSubmit}>
          <div className="flex flex-col flex align-center justify-center ">
            <h1 className="text-3xl font-bold text-accent">Forgot Password?</h1>
            <p className="mt-5 text-m w-[270px]">
              Enter your email address and we will send you a PIN code to confirm your identity.
            </p>

            <input
              placeholder="Email"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-2 border-accent mt-10 p-3 w-[300px]"
            />

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="mt-5 mr-4 button-pin w-[300px] h-[50px] bg-accent text-white flex items-center justify-center rounded-xl disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Sending...' : 'Send PIN'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;