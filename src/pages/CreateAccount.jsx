import React, { useState } from 'react'
import { FileText, User, Lock, EyeClosed, EyeIcon, Eye } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useMagicLinkStore } from '../stores/authStore'
import { signUp } from '../services/operations/authAPI'

const CreateAccount = () => {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()
    const magicLink = useMagicLinkStore((state) => state.magicLink);
    const isMagicLinkValid = useMagicLinkStore((state) => state.isMagicLinkValid);

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        if (!isMagicLinkValid()) {
            toast.error("Magic link expired or invalid. Please request a new one.", {
                style: {
                    border: '1px solid #ff0000',
                    backgroundColor: 'rgba(251, 44, 54, 0.1)',
                    color: '#fb2c36'
                }
            });

            toast("Redirecting to signup...", {
                icon: '➡️',
                duration: 5000,
                style: {
                    border: '1px solid #3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6'
                }
            });
            
            setTimeout(() => {
                navigate('/signup')
            }, 5000)
            return;
        }

        if (password !== confirmPassword) {
             toast.error("Both password should be same", {
                style: {
                    border: '1px solid #ff0000',
                    backgroundColor: 'rgba(251, 44, 54, 0.1)',
                    color: '#fb2c36'
                }
            });
            return;
        }

        await signUp(name, password, confirmPassword, navigate, magicLink);
    }

  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <Toaster 
        position='bottom-right'
        reverseOrder={false}
        />
        <div className='max-w-md w-full space-y-8'>
            <div className='text-center'>
                <div className='flex justify-center'>
                    <FileText className='h-12 w-12 text-indigo-500'/>   
                </div>
                <h2 className='mt-6 text-3xl font-bold'>Enter Account Details</h2>
                <form className='mt-8 space-y-6' onSubmit={handleCreateAccount}>
                    <div className='space-y-4'>
                        <div>
                            <label htmlFor="name" className='sr-only'>
                                Name
                            </label>
                            <div className='relative'>
                                <div className='absolute z-1 inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <User className='h-5 w-5 text-gray-400' />
                                </div>
                                <input 
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className='appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 rounded-lg bg-gray-900 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-transparent'
                                placeholder='Name' 
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className='sr-only'>
                                Password
                            </label>
                            <div className='relative'>
                                <div className='absolute z-1 inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='h-5 w-5 text-gray-400' />
                                </div>
                                <input 
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 rounded-lg bg-gray-900 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-transparent' 
                                placeholder='Password'
                                />
                                <div className='absolute z-1 inset-y-0 right-3 pl-3 flex items-center'>
                                    {showPassword ? 
                                    (<Eye className='h-5 w-5 text-gray-400' onClick={togglePasswordVisibility}/>) : 
                                    (<EyeClosed className='h-5 w-5 text-gray-400' onClick={togglePasswordVisibility}/>)
                                    }
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className='sr-only'>
                                Confirm Password
                            </label>
                            <div className='relative'>
                                <div className='absolute z-1 inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='h-5 w-5 text-gray-400' />
                                </div>
                                <input 
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className='appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-700 rounded-lg bg-gray-900 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-transparent' 
                                placeholder='Confirm Password'
                                />
                                <div className='absolute z-1 inset-y-0 right-3 pl-3 flex items-center'>
                                    {showPassword ? 
                                    (<Eye className='h-5 w-5 text-gray-400' onClick={togglePasswordVisibility}/>) : 
                                    (<EyeClosed className='h-5 w-5 text-gray-400' onClick={togglePasswordVisibility}/>)
                                    }
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}

export default CreateAccount