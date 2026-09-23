import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Register } from './Register'
import logo from '../src/img/cafeli_logo_1_fondo_blanco.png'
import { API_BASE } from '../src/config'

export function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegisterOpen, setIsRegisterOpen] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg('')

        if (!email || !password) {
            setErrorMsg('Por favor, complete todos los campos.')
            return
        }

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "Error al iniciar sesión.")
            }

            // Save token and user details
            localStorage.setItem("token", data.token)
            localStorage.setItem("usuario", JSON.stringify(data.usuario))

            // Callback to update parent state
            onLoginSuccess(data.usuario)

            // Redirect based on role
            if (data.usuario.rol_nombre === "Administrador") {
                navigate("/admin")
            } else if (data.usuario.rol_nombre === "Empleado") {
                navigate("/empleado")
            } else {
                navigate("/cliente")
            }
        } catch (err) {
            setErrorMsg(err.message)
        }
    }
    
    return (
        <section id='Login' className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-left">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800">
                <div className="flex flex-col items-center">
                    <img src={logo} alt="Logo" className="h-24 w-auto object-contain mb-2" />
                    <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight my-2">
                        Iniciar Sesión
                    </h1>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
                        Inicia sesión para comenzar
                    </p>
                </div>
                
                {errorMsg && (
                    <div className="bg-red-50 text-red-800 border border-red-200 text-sm p-3 rounded-lg text-center font-medium">
                        {errorMsg}
                    </div>
                )}

                <form id='From-login' className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 text-left mb-1">
                                Correo electrónico
                            </label>
                            <input 
                                type="email" 
                                id="correo" 
                                placeholder="tu@correo.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-zinc-505 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 focus:z-10 text-sm transition-colors duration-200"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 text-left mb-1">Contraseña</label>
                        <input type="password" 
                        id="password" 
                        placeholder="Contraseña" 
                        value={password} onChange={(e) => setPassword(e.target.value)} 
                        className="appearance-none rounded-lg relative block w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-zinc-505 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 focus:z-10 text-sm transition-colors duration-200" />
                    </div>
                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 w-full py-2.5 rounded-md text-white font-semibold text-sm transition-colors duration-200" >Login</button>
                </form>
                <div className='text-center mt-4'>
                    <button 
                        type="button" 
                        onClick={() => setIsRegisterOpen(true)} 
                        className="text-sm font-medium text-amber-600 hover:text-amber-700 transition duration-200 focus:outline-none"
                    >
                        ¿No tienes cuenta? Regístrate
                    </button>
                </div>
                <div className="text-center mt-2">
                    <NavLink to="/resetpassword" className="text-sm text-gray-500 hover:text-gray-750 dark:text-zinc-400">¿Olvidaste la contraseña?</NavLink>
                </div>
            </div>

            <Register isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
        </section>
    )
}