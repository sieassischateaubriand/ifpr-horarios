import api from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Obter perfil
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Atualizar perfil
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Alterar senha
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Registrar usuário (apenas para desenvolvimento)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

