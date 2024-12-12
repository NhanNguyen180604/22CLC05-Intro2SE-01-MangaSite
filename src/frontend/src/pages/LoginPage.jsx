import {postLogin} from '../service/userService.js';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
const LoginPage = ({setToken}) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [emailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();
  const [error, setError] = useState();
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault();
    const response = await postLogin(email, password);
    if(response?.status === 400){
      setEmailError(response.message);
      return;
    }
    if(response?.status === 401){
      setPasswordError(response.message);
      return;
    }
    if(response?.status === 402){
      setError(response.message);
      return;
    }
    setToken(response.token);
    navigate('/');
  }

  const deleteErrorState = () => {
    setEmailError(null);
    setPasswordError(null);
    setError(null);
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
            Sign in to your humble abode and continue reading.
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mb-6 mx-auto">Login</h2>

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
            {emailError && (<p className="mt-1 text-sm text-red">{emailError}</p>)}
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
              className="bg-darker-navy w-full px-4 py-2 mt-1 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange = {e=>setPassword(e.target.value)}
              required
            />
            {passwordError && (<p className="mt-1 text-sm text-red">{passwordError}</p>)}
          </div>

          {/* <div className="text-right">
            <a
              href="#"
              className="text-sm text-blue-400 hover:underline"
            >
              I forgot my password.
            </a>
          </div> */}

          <button
            type="submit"
            className="w-full py-2 px-4 text-white rounded-md shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-light-blue"
          >
            Login
          </button>
          {error && (<p className="mt-1 text-sm text-red">{error}</p>)}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            New User?{" "}
            <a href="/user/register" className="hover:underline">
              Register now!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
LoginPage.propTypes = {
  setToken:  PropTypes.func.isRequired
}
