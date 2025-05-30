// src/utils/fetchWithAuth.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Função wrapper para a API fetch que adiciona automaticamente o token JWT
 * do localStorage ao cabeçalho Authorization e trata erros comuns.
 *
 * @param {string} endpoint O endpoint da API a ser chamado (ex: '/tasks', '/users/profile')
 * @param {object} options As opções do fetch (method, body, headers adicionais, etc.)
 * @returns {Promise<any>} Uma Promise que resolve com os dados da resposta (geralmente JSON)
 * @throws {Error} Lança um erro em caso de falha na rede, erro HTTP ou erro de autenticação (401)
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken'); // <-- Certifique-se que 'authToken' é a chave correta!
    const url = `${API_URL}${endpoint}`; // Constrói a URL completa

    // Configurações padrão dos cabeçalhos
    const defaultHeaders = {
        'Content-Type': 'application/json',
        // Adicione outros cabeçalhos padrão se necessário
    };

    // Adiciona o cabeçalho de autorização se o token existir
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Mescla os cabeçalhos padrão com os cabeçalhos fornecidos nas opções
    const requestOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers, // Permite sobrescrever cabeçalhos padrão se necessário
        },
    };

    console.log(`fetchWithAuth: ${requestOptions.method || 'GET'} ${url}`); // Log para debug

    try {
        const response = await fetch(url, requestOptions);

        // Tratamento de erro 401 (Não Autorizado)
        if (response.status === 401) {
            console.error('fetchWithAuth: Erro 401 - Não Autorizado. Token inválido ou expirado.');
            // Aqui você pode adicionar lógica para limpar o token e redirecionar para o login
            // Exemplo: localStorage.removeItem('authToken');
            // Exemplo: window.location.href = '/login'; // Ou usar o sistema de roteamento do React
            throw new Error('Authentication failed'); // Lança um erro específico
        }

        // Tratamento para outros erros HTTP
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                // Tenta obter uma mensagem de erro mais detalhada do corpo da resposta
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (jsonError) {
                // Ignora se não conseguir parsear o JSON do erro
                console.warn('fetchWithAuth: Could not parse error response body as JSON.');
            }
            console.error(`fetchWithAuth: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        // Se a resposta for OK, tenta parsear como JSON
        // Lida com respostas sem corpo (ex: 204 No Content em DELETE)
        if (response.status === 204) {
            return null; // Retorna null para indicar sucesso sem conteúdo
        }

        // Para outras respostas OK, retorna o JSON
        const data = await response.json();
        return data;

    } catch (error) {
        // Captura erros de rede ou os erros lançados acima
        console.error('fetchWithAuth: Request failed:', error);
        // Re-lança o erro para que o código que chamou a função possa tratá-lo
        throw error;
    }
};

