import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { register } = useAuth();

    const navigate = useNavigate()


    function submitHandler(e) {

        e.preventDefault()

        register(email, password)
            .then((res) => {
                console.log(res)
                navigate('/')
            }).catch((err) => {
                console.log(err)
            });
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Register</h2>
                    </div>

                    <form
                        onSubmit={submitHandler}
                        className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <motion.div
                                whileTap={{ scale: 0.995 }}
                                className="relative"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-200"
                                    placeholder="Enter your email"
                                    required
                                />
                            </motion.div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <motion.div
                                whileTap={{ scale: 0.995 }}
                                className="relative"
                            >
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-200"
                                    placeholder="Enter your password"
                                    required
                                />
                            </motion.div>
                        </div>



                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium shadow-lg 
                                        hover:from-blue-500 hover:to-blue-600
                                        transition-all duration-200 flex items-center justify-center`}
                        >
                            Sign In
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Register