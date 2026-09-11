import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css'; 
import {Lock} from 'lucide-react';

type UserRole = 'office' | 'loader';
export function LoginPage() {
  const navigate = useNavigate();

  // State management for form inputs
  const [role, setRole]=useState<UserRole>('office');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // UI state for async actions & feedback
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email || !password ) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Example test condition (Replace with actual backend integration)
      if (email === 'user@example.com' && password === 'password123' && role==='office') {
        console.log('Logging in as:', role, email);
        // Redirect user back to the home page or dashboard
        navigate('/');
      } else {
        setError('Invalid email or password. Try user@example.com / password123');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="outerworld">
      <div className='both'>
        <div className="image-wrapper">
        <img className="loginphoto" src="https://images.pexels.com/photos/7233359/pexels-photo-7233359.jpeg" alt="Login background">
        </img>
        <div className='choice-container'>
         <button type="button" className="choice active">SignUp</button>
         <button type="button" className="choice ">Login</button>
         </div>
         </div>
   <div className='container'>
    <div className='header'>
      <div className='text'>SignUp</div>
         <div className='underline'></div>
    </div>
  

    <div className='inputs'>
      
     <div className='input'>
        <input type="email"  placeholder="Email"/>
      </div>

       <div className='input'>
        <input type="password"  placeholder="Password"/>
      </div>
     
    </div>
    <div className="forgot-password">Forgot Password?</div>
     <button type="button" className='startbutton'>Get started</button>
    </div>
    </div>
    </div>
  );
}