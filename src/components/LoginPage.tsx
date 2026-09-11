import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Add your styles here

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
   <div className='outerland'>
  <div className='whole'>
        <img  className='imagelog' src="https://images.pexels.com/photos/7135028/pexels-photo-7135028.jpeg" alt="login sidephoto"></img>
    <aside>
    <div className="login-container">
      <div className="login-card">
        <h2>Sign In</h2>
        <p className="login-subtitle">Welcome back! Please enter your details.</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="back-home">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
    </aside>
   </div>

    </div>
  );
}