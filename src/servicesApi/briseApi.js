// src/servicesApi/briseApi.js
import { httpRequest } from '../services/httpClient';
import { endpoints } from '../config/endpoints';

// Função para obter variáveis do dispositivo (estado, temperatura, umidade, consumo)
export async function getDeviceVariables(deviceId) {
  try {
    const data = await httpRequest(endpoints.devices.variables(deviceId));
    return data;
  } catch (error) {
    console.error('Erro ao obter variáveis do dispositivo:', error);
    throw error;
  }
}

// Função para obter configurações do dispositivo
export async function getDeviceConfigs(deviceId) {
  try {
    const data = await httpRequest(endpoints.devices.configs(deviceId));
    return data;
  } catch (error) {
    console.error('Erro ao obter configurações do dispositivo:', error);
    throw error;
  }
}

// Função para obter parametrizações do dispositivo
export async function getDeviceParameters(deviceId) {
  try {
    const data = await httpRequest(endpoints.devices.parameters(deviceId));
    return data;
  } catch (error) {
    console.error('Erro ao obter parametrizações do dispositivo:', error);
    throw error;
  }
}

// Função para definir parametrizações do dispositivo
export async function setDeviceParameters(deviceId, parameters) {
  try {
    const data = await httpRequest(endpoints.devices.parameters(deviceId), {
      method: 'PUT',
      body: JSON.stringify(parameters),
    });
    return data;
  } catch (error) {
    console.error('Erro ao definir parametrizações do dispositivo:', error);
    throw error;
  }
}

// Função para obter dispositivos do usuário
export async function getUserDevices() {
  try {
    const data = await httpRequest(endpoints.devices.list);
    return data;
  } catch (error) {
    console.error('Erro ao obter dispositivos do usuário:', error);
    throw error;
  }
}
