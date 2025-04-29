import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { login, register } from '../services/auth';
import { fetchUserProfile } from '../services/api';

function AuthForm() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // ✅ Detect ?confirmed=true from email confirmation redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("confirmed") === "true") {
      setMessage("✅ Your email has been confirmed. You can now log in.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data;
      if (isLogin) {
        // 🔑 Login
        data = await login(email, password);

        if (!data.token) {
          throw new Error("Missing token after login.");
        }

        localStorage.setItem('token', data.token);
        window.location.href = "/";
      } else {
        // 🔐 Register
        data = await register(pseudo, email, password);

        setMessage("✅ Registration successful! Check your email to confirm your account.");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg mt-12">
      <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
        {isLogin ? 'Login' : 'Register'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className={`w-full ${
            isLogin ? "bg-cyan-500 hover:bg-cyan-600" : "bg-red-500 hover:bg-red-600"
          } text-white font-bold py-3 rounded transition`}
        >
          {isLogin ? 'Log In' : "Sign Up"}
        </button>

        {isLogin && (
          <div className="text-center mt-4">
            <a
              href="/forgot-password"
              className="text-cyan-400 hover:text-cyan-300 transition font-semibold"
            >
              Forgot your password?
            </a>
          </div>
        )}
      </form>

      {message && (
        <p className="mt-4 text-center text-cyan-300 font-semibold">{message}</p>
      )}
    </div>
  );
}

export default AuthForm;
