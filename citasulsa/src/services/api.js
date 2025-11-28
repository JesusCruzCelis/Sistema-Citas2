// Configuración base de la API
// Usar proxy de Vite para evitar problemas de CORS
const API_BASE_URL = '/api';

// Helper para manejar respuestas
const handleResponse = async (response, isLoginRequest = false) => {
  if (!response.ok) {
    // Manejo especial para errores de autenticación
    if (response.status === 401 && !isLoginRequest) {
      // Solo limpiar y redirigir si NO es una petición de login
      // (es decir, es un token expirado en una ruta protegida)
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('rol');
      localStorage.removeItem('email');
      localStorage.removeItem('nombre_completo');
      localStorage.removeItem('nombre');
      localStorage.removeItem('apellido_paterno');
      localStorage.removeItem('apellido_materno');
      localStorage.removeItem('rol_escuela');
      localStorage.removeItem('area');
      
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
      throw new Error('Tu sesión ha expirado. Serás redirigido al inicio de sesión...');
    }
    
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    
    // Si el error tiene múltiples detalles (422 de Pydantic)
    if (error.detail && Array.isArray(error.detail)) {
      const messages = error.detail.map(err => {
        const field = err.loc ? err.loc.join('.') : 'campo';
        return `${field}: ${err.msg}`;
      }).join(', ');
      throw new Error(messages);
    }
    
    // Manejar errores específicos de base de datos
    let errorMessage = error.detail || 'Error en la petición';
    
    // Error de email duplicado
    if (errorMessage.includes('duplicate key') && errorMessage.includes('Email')) {
      throw new Error('Este correo electrónico ya está registrado. Por favor usa otro correo.');
    }
    
    // Error de unicidad general
    if (errorMessage.includes('duplicate key')) {
      throw new Error('Este registro ya existe en la base de datos.');
    }
    
    // Limpiar mensajes de error muy técnicos
    if (errorMessage.includes('sqlalchemy') || errorMessage.includes('asyncpg')) {
      // Extraer solo la parte relevante del error
      if (errorMessage.includes('UniqueViolationError')) {
        throw new Error('Ya existe un registro con estos datos. Por favor verifica la información.');
      }
      throw new Error('Error al procesar la solicitud en la base de datos.');
    }
    
    throw new Error(errorMessage);
  }
  return response.json();
};

// Helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  
  // Verificar si hay token antes de hacer la petición
  if (!token) {
    console.warn('No hay token de autenticación. Redirigiendo al login...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    throw new Error('No estás autenticado. Por favor inicia sesión.');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// ==================== AUTH ====================
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response, true); // Indicar que es una petición de login
    
    // Guardar tokens y datos de usuario en localStorage
    localStorage.setItem('token', data.access_token); // ← Guardamos con el nombre 'token' para los componentes
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('email', data.email);
    
    // Guardar información adicional del usuario
    if (data.nombre_completo) {
      localStorage.setItem('nombre_completo', data.nombre_completo);
    }
    if (data.nombre) {
      localStorage.setItem('nombre', data.nombre);
    }
    if (data.apellido_paterno) {
      localStorage.setItem('apellido_paterno', data.apellido_paterno);
    }
    if (data.apellido_materno) {
      localStorage.setItem('apellido_materno', data.apellido_materno);
    }
    if (data.rol_escuela) {
      localStorage.setItem('rol_escuela', data.rol_escuela);
    }
    if (data.area) {
      localStorage.setItem('area', data.area);
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('rol');
    localStorage.removeItem('email');
    localStorage.removeItem('nombre_completo');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido_paterno');
    localStorage.removeItem('apellido_materno');
    localStorage.removeItem('rol_escuela');
    localStorage.removeItem('area');
  }
};

// ==================== USUARIOS ====================
export const usuariosAPI = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/universidad/usuarios`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Obtener usuario por ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/universidad/usuarios/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Crear usuario
  create: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/universidad/usuarios/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Actualizar usuario
  update: async (id, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/universidad/usuarios/modify/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    } catch (error) {
      // Errores de red o CORS
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo y que no haya problemas de CORS.');
      }
      throw error;
    }
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/universidad/usuarios/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== VISITANTES ====================
export const visitantesAPI = {
  // Obtener todos los visitantes
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/universidad/visitantes`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Obtener visitante por ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/universidad/visitantes/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Crear visitante
  create: async (visitanteData) => {
    const response = await fetch(`${API_BASE_URL}/universidad/visitante/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(visitanteData)
    });
    return handleResponse(response);
  },

  // Actualizar visitante
  update: async (id, visitanteData) => {
    const response = await fetch(`${API_BASE_URL}/universidad/visitantes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(visitanteData)
    });
    return handleResponse(response);
  },

  // Eliminar visitante
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/universidad/visitantes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== CITAS ====================
export const citasAPI = {
  // Obtener todas las citas
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/universidad/citas`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Obtener cita por ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/universidad/citas/detail/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Crear cita
  create: async (citaData) => {
    const response = await fetch(`${API_BASE_URL}/universidad/citas/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(citaData)
    });
    return handleResponse(response);
  },

  // Actualizar cita
  update: async (id, citaData) => {
    // Construir query params para fecha y hora
    const params = new URLSearchParams();
    if (citaData.Fecha) params.append('fecha', citaData.Fecha);
    if (citaData.Hora) params.append('hora', citaData.Hora);
    
    const response = await fetch(`${API_BASE_URL}/universidad/citas/modify/${id}?${params.toString()}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Eliminar cita
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/universidad/citas/delete?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Obtener horas ocupadas para una fecha específica
  getHorasOcupadas: async (fecha, area = null, personaVisitadaId = null) => {
    let url = `${API_BASE_URL}/universidad/citas/horas-ocupadas/${fecha}`;
    const params = new URLSearchParams();
    
    if (area) {
      params.append('area', area);
    }
    if (personaVisitadaId) {
      params.append('persona_visitada_id', personaVisitadaId);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== CARROS ====================
export const carrosAPI = {
  // Obtener todos los carros
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/universidad/carros`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Obtener carro por ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/universidad/carros/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Crear carro
  create: async (carroData) => {
    const response = await fetch(`${API_BASE_URL}/universidad/carro/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(carroData)
    });
    return handleResponse(response);
  },

  // Actualizar carro
  update: async (id, carroData) => {
    const response = await fetch(`${API_BASE_URL}/universidad/carros/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(carroData)
    });
    return handleResponse(response);
  },

  // Eliminar carro
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/universidad/carros/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== HORARIOS DE COORDINADORES ====================
export const horariosAPI = {
  // Crear horario
  create: async (horarioData) => {
    const response = await fetch(`${API_BASE_URL}/universidad/horarios/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(horarioData)
    });
    return handleResponse(response);
  },

  // Obtener horarios de un coordinador
  getByUsuario: async (usuarioId) => {
    const response = await fetch(`${API_BASE_URL}/universidad/horarios/${usuarioId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Actualizar horario
  update: async (horarioId, horarioData) => {
    const response = await fetch(`${API_BASE_URL}/universidad/horarios/modify/${horarioId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(horarioData)
    });
    return handleResponse(response);
  },

  // Eliminar horario
  delete: async (horarioId) => {
    const response = await fetch(`${API_BASE_URL}/universidad/horarios/delete/${horarioId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Verificar disponibilidad
  verificarDisponibilidad: async (usuarioId, diaSemana, hora) => {
    const response = await fetch(
      `${API_BASE_URL}/universidad/horarios/disponibilidad/${usuarioId}?dia_semana=${diaSemana}&hora=${hora}`,
      {
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  }
};

// ==================== HORARIOS DE ÁREAS ====================
export const horariosAreasAPI = {
  // Crear horario de área
  create: async (horarioData) => {
    const response = await fetch(`${API_BASE_URL}/horarios-areas/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(horarioData)
    });
    return handleResponse(response);
  },

  // Obtener todos los horarios de un área
  getByArea: async (area) => {
    const response = await fetch(`${API_BASE_URL}/horarios-areas/area/${encodeURIComponent(area)}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Obtener todos los horarios de todas las áreas
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/horarios-areas/all`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Obtener un horario por ID
  getById: async (horarioId) => {
    const response = await fetch(`${API_BASE_URL}/horarios-areas/${horarioId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Actualizar horario
  update: async (horarioId, horarioData) => {
    const response = await fetch(`${API_BASE_URL}/horarios-areas/${horarioId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(horarioData)
    });
    return handleResponse(response);
  },

  // Eliminar horario
  delete: async (horarioId) => {
    const response = await fetch(`${API_BASE_URL}/horarios-areas/${horarioId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Eliminar todos los horarios de un área
  deleteByArea: async (area) => {
    const response = await fetch(`${API_BASE_URL}/horarios-areas/area/${encodeURIComponent(area)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};


export default {
  auth: authAPI,
  usuarios: usuariosAPI,
  visitantes: visitantesAPI,
  citas: citasAPI,
  carros: carrosAPI,
  horarios: horariosAPI,
  horariosAreas: horariosAreasAPI
};
