import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseErrorMessage } from '../utils/errorMessages';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (error) {
      console.error('Auth error:', error);
      setError(getFirebaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, setter) => {
    setError(''); // Clear error when user types
    setter(e.target.value);
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Register' : 'Login'} to Play Chess</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => handleInputChange(e, setEmail)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => handleInputChange(e, setPassword)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? (isRegistering ? 'Registering...' : 'Logging in...') : (isRegistering ? 'Register' : 'Login')}
        </button>
      </form>
      <button 
        className="toggle-auth"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering 
          ? 'Already have an account? Login' 
          : 'Need an account? Register'}
      </button>
    </div>
  );
};

export default Login;
