import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import {motion} from 'framer-motion';

type UserRole = 'office' | 'loader';
type AuthTab= 'SignUp' | 'Login';

export function LoginPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AuthTab>('SignUp');
  const handleTabSwitch = (mode: AuthTab) => {
    setActiveTab(mode);
    setError(null); 
    setEmail('');
  setPassword('');
  setUsername('');
  setCheckPassword('');
  
  };

  const [role, setRole] = useState<UserRole>('office');
  const handleRole = (mode: UserRole) => {
    setRole(mode);
  };
  const[username, setUsername]=useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [checkpassword, setCheckPassword]=useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isValidEmail = (emailStr: string): boolean => {
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr);
};
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
     
    if (!email || !password || (activeTab==="SignUp" && !username)) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(email)) {
    setError('Invalid email format. Must contain "@" and a valid domain (e.g., name@domain.com).');
    return;
  }
  if(password.length<6){
    setError('Password must contain more than 6 characters.');
    return;
  }
  if(password !== checkpassword && activeTab==="SignUp"){
    setError('The passwords do not match.');
      return;
  }

    setIsLoading(true);

  

 try {
 
  await new Promise((resolve) => setTimeout(resolve, 1000));

  localStorage.setItem('authToken', 'mock-test-jwt-token');

  console.log(`${activeTab} successful! as ${role}`);
  navigate('/'); 
} catch (err: any) {
  setError('Something went wrong.');
} finally {
  setIsLoading(false);
}
  }

  return (
    <div className="outerworld">
      <motion.div
        className="both"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}>
     
      
        <div className="image-wrapper">
          <img
            className="loginphoto"
            src="https://images.pexels.com/photos/7233359/pexels-photo-7233359.jpeg"
            alt="Login background"
          />
          <div className="choice-container">
            <button
              type="button"
              className={activeTab === 'SignUp' ? 'choice-active' : 'choice'}
              onClick={() => handleTabSwitch('SignUp')}
            >
              SignUp
            </button>
            <button
              type="button"
              className={activeTab === 'Login' ? 'choice-active' : 'choice'}
              onClick={() => handleTabSwitch('Login')}
            >
              Login
            </button>
          </div>
        </div>

      
        <form className="container" onSubmit={handleSubmit}>
          <div className="header">
            <div className="text">{activeTab}</div>
            <div className="underline"></div>
          </div>

          <div className="status">
            <button
              type="button"
              className={role === 'office' ? 'active-status' : 'nonactive'}
              onClick={() => handleRole('office')}
            >
              Office
            </button>
            <p>|</p>
            <button
              type="button"
              className={role === 'loader' ? 'active-status' : 'nonactive'}
              onClick={() => handleRole('loader')}
            >
              Loader
            </button>
          </div>
         
          <div className="inputs">
             {activeTab==='SignUp' && (<div className="input">
              <input type="text"
              placeholder="Username"
               value={username}
               onChange={(e)=>setUsername(e.target.value)}
              />
             </div>)}
            <div className="input">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="show-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {activeTab==='SignUp' &&
            (<div className="input" style={{ position: 'relative' }}>
              <input value={checkpassword}
              placeholder="Verify password"
              type={showPassword ? 'text':'password' }
              onChange={(e)=>setCheckPassword(e.target.value)}/>
               <button
                type="button"
                className="show-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            
            </div>)}
          </div>

          {error && (
            <div className="error-message" style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {activeTab === 'SignUp' ? (
            <label className="check-box">
              <input type="checkbox" required />
              <span>I agree to the <a href="/terms">Terms & Conditions</a></span>
            </label>
          ) : (
            <div className="forgot-password">Forgot Password?</div>
          )}

          <button
            type="submit"
            className="startbutton"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : activeTab === 'Login' ? 'Log in' : 'Get started'}
          </button>

          <a className="back" onClick={() => navigate('/')}>
            ← Get back to home
          </a>
        </form>
       </motion.div>
    </div>
  );
}
