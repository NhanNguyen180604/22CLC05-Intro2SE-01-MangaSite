import {postRegister} from '../service/userService.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const RegisterPage = () => {
  const [email, setEmail] = useState();
  const [username, setUsername] = useState();
  const [nameError, setNameError] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [passwordError, setPasswordError] = useState();
  const [error, setError] = useState();
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault();
    if (username.trim() === ''){
      setNameError('Username cannot be filled with blank space');
      return;
    }
    if (password !== confirmPassword){
      setPasswordError(`Password confirmation doesn't match`);
      return;
    }
    const response = await postRegister(email, username, password);
    if(response?.status === 400){
      setError(response.message);
      return;
    }
    navigate('/user/login');
  }

  const deleteErrorState = () => {
    setError(null);
    setPasswordError(null);
    setNameError(null);
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-navy">
      <div className="w-full max-w-lg p-8 rounded-lg shadow-lg bg-blue">
        <div className="text-center mb-8">
          <img
            src="../assets/book_open_yoko.png"
            alt="Openbook Logo"
            className="mx-auto w-12 h-12"
          />
          <h1 className="text-2xl font-bold text-white mt-4">Openbook</h1>
          <p className="text-gray-300 mt-2">
            Join a community of manga enjoyers and writers
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mb-6 mx-auto">Register</h2>

        <form className="space-y-4" onSubmit = {handleSubmit} onFocus={deleteErrorState}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
            Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 mt-1 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-darker-navy"
              onChange = {e=>setEmail(e.target.value)}
              required
            />
            {error && (<p className="mt-1 text-sm text-red">{error}</p>)}
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
            Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-2 mt-1 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-darker-navy"
              onChange = {e=>setUsername(e.target.value)}
              required
            />
            {nameError && (<p className="mt-1 text-sm text-red">{nameError}</p>)}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 mt-1 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-darker-navy"
              onChange = {e=>setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Confirm Password
            </label>
            <input
              id="cpassword"
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-2 mt-1 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-darker-navy"
              onChange = {e=>setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && (<p className="mt-1 text-sm text-red">{passwordError}</p>)}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-light-blue text-white rounded-md shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <a href="/user/login" className="hover:underline">
              Login now!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;