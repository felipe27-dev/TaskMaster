// src/components/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Importar axios para requisições HTTP
import meuIcone from '../assets/taskmaster_logo_lateral-nobg.png';
import meuIcone2 from '../assets/taskmaster_logo_monochrome-nobg.png';
import loginVideo from '../assets/logo_animation.mp4';
import { Eye, EyeOff, ArrowLeft } from 'react-feather';
import PrototypeAlert from "./PrototypeAlert";

// Definir a URL base da API (ajuste conforme necessário, pode vir de .env)
const API_BASE_URL = import.meta.env.VITE_API_URL; 

const LoginPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('initial'); // 'initial', 'form', 'video'
    const [isLoginTab, setIsLoginTab] = useState(true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Renomeado de fullName para username
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState(null); // Estado para mensagens de erro da API
    const [loading, setLoading] = useState(false); // Estado para indicar carregamento

    const handleInitialLoginClick = () => {
        setIsLoginTab(true);
        setViewMode('form');
        setError(null); // Limpa erros ao mudar de aba/modo
    };

    const handleInitialSignUpClick = () => {
        setIsLoginTab(false);
        setViewMode('form');
        setError(null); // Limpa erros ao mudar de aba/modo
    };

    const handleFormSubmitLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });
            console.log('Login response:', response.data);
            // Armazenar o token JWT no localStorage
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userData', JSON.stringify(response.data.user)); // Armazena dados do usuário

            setViewMode('video'); // Vai para a animação antes de redirecionar
        } catch (err) {
            console.error('Erro no login:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Erro ao tentar fazer login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmitSignUp = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("As senhas não coincidem!");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                username, // Usar 'username' conforme o backend espera
                email,
                password,
            });
            console.log('Registro response:', response.data);
            // Após registro bem-sucedido, pode redirecionar para login ou mostrar mensagem
            alert("Registro realizado com sucesso! Faça o login para continuar.");
            setIsLoginTab(true); // Muda para a aba de login
            // Limpa campos de registro
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

        } catch (err) {
            console.error('Erro no registro:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Erro ao tentar registrar. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleVideoEnd = () => {
        navigate("/app"); // Redireciona para a aplicação principal após o vídeo
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const activeTabClass = 'bg-[#e9546b] text-white';
    const inactiveTabClass = 'bg-gray-200 hover:bg-gray-300 text-gray-700';

    if (viewMode === 'video') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <video
                    src={loginVideo}
                    autoPlay
                    muted // Adicionado para evitar problemas com autoplay em alguns navegadores
                    onEnded={handleVideoEnd}
                    className="w-80 h-auto rounded-xl shadow-lg"
                />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#D8432D] via-[#7A1B5E] to-[#3F0C56] min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md text-center glow-border">

                {viewMode === 'initial' && (
                    <>
                        <h1 className="text-2xl font-semibold mb-4 text-gray-700">Bem-vindo ao</h1>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <img src={meuIcone} alt="Logo TaskMaster" className="h-20" />
                            {/* <span className="text-xl font-bold text-gray-800">TaskMaster</span> */}
                        </div>
                        <p className="text-gray-600 mb-8">
                            O seu aplicativo de gerenciamento de tarefas
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleInitialLoginClick}
                                className="bg-[#e9546b] hover:bg-[#d6445b] shadow-xl text-white font-medium py-2.5 px-4 rounded-full transition"
                            >
                                Logar-se
                            </button>
                            <button
                                onClick={handleInitialSignUpClick}
                                className="bg-[#f28c38] hover:bg-[#e07c2d] shadow-xl text-white font-medium py-2.5 px-4 rounded-full transition"
                            >
                                Registrar-se
                            </button>
                            <button
                                onClick={() => navigate('/about-us')}
                                className="bg-[#ef7d42] hover:bg-[#dc7039] shadow-xl text-white font-medium py-2.5 px-4 rounded-full transition flex items-center justify-center gap-2">
                                <span className="text-white">❓</span>
                                Sobre nós
                            </button>
                        </div>
                    </>
                )}

                {viewMode === 'form' && (
                    <>
                        <button
                            onClick={() => {
                                setViewMode('initial');
                                setEmail('');
                                setPassword('');
                                setUsername('');
                                setConfirmPassword('');
                                setError(null);
                            }}
                            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Voltar"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <div className="flex mt-8 mb-5 rounded-lg overflow-hidden border border-gray-300">
                            <button
                                onClick={() => { setIsLoginTab(false); setError(null); }}
                                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${!isLoginTab ? activeTabClass + ' focus:ring-red-400' : inactiveTabClass + ' focus:ring-gray-400'}`}
                            >
                                Registrar-se
                            </button>
                            <button
                                onClick={() => { setIsLoginTab(true); setError(null); }}
                                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${isLoginTab ? activeTabClass + ' focus:ring-red-400' : inactiveTabClass + ' focus:ring-gray-400'}`}
                            >
                                Logar-se
                            </button>
                        </div>

                        <h2 className="text-xl font-semibold text-center text-gray-700 mb-5">
                            {isLoginTab ? 'Fazer o login' : 'Fazer registro'}
                        </h2>
                        {/* Botão Google - Mantido com alerta por enquanto */}
                        <button
                            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 mb-5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                            onClick={() => setShowAlert(true)}
                            disabled={loading} // Desabilita durante carregamento
                        >
                            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M43.6111 20.0833H42V20H24V28H35.3028C33.6944 32.6528 29.2111 36 24 36C17.375 36 12 30.625 12 24C12 17.375 17.375 12 24 12C27.0139 12 29.7056 13.1111 31.8056 14.9L37.5833 9.125C33.9444 5.88889 29.2806 4 24 4C12.9528 4 4 12.9528 4 24C4 35.0472 12.9528 44 24 44C35.3056 44 44 35.9333 44 24C44 22.6389 43.8611 21.3333 43.6111 20.0833Z" fill="#FFC107" /><path d="M43.6111 20.0833H42V20H24V28H35.3028C34.5111 30.2222 33.0139 32.0556 31.0833 33.3889L31.1222 33.5278L37.0278 38.1111C36.5 38.5278 36.0278 38.8889 36.0278 38.8889C41.0028 35.3889 44 29.8889 44 24C44 22.6389 43.8611 21.3333 43.6111 20.0833Z" fill="#FF3D00" /><path d="M24 44C29.4722 44 34.0556 42.0278 37.5833 38.8889L31.0833 33.3889C29.2111 34.8889 26.7361 36 24 36C17.375 36 12 30.625 12 24C12 17.375 17.375 12 24 12C27.0139 12 29.7056 13.1111 31.8056 14.9L37.5833 9.125C33.9444 5.88889 29.2806 4 24 4C12.9528 4 4 12.9528 4 24C4 35.0472 12.9528 44 24 44Z" fill="#4CAF50" /><path d="M43.6111 20.0833H24V28H35.3028C35.6944 26.7222 36 25.3333 36 24C36 22.4444 35.6944 21.0278 35.1389 19.7222L35.2417 19.5278L43.4861 19.8889C43.8611 21.3333 44 22.6389 44 24C44 24.0278 44 24.0556 44 24.0833C43.9444 22.7222 43.8056 21.3889 43.6111 20.0833Z" fill="#1976D2" /></svg>
                            {isLoginTab ? 'Fazer login com o Google' : 'Fazer registro com o Google'}
                        </button>
                        <PrototypeAlert isOpen={showAlert} onClose={() => setShowAlert(false)} />

                        <div className="flex items-center my-5">
                            <hr className="flex-grow border-t border-gray-300" />
                            <span className="mx-3 text-xs text-gray-500">OU</span>
                            <hr className="flex-grow border-t border-gray-300" />
                        </div>

                        {/* Exibir mensagem de erro */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <form onSubmit={isLoginTab ? handleFormSubmitLogin : handleFormSubmitSignUp} className="space-y-4 text-left">
                            {!isLoginTab && (
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                                        Nome de Usuário: <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required
                                        className="w-full p-2.5 rounded-md border border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#e9546b] focus:border-[#e9546b] outline-none"
                                        placeholder="Seu nome de usuário"
                                        disabled={loading}
                                    />
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                                    Email: <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    className="w-full p-2.5 rounded-md border border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#e9546b] focus:border-[#e9546b] outline-none"
                                    placeholder="seuemail@example.com"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                                    Senha: <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                        className="w-full p-2.5 pr-10 rounded-md border border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#e9546b] focus:border-[#e9546b] outline-none"
                                        placeholder="Sua senha (mín. 6 caracteres)"
                                        disabled={loading}
                                    />
                                    <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" disabled={loading}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {!isLoginTab && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                                        Confirme sua senha: <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                                            className="w-full p-2.5 pr-10 rounded-md border border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#e9546b] focus:border-[#e9546b] outline-none"
                                            placeholder="Confirme sua senha"
                                            disabled={loading}
                                        />
                                        <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" disabled={loading}>
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <button
                                type="submit"
                                className={`w-full bg-[#e9546b] hover:bg-[#d6445b] text-white font-semibold py-2.5 px-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#e9546b] focus:ring-offset-2 focus:ring-offset-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Processando...' : (isLoginTab ? 'Logar-se' : 'Registrar-se')}
                            </button>
                        </form>
                        {isLoginTab && (
                            <div className="text-center mt-5">
                                {/* Link de "Esqueceu a senha" - funcionalidade futura */} 
                                <a href="#" onClick={(e) => { e.preventDefault(); alert('Funcionalidade ainda não implementada.'); }} className="text-sm text-[#e9546b] hover:text-[#d6445b] hover:underline">Esqueceu sua senha?</a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;

