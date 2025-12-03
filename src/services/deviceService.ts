import axios from 'axios';

// 1. Configuração da instância do Axios
const api = axios.create({
  baseURL: 'https://briseapi.agst.com.br', // URL base da sua API
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor para adicionar o token de autenticação em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Pega o token do localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Definição do tipo de dados (Payload) para o equipamento
export interface DevicePayload {
  id?: string; // O ID é opcional, pois não existe na criação
  name: string;
  serial_number: string; // CORREÇÃO: O nome do campo na API é 'serial_number'
  type: string; // Verifique se este campo 'type' existe mesmo na API
}

// 4. Funções do CRUD para interagir com a API

/**
 * Busca a lista de todos os equipamentos.
 */
export const getDevices = async (): Promise<DevicePayload[]> => {
  try {
    const response = await api.get('/api/v1/devices/'); // CORREÇÃO: Endpoint correto
    // Garante que sempre retornamos um array, mesmo se a API retornar null, undefined ou outro formato.
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    // Em caso de erro na requisição (ex: 401, 404, 500), retorna um array vazio
    // para não quebrar a interface do usuário. O erro já foi logado no console.
    return [];
  }
};

/**
 * Busca um único equipamento pelo ID.
 */
export const getDevice = async (id: string): Promise<DevicePayload | null> => {
  try {
    const response = await api.get(`/api/v1/devices/${id}/`); // CORREÇÃO: Endpoint correto
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar o equipamento com ID ${id}:`, error);
    return null;
  }
};

/**
 * Cria um novo equipamento.
 */
export const createDevice = async (data: Omit<DevicePayload, 'id'>): Promise<DevicePayload | null> => {
  try {
    const response = await api.post('/api/v1/devices/', data); // CORREÇÃO: Endpoint correto
    return response.data;
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    return null;
  }
};

/**
 * Atualiza um equipamento existente.
 */
export const updateDevice = async (
  id: string,
  data: Partial<DevicePayload>
): Promise<DevicePayload | null> => {
  try {
    const response = await api.put(`/api/v1/devices/${id}/`, data); // CORREÇÃO: Endpoint correto
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar o equipamento com ID ${id}:`, error);
    return null;
  }
};

/**
 * Exclui um equipamento.
 */
export const deleteDevice = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/api/v1/devices/${id}/`); // CORREÇÃO: Endpoint correto
    return true;
  } catch (error) {
    console.error(`Erro ao excluir o equipamento com ID ${id}:`, error);
    return false;
  }
};