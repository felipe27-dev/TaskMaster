// src/components/ProfilePage.jsx (Modified for username)
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Edit3, Loader, AlertCircle } from 'react-feather';
import { fetchWithAuth } from '../utils/fetchWIthAuth'; // Corrected import path

const ProfilePage = () => {
    // *** CORREÇÃO: Usar username no estado ***
    const [userData, setUserData] = useState({ username: '', email: '' });
    const [editData, setEditData] = useState({ username: '', email: '' });
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const data = await fetchWithAuth('/auth/me');
            console.log("Dados recebidos do /auth/me:", data); // Log para debug
            if (data) {
                // *** CORREÇÃO: Usar data.username ***
                setUserData({ username: data.username || '', email: data.email || '' });
                setEditData({ username: data.username || '', email: data.email || '' });
            } else {
                throw new Error("Dados do perfil não retornados ou em formato inesperado.");
            }
        } catch (err) {
            console.error("ProfilePage: Failed to fetch profile data:", err);
            setError(err.message === 'Authentication failed' ? "Sessão expirada. Faça login novamente." : "Falha ao carregar dados do perfil.");
            // *** CORREÇÃO: Limpar username ***
            setUserData({ username: '', email: '' });
            setEditData({ username: '', email: '' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        // *** CORREÇÃO: Atualizar username ou email ***
        setEditData(prev => ({ ...prev, [id]: value }));
    };

    const handleEditToggle = async () => {
        if (isEditing) {
            // --- Save Changes --- 
            setError(null);
            setSuccessMessage(null);
            setLoading(true);

            // *** CORREÇÃO: Validar username ***
            if (!editData.username || !editData.username.trim()) {
                setError("O nome de usuário não pode ficar em branco.");
                setLoading(false);
                return;
            }
            const emailRegex = /^[^"]+@[^"]+\.[a-zA-Z]{2,}$/;
            if (!editData.email || !emailRegex.test(editData.email)) {
                setError("Formato de email inválido.");
                setLoading(false);
                return;
            }

            // *** CORREÇÃO: Verificar e enviar username e/ou email ***
            const changes = {};
            if (editData.username !== userData.username) changes.username = editData.username;
            if (editData.email !== userData.email) changes.email = editData.email;

            if (Object.keys(changes).length === 0) {
                setSuccessMessage("Nenhuma alteração detectada.");
                setIsEditing(false);
                setLoading(false);
                return;
            }

            try {
                const response = await fetchWithAuth('/auth/me', {
                    method: 'PUT',
                    body: JSON.stringify(changes),
                });

                // *** CORREÇÃO: Atualizar estado com username ***
                if (response && response.user) {
                    setUserData({ username: response.user.username, email: response.user.email });
                    setSuccessMessage("Perfil atualizado com sucesso!");
                    setIsEditing(false);
                } else {
                    throw new Error("Resposta inválida ao atualizar perfil.");
                }

            } catch (err) {
                console.error("ProfilePage: Failed to update profile:", err);
                if (err.message && err.message.includes("email já está em uso")) {
                    setError("Este email já está em uso por outra conta.");
                } else if (err.message && err.message.includes("Nome de usuário já está em uso")) { // Adicionar tratamento para username
                    setError("Este nome de usuário já está em uso por outra conta.");
                } else {
                    setError(err.message === 'Authentication failed' ? "Sessão expirada. Faça login novamente." : "Falha ao salvar alterações.");
                }
            } finally {
                setLoading(false);
            }
        } else {
            // --- Enter Edit Mode --- 
            // *** CORREÇÃO: Resetar com username ***
            setEditData({ username: userData.username, email: userData.email });
            setError(null);
            setSuccessMessage(null);
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // *** CORREÇÃO: Reverter com username ***
        setEditData({ username: userData.username, email: userData.email });
        setError(null);
        setSuccessMessage(null);
    };

    if (loading && !userData.email && !error) {
        return (
            <div className="p-4 md:p-8 flex-1 bg-slate-900 text-slate-100 flex justify-center items-center min-h-screen">
                <Loader className="animate-spin text-sky-500" size={48} />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 flex-1 bg-slate-900 text-slate-100 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-100">Seu perfil</h1>
                    <label htmlFor="profile-page-toggle" className="flex items-center cursor-pointer" title="Configurações">
                        <div className="relative">
                            <input type="checkbox" id="profile-page-toggle" className="sr-only peer" />
                            <div className="block bg-gray-600 peer-checked:bg-sky-500 w-12 h-6 rounded-full transition-colors"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform peer-checked:translate-x-full"></div>
                        </div>
                    </label>
                </div>

                <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
                    <div className="mb-6 flex justify-end items-center gap-4">
                        {loading && isEditing && <Loader className="animate-spin text-sky-500" size={20} />}
                        {isEditing && (
                            <button
                                onClick={handleCancelEdit}
                                disabled={loading}
                                className="text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            onClick={handleEditToggle}
                            disabled={loading && isEditing}
                            className={`flex items-center text-sm px-3 py-1 rounded transition-colors disabled:opacity-50 ${isEditing ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'text-sky-400 hover:text-sky-300'}`}
                        >
                            <Edit3 size={16} className="mr-1" />
                            {isEditing ? (loading ? 'Salvando...' : 'Salvar Alterações') : 'Editar Perfil'}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-md flex items-center gap-2">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-900 border border-green-700 text-green-200 rounded-md flex items-center gap-2">
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* *** CORREÇÃO: Campo Username *** */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-400 mb-1">
                                Nome de Usuário:
                            </label>
                            <input
                                type="text"
                                id="username" // ID alterado para username
                                value={isEditing ? editData.username : userData.username} // Valor usa username
                                onChange={handleInputChange}
                                readOnly={!isEditing || loading}
                                className={`w-full p-3 rounded-md bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500
                                            focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all
                                            ${!isEditing ? 'cursor-default opacity-70' : ''} ${loading && isEditing ? 'opacity-50' : ''}`}
                                placeholder="Seu nome de usuário"
                            />
                        </div>

                        {/* Email (sem alterações) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1">
                                Email:
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={isEditing ? editData.email : userData.email}
                                onChange={handleInputChange}
                                readOnly={!isEditing || loading}
                                className={`w-full p-3 rounded-md bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500
                                            focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all
                                            ${!isEditing ? 'cursor-default opacity-70' : ''} ${loading && isEditing ? 'opacity-50' : ''}`}
                                placeholder="Seu email"
                            />
                        </div>

                        {/* Password Field (sem alterações funcionais) */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-1">
                                Senha:
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    readOnly={true}
                                    className={`w-full p-3 pr-10 rounded-md bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500
                                                focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all cursor-default opacity-70`}
                                    placeholder="••••••••"
                                />
                            </div>
                            <button 
                                type="button" 
                                className="mt-2 text-sm text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={true}
                            >
                                Mudar senha
                            </button>
                            <p className="text-xs text-slate-500 mt-1">A funcionalidade de mudança de senha deve ser implementada separadamente.</p>
                        </div>
                    </div>

                    {/* Google Connection Button (sem alterações) */}
                    <div className="mt-10 pt-6 border-t border-slate-700">
                        <button
                            className="w-full flex items-center justify-center gap-3 p-3 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M43.6111 20.0833H42V20H24V28H35.3028C33.6944 32.6528 29.2111 36 24 36C17.375 36 12 30.625 12 24C12 17.375 17.375 12 24 12C27.0139 12 29.7056 13.1111 31.8056 14.9L37.5833 9.125C33.9444 5.88889 29.2806 4 24 4C12.9528 4 4 12.9528 4 24C4 35.0472 12.9528 44 24 44C35.3056 44 44 35.9333 44 24C44 22.6389 43.8611 21.3333 43.6111 20.0833Z" fill="#FFC107" />
                                <path d="M43.6111 20.0833H42V20H24V28H35.3028C34.5111 30.2222 33.0139 32.0556 31.0833 33.3889L31.1222 33.5278L37.0278 38.1111C36.5 38.5278 36.0278 38.8889 36.0278 38.8889C41.0028 35.3889 44 29.8889 44 24C44 22.6389 43.8611 21.3333 43.6111 20.0833Z" fill="#FF3D00" />
                                <path d="M24 44C29.4722 44 34.0556 42.0278 37.5833 38.8889L31.0833 33.3889C29.2111 34.8889 26.7361 36 24 36C17.375 36 12 30.625 12 24C12 17.375 17.375 12 24 12C27.0139 12 29.7056 13.1111 31.8056 14.9L37.5833 9.125C33.9444 5.88889 29.2806 4 24 4C12.9528 4 4 12.9528 4 24C4 35.0472 12.9528 44 24 44Z" fill="#4CAF50" />
                                <path d="M43.6111 20.0833H24V28H35.3028C35.6944 26.7222 36 25.3333 36 24C36 22.4444 35.6944 21.0278 35.1389 19.7222L35.2417 19.5278L43.4861 19.8889C43.8611 21.3333 44 22.6389 44 24C44 24.0278 44 24.0556 44 24.0833C43.9444 22.7222 43.8056 21.3889 43.6111 20.0833Z" fill="#1976D2" />
                            </svg>
                            Conectado com o Google (Visual)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

