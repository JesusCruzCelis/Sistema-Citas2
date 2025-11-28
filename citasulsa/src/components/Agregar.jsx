import { useState, useEffect } from "react";
import { visitantesAPI, carrosAPI, citasAPI, usuariosAPI, horariosAPI } from "../services/api";
import { showSuccess, showError, showWarning, showInfo, showLoading, closeLoading } from "../utils/alerts";

export default function Agregar({ visitantes, setVisitantes }) {
  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const getFechaHoy = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    genero: "",
    fechaNacimiento: "",
    ine: "",
    correo: "",
    celular: "",
    fechaCita: getFechaHoy(),  // Pre-seleccionar hoy por defecto
    horaCita: "",
    personaVisitar: "",  // Un solo campo de texto libre
    area: "",
    medio: "A pie",
    marca: "",
    modelo: "",
    color: "",
    placas: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitaPersonaEspecifica, setVisitaPersonaEspecifica] = useState(false);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [coordinadorSeleccionado, setCoordinadorSeleccionado] = useState(null);
  const [horariosCoordinador, setHorariosCoordinador] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [horariosUsuarioActual, setHorariosUsuarioActual] = useState([]);

  // Cargar usuario actual y sus horarios al montar el componente
  useEffect(() => {
    cargarUsuarioActual();
    cargarCoordinadores();
  }, []);

  const cargarUsuarioActual = async () => {
    try {
      // Obtener datos del usuario del localStorage
      const token = localStorage.getItem('token');
      if (token) {
        // Decodificar el token para obtener el ID del usuario
        const payload = JSON.parse(atob(token.split('.')[1]));
        const usuarioId = payload.sub;
        
        // Si el usuario es admin_escuela, cargar sus horarios
        if (payload.rol === 'admin_escuela') {
          const horarios = await horariosAPI.getByUsuario(usuarioId);
          setHorariosUsuarioActual(horarios);
          setUsuarioActual({
            id: usuarioId,
            nombre: payload.nombre,
            rol: payload.rol
          });
        }
      }
    } catch (error) {
      console.error("Error al cargar usuario actual:", error);
    }
  };

  // Cargar coordinadores al montar el componente
  const cargarCoordinadores = async () => {
    try {
      const usuarios = await usuariosAPI.getAll();
      const coords = usuarios.filter(u => u.Rol === "admin_escuela");
      setCoordinadores(coords);
    } catch (error) {
      console.error("Error al cargar coordinadores:", error);
    }
  };

  // Cargar horarios cuando se selecciona un coordinador
  useEffect(() => {
    if (coordinadorSeleccionado) {
      cargarHorariosCoordinador();
    } else {
      setHorariosCoordinador([]);
    }
  }, [coordinadorSeleccionado]);

  const cargarHorariosCoordinador = async () => {
    try {
      const horarios = await horariosAPI.getByUsuario(coordinadorSeleccionado.Id);
      setHorariosCoordinador(horarios);
    } catch (error) {
      console.error("Error al cargar horarios del coordinador:", error);
      setHorariosCoordinador([]);
    }
  };

  // Verificar si el usuario actual está disponible en una fecha y hora específicas
  const usuarioActualEstaDisponibleEnHora = (hora, fecha) => {
    if (!usuarioActual || !hora || !fecha || horariosUsuarioActual.length === 0) {
      return true; // Si no hay usuario actual o no tiene horarios, permitir
    }

    const fechaSeleccionada = new Date(fecha);
    const diaSemana = (fechaSeleccionada.getDay() + 6) % 7; // Convertir: Domingo=0 -> 6, Lunes=1 -> 0, etc.
    
    const horasCita = hora.split(':');
    const horaCitaMinutos = parseInt(horasCita[0]) * 60 + parseInt(horasCita[1]);

    // Buscar si hay un horario libre que contenga esta hora
    const horarioLibre = horariosUsuarioActual.find(horario => {
      if (horario.Dia_Semana !== diaSemana || horario.Tipo !== "libre") {
        return false;
      }

      const horaInicio = horario.Hora_Inicio.split(':');
      const horaFin = horario.Hora_Fin.split(':');
      const inicioMinutos = parseInt(horaInicio[0]) * 60 + parseInt(horaInicio[1]);
      const finMinutos = parseInt(horaFin[0]) * 60 + parseInt(horaFin[1]);

      return horaCitaMinutos >= inicioMinutos && horaCitaMinutos < finMinutos;
    });

    return !!horarioLibre;
  };

  // Verificar si el coordinador está disponible en una fecha y hora específicas
  const coordinadorEstaDisponibleEnHora = (hora, fecha) => {
    if (!coordinadorSeleccionado || !hora || !fecha || horariosCoordinador.length === 0) {
      return true; // Si no hay coordinador seleccionado o no tiene horarios, permitir
    }

    const fechaSeleccionada = new Date(fecha);
    const diaSemana = (fechaSeleccionada.getDay() + 6) % 7; // Convertir: Domingo=0 -> 6, Lunes=1 -> 0, etc.
    
    const horasCita = hora.split(':');
    const horaCitaMinutos = parseInt(horasCita[0]) * 60 + parseInt(horasCita[1]);

    // Buscar si hay un horario libre que contenga esta hora
    const horarioLibre = horariosCoordinador.find(horario => {
      if (horario.Dia_Semana !== diaSemana || horario.Tipo !== "libre") {
        return false;
      }

      const horaInicio = horario.Hora_Inicio.split(':');
      const horaFin = horario.Hora_Fin.split(':');
      const inicioMinutos = parseInt(horaInicio[0]) * 60 + parseInt(horaInicio[1]);
      const finMinutos = parseInt(horaFin[0]) * 60 + parseInt(horaFin[1]);

      return horaCitaMinutos >= inicioMinutos && horaCitaMinutos < finMinutos;
    });

    return !!horarioLibre;
  };

  // Verificar si el coordinador está disponible en la fecha y hora seleccionadas del formulario
  const coordinadorEstaDisponible = () => {
    if (!formData.fechaCita || !formData.horaCita) {
      return true;
    }
    return coordinadorEstaDisponibleEnHora(formData.horaCita, formData.fechaCita + 'T00:00:00');
  };

  // Obtener horarios libres del coordinador para el día seleccionado
  const getHorariosLibresDelDia = () => {
    if (!coordinadorSeleccionado || !formData.fechaCita || horariosCoordinador.length === 0) {
      return [];
    }

    const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
    const diaSemana = (fechaSeleccionada.getDay() + 6) % 7;

    return horariosCoordinador.filter(h => h.Dia_Semana === diaSemana && h.Tipo === "libre");
  };

  // Obtener horarios libres del usuario actual para el día seleccionado
  const getHorariosUsuarioActualDelDia = () => {
    if (!usuarioActual || !formData.fechaCita || horariosUsuarioActual.length === 0) {
      return [];
    }

    const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
    const diaSemana = (fechaSeleccionada.getDay() + 6) % 7;

    return horariosUsuarioActual.filter(h => h.Dia_Semana === diaSemana && h.Tipo === "libre");
  };

  // Generar intervalos de tiempo de 30 minutos con disponibilidad
  const generarIntervalos = () => {
    if (!formData.fechaCita) {
      return [];
    }

    const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
    const diaSemana = fechaSeleccionada.getDay();
    const diaSemanaNormalizado = (diaSemana + 6) % 7; // Convertir a formato 0=Lunes, 6=Domingo
    
    if (diaSemana === 0) {
      // Domingo - no hay horarios disponibles
      return [];
    }

    // Verificar si hay horarios registrados para este día
    let tieneHorariosDelDia = false;
    let horariosAUsar = [];
    
    // Solo usar horarios si hay un coordinador seleccionado
    // Si NO hay coordinador seleccionado, se usarán horarios generales (no de ningún coordinador)
    if (coordinadorSeleccionado && horariosCoordinador.length > 0) {
      horariosAUsar = horariosCoordinador.filter(h => h.Dia_Semana === diaSemanaNormalizado);
      tieneHorariosDelDia = horariosAUsar.length > 0;
    }

    // Definir horario por defecto según el día
    let horaInicio = 7;
    let horaFin = diaSemana === 6 ? 14 : 19; // Sábado hasta 14:00, otros días hasta 19:00

    // Si hay horarios del coordinador, usar el rango más amplio de sus horarios
    if (tieneHorariosDelDia && horariosAUsar.length > 0) {
      // Encontrar la hora más temprana y más tardía de todos los bloques
      const horasInicio = horariosAUsar.map(h => {
        const [hora] = h.Hora_Inicio.split(':').map(Number);
        return hora;
      });
      const horasFin = horariosAUsar.map(h => {
        const [hora, min] = h.Hora_Fin.split(':').map(Number);
        return hora + (min > 0 ? 1 : 0); // Redondear hacia arriba si hay minutos
      });
      
      horaInicio = Math.min(...horasInicio);
      horaFin = Math.max(...horasFin);
    }

    // Si no hay horarios registrados para este día, marcar todo como no disponible
    // Solo aplicar restricción si hay coordinador seleccionado (y no tiene horarios para ese día)
    if (coordinadorSeleccionado && !tieneHorariosDelDia) {
      const intervalos = [];
      for (let hora = horaInicio; hora < horaFin; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
          const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
          intervalos.push({
            value: horaStr,
            label: horaStr,
            disabled: true // Todo el día no disponible
          });
        }
      }
      return intervalos;
    }

    const intervalos = [];
    
    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        
        // Verificar disponibilidad según el coordinador seleccionado
        let disponible = true;
        
        // Si hay un coordinador seleccionado, usar sus horarios
        if (coordinadorSeleccionado && horariosCoordinador.length > 0) {
          disponible = coordinadorEstaDisponibleEnHora(horaStr, fechaSeleccionada);
        }
        // Si NO hay coordinador seleccionado, todas las horas del rango general están disponibles
        // (no se aplican restricciones de ningún coordinador)
        
        // Verificar si ya hay una cita en este horario
        if (disponible && horasOcupadas.includes(horaStr)) {
          disponible = false;
        }
        
        intervalos.push({
          value: horaStr,
          label: horaStr,
          disabled: !disponible
        });
      }
    }
    
    return intervalos;
  };

  // Cargar horas ocupadas cuando cambia la fecha, área o coordinador
  useEffect(() => {
    const cargarHorasOcupadas = async () => {
      if (formData.fechaCita) {
        try {
          // Filtrar por área y opcionalmente por coordinador
          const area = formData.area || null;
          const personaVisitadaId = coordinadorSeleccionado?.Id || null;
          
          const response = await citasAPI.getHorasOcupadas(
            formData.fechaCita, 
            area, 
            personaVisitadaId
          );
          setHorasOcupadas(response.horas_ocupadas || []);
        } catch (error) {
          console.error("Error al cargar horas ocupadas:", error);
          setHorasOcupadas([]);
        }
      }
    };
    
    cargarHorasOcupadas();
  }, [formData.fechaCita, formData.area, coordinadorSeleccionado]);

  // Limpiar hora seleccionada si ya no está disponible
  useEffect(() => {
    if (formData.horaCita && formData.fechaCita) {
      const intervalos = generarIntervalos();
      const intervaloSeleccionado = intervalos.find(i => i.value === formData.horaCita);
      
      // Si la hora seleccionada está deshabilitada, limpiarla
      if (intervaloSeleccionado && intervaloSeleccionado.disabled) {
        setFormData(prev => ({ ...prev, horaCita: '' }));
      }
    }
  }, [formData.fechaCita, coordinadorSeleccionado, horasOcupadas, horariosCoordinador, usuarioActual, horariosUsuarioActual]);

  // Función para verificar si una hora está ocupada (considerando 30 minutos de duración)
  const estaHoraOcupada = (hora) => {
    if (!hora || horasOcupadas.length === 0) return false;
    
    const [horaSelec, minSelec] = hora.split(':').map(Number);
    const minutosSelec = horaSelec * 60 + minSelec;
    
    return horasOcupadas.some(horaOcupada => {
      const [horaOcup, minOcup] = horaOcupada.split(':').map(Number);
      const minutosOcup = horaOcup * 60 + minOcup;
      
      // Verificar si está dentro del rango de 30 minutos (antes o después)
      const diferencia = Math.abs(minutosSelec - minutosOcup);
      return diferencia < 30;
    });
  };

  // Función para verificar si la fecha seleccionada es hoy
  const esFechaHoy = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fecha + 'T00:00:00');
    fechaSeleccionada.setHours(0, 0, 0, 0);
    return fechaSeleccionada.getTime() === hoy.getTime();
  };

  // Función para obtener mensaje dinámico de hora
  const getMensajeHora = () => {
    if (!formData.fechaCita) {
      return 'Selecciona primero una fecha';
    }
    
    const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
    const diaSemana = fechaSeleccionada.getDay();
    
    // Validar si es domingo
    if (diaSemana === 0) {
      return '❌ No se atiende los domingos';
    }
    
    // Si es hoy, agregar restricción de tiempo
    if (esFechaHoy(formData.fechaCita)) {
      const ahora = new Date();
      const horaMin = ahora.getHours();
      const minMin = ahora.getMinutes() + 30;
      const horaFinal = Math.floor(minMin / 60) + horaMin;
      const minFinal = minMin % 60;
      return `Hoy: citas después de ${horaFinal}:${minFinal.toString().padStart(2, '0')}`;
    }
    
    return 'Selecciona una hora disponible';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones en tiempo real
    let processedValue = value;
    
    // Para INE: solo números, máximo 10 dígitos
    if (name === 'ine') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Para celular: solo números, máximo 10 dígitos
    if (name === 'celular') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Para placas: sin espacios, máximo 12 caracteres, alfanumérico
    if (name === 'placas') {
      processedValue = value.replace(/\s/g, '').toUpperCase().slice(0, 12);
      // Solo permitir letras y números en placas
      processedValue = processedValue.replace(/[^A-Z0-9]/g, '');
    }
    
    // Para nombres: solo letras, espacios y tildes (sin números ni caracteres especiales)
    if (['nombre', 'apellidoPaterno', 'apellidoMaterno', 'personaVisitar'].includes(name)) {
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      // Limitar espacios consecutivos
      processedValue = processedValue.replace(/\s+/g, ' ');
      // No permitir espacios al inicio
      if (processedValue.startsWith(' ')) {
        processedValue = processedValue.trimStart();
      }
    }
    
    // Para marca, modelo y color del vehículo
    if (['marca', 'modelo', 'color'].includes(name)) {
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-]/g, '');
      processedValue = processedValue.replace(/\s+/g, ' ');
      if (processedValue.startsWith(' ')) {
        processedValue = processedValue.trimStart();
      }
    }
    
    // Para correo: no permitir espacios
    if (name === 'correo') {
      processedValue = value.replace(/\s/g, '').toLowerCase();
    }
    
    // Validación especial para hora si la fecha es hoy
    if (name === 'horaCita' && formData.fechaCita) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
      fechaSeleccionada.setHours(0, 0, 0, 0);
      
      // Si es hoy, validar que la hora sea futura
      if (fechaSeleccionada.getTime() === hoy.getTime() && value) {
        const ahora = new Date();
        const [horasCita, minutosCita] = value.split(':').map(Number);
        const minutosCitaTotal = horasCita * 60 + minutosCita;
        const minutosActualTotal = ahora.getHours() * 60 + ahora.getMinutes();
        
        // Advertencia visual si la hora es muy cercana o pasada
        if (minutosCitaTotal <= minutosActualTotal + 30) {
          // Solo mostrar advertencia, pero permitir que el usuario escriba
          console.warn('La hora debe ser al menos 30 minutos en el futuro');
        }
      }
    }
    
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!formData.nombre || !formData.apellidoPaterno || !formData.fechaCita || !formData.horaCita) {
      showWarning(
        "Por favor completa los campos obligatorios:\n• Nombre del visitante\n• Apellido paterno del visitante\n• Fecha de cita\n• Hora de cita",
        "Campos incompletos"
      );
      return;
    }

    // Validar longitud mínima de nombres
    if (formData.nombre.trim().length < 2) {
      showWarning("El nombre debe tener al menos 2 caracteres");
      return;
    }
    
    if (formData.apellidoPaterno.trim().length < 2) {
      showWarning("El apellido paterno debe tener al menos 2 caracteres");
      return;
    }
    
    if (formData.apellidoMaterno && formData.apellidoMaterno.trim().length > 0 && formData.apellidoMaterno.trim().length < 2) {
      showWarning("El apellido materno debe tener al menos 2 caracteres o dejarlo vacío");
      return;
    }

    if (!formData.area || !formData.area.trim()) {
      showWarning("Por favor selecciona el área a visitar");
      return;
    }

    // Validar que si el checkbox está marcado, se haya seleccionado un coordinador
    if (visitaPersonaEspecifica && !coordinadorSeleccionado) {
      showWarning("Por favor selecciona un coordinador o desmarca la opción de visita a persona específica");
      return;
    }

    // Validación de INE: 10 dígitos exactos (obligatorio)
    if (!formData.ine || formData.ine.length !== 10) {
      showWarning("El INE es obligatorio y debe tener exactamente 10 dígitos numéricos", "INE inválido");
      return;
    }

    // Validación de celular: 10 dígitos exactos (obligatorio)
    if (!formData.celular || formData.celular.length !== 10) {
      showWarning("El número de celular es obligatorio y debe tener exactamente 10 dígitos", "Celular inválido");
      return;
    }

    // Validar correo electrónico (obligatorio)
    if (!formData.correo || !formData.correo.trim()) {
      showWarning("El correo electrónico es obligatorio");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      showWarning("Por favor ingresa un correo electrónico válido", "Correo inválido");
      return;
    }
    
    // Validar que el dominio del correo tenga al menos 2 caracteres después del punto
    const dominioPartes = formData.correo.split('@')[1]?.split('.');
    if (!dominioPartes || dominioPartes[dominioPartes.length - 1].length < 2) {
      showWarning("El dominio del correo electrónico no es válido", "Correo inválido");
      return;
    }

        // Validar fecha de nacimiento (si se proporciona, no puede ser actual o futura)
    if (formData.fechaNacimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaNac = new Date(formData.fechaNacimiento);
      fechaNac.setHours(0, 0, 0, 0);
      
      if (fechaNac >= hoy) {
        showWarning("La fecha de nacimiento no puede ser hoy o una fecha futura", "Fecha inválida");
        return;
      }
      
      // Validar que la persona tenga al menos 1 año (evitar errores)
      const unAnoAtras = new Date();
      unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
      if (fechaNac > unAnoAtras) {
        showWarning("La fecha de nacimiento indica que la persona es menor de 1 año. Por favor verifica la fecha", "Fecha inválida");
        return;
      }

      // Validar edad mínima de 15 años para agendar cita
      const edad = hoy.getFullYear() - fechaNac.getFullYear() - 
        ((hoy.getMonth() < fechaNac.getMonth() || 
          (hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() < fechaNac.getDate())) ? 1 : 0);
      
      if (edad < 15) {
        showWarning(`El visitante debe tener al menos 15 años para poder agendar una cita. Edad actual: ${edad} años`, "Edad insuficiente");
        return;
      }
      
      // Validar que la fecha no sea demasiado antigua (mayor a 120 años)
      const cientoVeinteAnosAtras = new Date();
      cientoVeinteAnosAtras.setFullYear(cientoVeinteAnosAtras.getFullYear() - 120);
      if (fechaNac < cientoVeinteAnosAtras) {
        showWarning("La fecha de nacimiento no es válida. Por favor verifica la fecha", "Fecha inválida");
        return;
      }
    }
    
    // Validar persona a visitar si se proporciona
    if (formData.personaVisitar && formData.personaVisitar.trim().length > 0) {
      if (formData.personaVisitar.trim().length < 3) {
        showWarning("El nombre de la persona a visitar debe tener al menos 3 caracteres");
        return;
      }
      
      // Validar que contenga nombre y apellido (mínimo 2 palabras)
      const palabras = formData.personaVisitar.trim().split(/\s+/);
      if (palabras.length < 2) {
        showWarning("Por favor ingresa el nombre completo de la persona a visitar (nombre y apellido)");
        return;
      }
    }

    // Validar información de vehículo si aplica
    if (formData.medio === "En vehículo") {
      if (!formData.placas || !formData.placas.trim()) {
        showWarning("Si el visitante viene en vehículo, debes ingresar las placas del mismo.");
        return;
      }
      if (formData.placas.length < 5 || formData.placas.length > 12) {
        showWarning("Las placas deben tener entre 5 y 12 caracteres", "Placas inválidas");
        return;
      }
      
      // Validar que las placas tengan al menos una letra y un número
      const tieneLetra = /[A-Z]/.test(formData.placas);
      const tieneNumero = /[0-9]/.test(formData.placas);
      
      if (!tieneLetra || !tieneNumero) {
        showWarning("Las placas deben contener al menos una letra y un número", "Placas inválidas");
        return;
      }
    }
    
    // Validar persona a visitar si se proporciona
    if (formData.personaVisitar && formData.personaVisitar.trim().length > 0) {
      if (formData.personaVisitar.trim().length < 3) {
        showWarning("El nombre de la persona a visitar debe tener al menos 3 caracteres");
        return;
      }
      
      // Validar que tenga al menos un espacio (nombre y apellido)
      if (!formData.personaVisitar.trim().includes(' ')) {
        showWarning("Por favor ingresa el nombre completo de la persona a visitar (nombre y apellido)");
        return;
      }
    }

    // Validar que si viene en vehículo, tenga placas
    if (formData.medio === "En vehículo") {
      if (!formData.placas) {
        showWarning("Si el visitante viene en vehículo, debes ingresar las placas del mismo.");
        return;
      }
      if (formData.placas.length < 5 || formData.placas.length > 12) {
        showWarning("Las placas deben tener entre 5 y 12 caracteres");
        return;
      }
      
      // Validar que las placas tengan al menos una letra y un número
      const tieneLetra = /[A-Z]/.test(formData.placas);
      const tieneNumero = /[0-9]/.test(formData.placas);
      if (!tieneLetra || !tieneNumero) {
        showWarning("Las placas deben contener al menos una letra y un número");
        return;
      }
    }

    // Validar fecha de cita (puede ser hoy o en el futuro, pero no en el pasado)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(formData.fechaCita + 'T00:00:00');
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
      showWarning("La fecha de la cita no puede ser anterior a hoy", "Fecha inválida");
      return;
    }

    // Validar que no sea domingo
    const diaSemana = fechaSeleccionada.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    if (diaSemana === 0) {
      showWarning(
        "No se pueden agendar citas los domingos.\n\nHorario de atención:\n• Lunes a Viernes: 7:00 AM - 7:00 PM\n• Sábados: 7:00 AM - 2:00 PM",
        "Domingo no disponible"
      );
      return;
    }

    // Validar hora de la cita según el día
    const [horasCita, minutosCita] = formData.horaCita.split(':').map(Number);
    const minutosCitaTotal = horasCita * 60 + minutosCita;

    // Validación de horarios laborales según el día
    if (diaSemana >= 1 && diaSemana <= 5) {
      // Lunes a Viernes: 7:00 AM - 7:00 PM (07:00 - 19:00)
      if (horasCita < 7 || horasCita >= 19) {
        showWarning(
          "Lunes a Viernes:\n• Horario de atención: 7:00 AM - 7:00 PM\n\nPor favor selecciona una hora entre las 7:00 AM y las 7:00 PM",
          "Horario no disponible"
        );
        return;
      }
    } else if (diaSemana === 6) {
      // Sábado: 7:00 AM - 2:00 PM (07:00 - 14:00)
      if (horasCita < 7 || horasCita >= 14) {
        showWarning(
          "Sábados:\n• Horario de atención: 7:00 AM - 2:00 PM\n\nPor favor selecciona una hora entre las 7:00 AM y las 2:00 PM",
          "Horario no disponible"
        );
        return;
      }
    }

    // Validar hora de la cita si es para hoy
    if (fechaSeleccionada.getTime() === hoy.getTime()) {
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const minutoActual = ahora.getMinutes();
      const minutosActualTotal = horaActual * 60 + minutoActual;
      
      if (minutosCitaTotal <= minutosActualTotal) {
        showWarning(
          `La hora de la cita no puede ser anterior o igual a la hora actual.\nHora actual: ${horaActual}:${minutoActual.toString().padStart(2, '0')}`,
          "Hora inválida"
        );
        return;
      }
      
      // Validar que haya al menos 30 minutos de anticipación
      if (minutosCitaTotal < minutosActualTotal + 30) {
        showWarning("Por favor agenda la cita con al menos 30 minutos de anticipación desde ahora", "Anticipación requerida");
        return;
      }
    }

    // Validar que el horario no esté ocupado (considerando que cada cita dura 30 minutos)
    if (estaHoraOcupada(formData.horaCita)) {
      showWarning(
        "El horario seleccionado ya está ocupado o muy cercano a otra cita.\n\nCada cita dura aproximadamente 30 minutos.\nPor favor selecciona otro horario.",
        "Horario ocupado"
      );
      return;
    }

    // Validar disponibilidad del coordinador (si se seleccionó uno)
    if (coordinadorSeleccionado && !coordinadorEstaDisponible()) {
      const horariosLibres = getHorariosLibresDelDia();
      let mensaje = `El coordinador ${coordinadorSeleccionado.Nombre} ${coordinadorSeleccionado.Apellido_Paterno} no está disponible en este horario.\n\n`;
      
      if (horariosLibres.length > 0) {
        mensaje += "Horarios libres del coordinador hoy:\n";
        horariosLibres.forEach(h => {
          mensaje += `• ${h.Hora_Inicio.substring(0, 5)} - ${h.Hora_Fin.substring(0, 5)}`;
          if (h.Descripcion) mensaje += ` (${h.Descripcion})`;
          mensaje += "\n";
        });
      } else {
        mensaje += "El coordinador no tiene horarios libres asignados para este día.";
      }
      
      showWarning(mensaje, "Coordinador no disponible");
      return;
    }

    showLoading("Registrando cita...");
    setIsSubmitting(true);

    try {
      // 1. Crear visitante
      console.log("📝 Paso 1: Creando visitante...");
      
      // Asegurarse de que el apellido materno sea null si está vacío
      const apellidoMaternoLimpio = formData.apellidoMaterno?.trim() || null;
      
      const visitanteData = {
        Nombre: formData.nombre.trim(),
        Apellido_Paterno: formData.apellidoPaterno.trim(),
        Apellido_Materno: apellidoMaternoLimpio,
        Genero: formData.genero || "NoEspecificado",
        Fecha_Nacimiento: formData.fechaNacimiento || null,
        Ine: formData.ine?.trim() || "",
        Correo: formData.correo?.trim() || "",
        Numero: formData.celular?.trim() || "",
        Ingreso: formData.medio === "En vehículo" ? "Vehiculo" : "Pie"
      };

      console.log("📤 Datos del visitante a crear:", visitanteData);
      console.log("🔍 Apellido Materno:", apellidoMaternoLimpio, "(tipo:", typeof apellidoMaternoLimpio, ")");

      let visitanteCreado;
      try {
        visitanteCreado = await visitantesAPI.create(visitanteData);
        console.log("✅ Visitante creado exitosamente:", visitanteCreado);
      } catch (errorVisitante) {
        console.error("❌ Error al crear visitante:", errorVisitante);
        
        // Si el error es por correo duplicado, es posible que el visitante ya exista
        if (errorVisitante.message.includes("correo") || errorVisitante.message.includes("email")) {
          throw new Error("El correo electrónico ya está registrado. Si ya tienes una cuenta, verifica tus datos.");
        }
        
        throw new Error(`Error al crear visitante: ${errorVisitante.message}`);
      }

      // Esperar un momento para asegurar que la base de datos procese el visitante
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Si viene en vehículo, crear el carro
      if (formData.medio === "En vehículo" && formData.placas) {
        console.log("🚗 Paso 2: Creando vehículo...");
        const carroData = {
          marca: formData.marca?.trim() || "NoEspecificada",
          modelo: formData.modelo?.trim() || "NoEspecificado",
          color: formData.color?.trim() || "NoEspecificado",
          placas: formData.placas.trim()
        };

        try {
          await carrosAPI.create(carroData);
          console.log("✅ Carro creado exitosamente");
        } catch (errorCarro) {
          console.error("❌ Error al crear carro:", errorCarro);
          // Si falla el carro, continuamos pero notificamos
          console.warn("⚠️ Continuando con la creación de la cita sin vehículo");
        }
      }

      // 3. Crear la cita
      console.log("📅 Paso 3: Creando cita...");
      
      // Preparar datos - asegurarse de que apellido materno sea null si está vacío
      const apellidoMaternoParaCita = formData.apellidoMaterno?.trim() || null;
      
      // Nota: El personal visitado es OPCIONAL y no necesita estar registrado en el sistema
      const citaData = {
        Nombre_Persona_Visitada: formData.personaVisitar?.trim() || null,
        Usuario_Visitado: coordinadorSeleccionado?.Id || null,  // UUID del coordinador
        Nombre_Visitante: formData.nombre.trim(),
        Apellido_Paterno_Visitante: formData.apellidoPaterno.trim(),
        Apellido_Materno_Visitante: apellidoMaternoParaCita,
        Placas: (formData.medio === "En vehículo" && formData.placas) ? formData.placas.trim() : null,
        Fecha: formData.fechaCita,
        Hora: formData.horaCita,
        Area: formData.area
      };

      console.log("📤 Datos de la cita a enviar:", citaData);
      console.log("🔍 Verificación de datos:");
      console.log("   - Nombre:", citaData.Nombre_Visitante);
      console.log("   - Apellido Paterno:", citaData.Apellido_Paterno_Visitante);
      console.log("   - Apellido Materno:", citaData.Apellido_Materno_Visitante, "(tipo:", typeof citaData.Apellido_Materno_Visitante, ")");
      console.log("   - Coordinador UUID:", citaData.Usuario_Visitado);

      try {
        await citasAPI.create(citaData);
        console.log("✅ Cita creada exitosamente");
      } catch (errorCita) {
        console.error("❌ Error al crear cita:", errorCita);
        throw new Error(`Error al crear la cita: ${errorCita.message}`);
      }

      // Actualizar el estado local si es necesario
      const nuevoRegistro = { ...formData, id: Date.now() };
      const nuevosVisitantes = [...visitantes, nuevoRegistro];
      setVisitantes(nuevosVisitantes);
      localStorage.setItem("visitas", JSON.stringify(nuevosVisitantes));

      closeLoading();
      await showSuccess(
        `La cita ha sido registrada exitosamente para ${formData.nombre} ${formData.apellidoPaterno}. Recibirás un correo de confirmación.`,
        "¡Cita registrada!"
      );

      // Limpiar formulario
      setFormData({
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        genero: "",
        fechaNacimiento: "",
        ine: "",
        correo: "",
        celular: "",
        fechaCita: getFechaHoy(),  // Volver a poner fecha de hoy
        horaCita: "",
        personaVisitar: "",
        area: "",
        medio: "A pie",
        marca: "",
        modelo: "",
        color: "",
        placas: "",
      });
      setVisitaPersonaEspecifica(false);
      setCoordinadorSeleccionado(null);  // Limpiar coordinador seleccionado
      setHorariosCoordinador([]);  // Limpiar horarios del coordinador
    } catch (error) {
      console.error("❌ Error al registrar la cita:", error);
      console.error("📋 Stack trace:", error.stack);
      closeLoading();
      
      // Mensajes de error más amigables
      let errorMessage = error.message;
      let errorTitle = "Error al registrar cita";
      
      // Error de visitante
      if (errorMessage.includes("Error al crear visitante")) {
        showError(errorMessage, "Error con datos del visitante");
        return;
      }
      // Error de edad mínima
      else if (errorMessage.includes("debe tener al menos 15 años")) {
        showError(errorMessage, "Edad insuficiente");
        return;
      }
      // Error de correo duplicado
      else if (errorMessage.includes("correo") && errorMessage.includes("registrado")) {
        showError(errorMessage, "Correo duplicado");
        return;
      }
      // Error de personal del sistema no encontrado
      else if (errorMessage.includes("Personal del sistema no encontrado") || 
          errorMessage.includes("Usuario no encontrado")) {
        errorMessage = `Error al procesar la información de la persona a visitar. Por favor intenta de nuevo.`;
      }
      // Error de visitante no encontrado (problema de sincronización)
      else if (errorMessage.includes("Visitante no encontrado")) {
        showError(
          "Hubo un problema al registrar los datos del visitante.\n\n" +
          "Posibles causas:\n" +
          "• Los datos no coinciden exactamente\n" +
          "• Problema de conexión con el servidor\n" +
          "• El visitante ya existe con datos diferentes\n\n" +
          "Por favor, verifica los datos e intenta nuevamente.",
          "Error de registro"
        );
        return;
      }
      // Error de cita duplicada por email
      else if (errorMessage.includes("Ya existe una cita registrada") || 
               errorMessage.includes("mismo email") || 
               errorMessage.includes("mismo correo")) {
        showError(errorMessage, "Cita duplicada");
        return;
      }
      // Error de horario ocupado
      else if (errorMessage.includes("horario") && 
               (errorMessage.includes("ocupado") || errorMessage.includes("conflicto"))) {
        showError(errorMessage, "Horario no disponible");
        return;
      }
      // Error de campos requeridos
      else if (errorMessage.includes("Field required")) {
        errorMessage = "Por favor, completa todos los campos obligatorios del formulario.";
        errorTitle = "Campos incompletos";
      }
      // Error de validación
      else if (errorMessage.includes("Value error")) {
        const errorDetail = errorMessage.split("Value error,")[1] || errorMessage;
        if (errorDetail.includes("INE")) {
          errorMessage = "El INE debe tener exactamente 10 dígitos numéricos";
        } else if (errorDetail.includes("número telefónico")) {
          errorMessage = "El número de celular debe tener exactamente 10 dígitos";
        } else if (errorDetail.includes("espacios")) {
          errorMessage = `Hay campos que no deben contener espacios en blanco`;
        } else {
          errorMessage = `${errorDetail.trim()}`;
        }
        errorTitle = "Error de validación";
      }
      // Error de autenticación
      else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || 
               errorMessage.includes("sesión ha expirado") || errorMessage.includes("Token expirado")) {
        errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.\n\nSerás redirigido al inicio de sesión en un momento...";
        errorTitle = "Sesión expirada";
      }
      // Error de permisos
      else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        errorMessage = "No tienes permisos para realizar esta acción.";
        errorTitle = "Acceso denegado";
      }
      // Error de conexión
      else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network")) {
        errorMessage = "No se puede conectar con el servidor. Verifica que el backend esté corriendo.";
        errorTitle = "Error de conexión";
      }
      
      showError(errorMessage, errorTitle);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8 mt-6 space-y-6"
      >
        {/* --- DATOS PERSONALES --- */}
        <section>
          <h2 className="text-xl  text-gray-800 border-b pb-2 mb-4 font-[Mitr]">
            Datos personales de la visita
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre(s) *"
              value={formData.nombre}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />

            <input
              type="text"
              name="apellidoPaterno"
              placeholder="Apellido Paterno *"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />

            <input
              type="text"
              name="apellidoMaterno"
              placeholder="Apellido Materno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            />

            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
            >
              <option value="">Género</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>

            <div>
              <label className="block text-sm text-gray-600">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                title="El visitante debe tener al menos 15 años"
              />
              <p className="text-xs text-gray-500 mt-1">El visitante debe tener al menos 15 años</p>
            </div>

            <input
              type="text"
              name="ine"
              placeholder="INE (10 dígitos) *"
              value={formData.ine}
              onChange={handleChange}
              maxLength={10}
              pattern="\d{10}"
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />

            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico *"
              value={formData.correo}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />

            <input
              type="tel"
              name="celular"
              placeholder="Celular (10 dígitos) *"
              value={formData.celular}
              onChange={handleChange}
              maxLength={10}
              pattern="\d{10}"
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            />
          </div>
        </section>

        {/* --- DATOS DE LA CITA --- */}
        <section>
          <h2 className="text-xl text-gray-800 border-b pb-2 mb-4 font-[Mitr]">
            Datos de la cita
          </h2>
          
          {/* 1. ÁREA A VISITAR - PRIMERO */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Área a visitar <span className="text-red-500">*</span>
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
              required
            >
              <option value="">Selecciona el área a visitar</option>
              
              <optgroup label="📚 Áreas Académicas">
                <option value="Arquitectura y Diseño">Arquitectura y Diseño</option>
                <option value="Ciencias Sociales y Humanidades">Ciencias Sociales y Humanidades</option>
                <option value="Negocios y Economía">Negocios y Economía</option>
                <option value="Ciencias de la Salud">Ciencias de la Salud</option>
                <option value="Turismo y Gastronomía">Turismo y Gastronomía</option>
                <option value="Ingenierías">Ingenierías</option>
              </optgroup>
              
              <optgroup label="🏗️ Instalaciones Académicas">
                <option value="Laboratorios">Laboratorios</option>
                <option value="Talleres">Talleres</option>
                <option value="Biblioteca">Biblioteca</option>
              </optgroup>
              
              <optgroup label="👩🏻‍💼 Servicios Administrativos">
                <option value="Rectoría">Rectoría</option>
                <option value="Control Escolar">Control Escolar</option>
                <option value="Servicios Escolares">Servicios Escolares</option>
                <option value="Admisiones">Admisiones</option>
                <option value="Caja / Pagos">Caja / Pagos</option>
              </optgroup>
              
              <optgroup label="⚽️ Servicios Generales">
                <option value="Cafetería">Cafetería</option>
                <option value="Instalaciones Deportivas">Instalaciones Deportivas</option>
                <option value="Áreas Comunes">Áreas Comunes</option>
              </optgroup>
              
              <optgroup label="➕ Otro">
                <option value="Otra área">Otra área</option>
              </optgroup>
            </select>
            <p className="text-xs text-blue-600 mt-1">
              <span className="font-medium">💡 Importante:</span> Selecciona primero el área para ver las horas disponibles
            </p>
          </div>
          
          {/* 2. CHECKBOX DE PERSONA ESPECÍFICA - AHORA SEGUNDO */}
          <div className="mb-4 bg-blue-50 p-4 rounded-md border border-blue-200">
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                checked={visitaPersonaEspecifica}
                onChange={(e) => {
                  setVisitaPersonaEspecifica(e.target.checked);
                  if (!e.target.checked) {
                    setFormData({ ...formData, personaVisitar: "" });
                    setCoordinadorSeleccionado(null);
                  }
                }}
                className="w-4 h-4 text-[#1a237e] focus:ring-[#1a237e]"
              />
              <span className="text-sm font-medium text-blue-800">
                ¿Deseas visitar a una persona en específico? (Opcional)
              </span>
            </label>
            
            {visitaPersonaEspecifica && (
              <div className="space-y-3">
                <p className="text-xs text-blue-600 mb-2">
                  💡 Selecciona un coordinador para aplicar su horario específico.
                </p>
                
                {/* Selector de coordinadores */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1 font-semibold">
                    Coordinador
                  </label>
                  <select
                    value={coordinadorSeleccionado?.Id || ""}
                    onChange={(e) => {
                      const coord = coordinadores.find(c => c.Id === e.target.value);
                      setCoordinadorSeleccionado(coord);
                      if (coord) {
                        setFormData({
                          ...formData,
                          personaVisitar: `${coord.Nombre} ${coord.Apellido_Paterno} ${coord.Apellido_Materno}`.trim()
                        });
                      } else {
                        setFormData({ ...formData, personaVisitar: "" });
                      }
                    }}
                    className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                    required={visitaPersonaEspecifica}
                  >
                    <option value="">-- Seleccionar coordinador --</option>
                    {coordinadores.map(coord => (
                      <option key={coord.Id} value={coord.Id}>
                        {coord.Nombre} {coord.Apellido_Paterno} {coord.Apellido_Materno} - {coord.Area}
                      </option>
                    ))}
                  </select>
                </div>

                {coordinadorSeleccionado && horariosCoordinador.length === 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                    <p className="text-xs text-orange-700">
                      ⚠️ Este coordinador no tiene horarios asignados. Se usarán horarios generales.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Información de horarios */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">📅 Horario de atención:</p>
            
            {/* Mostrar horario del coordinador SELECCIONADO si existe */}
            {coordinadorSeleccionado && horariosCoordinador.length > 0 && formData.fechaCita ? (
              <div className="text-xs text-blue-800 space-y-2">
                <p className="font-semibold text-purple-900">
                  👤 Horario del coordinador: {coordinadorSeleccionado.Nombre} {coordinadorSeleccionado.Apellido_Paterno}
                </p>
                {getHorariosLibresDelDia().length > 0 ? (
                  <div>
                    <p className="font-medium text-green-700 mb-1">🟢 Horarios disponibles hoy:</p>
                    {getHorariosLibresDelDia().map((h, idx) => (
                      <p key={idx} className="ml-3">
                        • {h.Hora_Inicio.substring(0, 5)} - {h.Hora_Fin.substring(0, 5)}
                        {h.Descripcion && ` (${h.Descripcion})`}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-red-700 font-semibold">🚫 Día no disponible</p>
                    <p className="text-red-600 mt-1">El coordinador no tiene horarios registrados para este día.</p>
                  </div>
                )}
              </div>
            ) : usuarioActual && horariosUsuarioActual.length > 0 && formData.fechaCita && !coordinadorSeleccionado ? (
              <div className="text-xs text-blue-800 space-y-2">
                <p className="font-semibold text-blue-900">
                  👤 Tu horario como coordinador
                </p>
                {getHorariosUsuarioActualDelDia().length > 0 ? (
                  <div>
                    <p className="font-medium text-green-700 mb-1">🟢 Horarios disponibles hoy:</p>
                    {getHorariosUsuarioActualDelDia().map((h, idx) => (
                      <p key={idx} className="ml-3">
                        • {h.Hora_Inicio.substring(0, 5)} - {h.Hora_Fin.substring(0, 5)}
                        {h.Descripcion && ` (${h.Descripcion})`}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-red-700 font-semibold">🚫 Día no disponible</p>
                    <p className="text-red-600 mt-1">No tienes horarios registrados para este día. Todas las horas estarán bloqueadas.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-blue-800 space-y-1">
                <p>• <span className="font-medium">Lunes a Viernes:</span> 7:00 AM - 7:00 PM</p>
                <p>• <span className="font-medium">Sábados:</span> 7:00 AM - 2:00 PM</p>
                <p>• <span className="font-medium text-red-600">Domingos:</span> Cerrado</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Fecha de la cita <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fechaCita"
                value={formData.fechaCita}
                onChange={handleChange}
                min={getFechaHoy()}
                className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                required
              />
              <p className="text-xs text-blue-600 mt-1">
                Selecciona la fecha de la visita
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Hora de la cita <span className="text-red-500">*</span>
              </label>
              <select
                name="horaCita"
                value={formData.horaCita}
                onChange={handleChange}
                className={`border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e] ${
                  estaHoraOcupada(formData.horaCita) ? 'border-red-500 bg-red-50' : ''
                }`}
                required
                disabled={formData.fechaCita && new Date(formData.fechaCita + 'T00:00:00').getDay() === 0}
              >
                <option value="">Selecciona una hora</option>
                {generarIntervalos().map((intervalo) => (
                  <option 
                    key={intervalo.value} 
                    value={intervalo.value}
                    disabled={intervalo.disabled}
                    className={intervalo.disabled ? 'text-gray-400 bg-gray-100' : ''}
                  >
                    {intervalo.label} {intervalo.disabled ? '(No disponible)' : ''}
                  </option>
                ))}
              </select>
              <p className={`text-xs mt-1 font-medium ${
                formData.fechaCita && new Date(formData.fechaCita + 'T00:00:00').getDay() === 0 
                  ? 'text-red-600' 
                  : esFechaHoy(formData.fechaCita) 
                    ? 'text-orange-600' 
                    : 'text-blue-600'
              }`}>
                {getMensajeHora()}
              </p>
              
              {/* Mostrar info sobre filtrado de horas */}
              {formData.area && formData.fechaCita && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Mostrando solo horas disponibles en "{formData.area}"
                  {coordinadorSeleccionado && ` con ${coordinadorSeleccionado.Nombre}`}
                </p>
              )}
              
              {/* Advertencia cuando todas las horas están bloqueadas */}
              {formData.fechaCita && generarIntervalos().length > 0 && generarIntervalos().every(i => i.disabled) && (
                <div className="mt-2 bg-red-50 border border-red-300 rounded p-2">
                  <p className="text-xs text-red-700 font-semibold">🚫 Día no disponible</p>
                  <p className="text-xs text-red-600 mt-1">
                    No hay horarios registrados para este día. Por favor selecciona otra fecha o contacta al coordinador.
                  </p>
                </div>
              )}
              
              {estaHoraOcupada(formData.horaCita) && (
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  ⚠️ Este horario está ocupado. Cada cita dura 30 minutos.
                </p>
              )}
              {horasOcupadas.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-semibold">Horarios ocupados hoy:</span> {horasOcupadas.join(', ')}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* --- MEDIO DE INGRESO --- */}
        <section>
          <h2 className="text-xl  text-gray-800 border-b pb-2 mb-4 font-[Mitr]">
            Medio de ingreso
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="medio"
                  value="A pie"
                  checked={formData.medio === "A pie"}
                  onChange={handleChange}
                />
                <span>A pie</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="medio"
                  value="En vehículo"
                  checked={formData.medio === "En vehículo"}
                  onChange={handleChange}
                />
                <span>En vehículo</span>
              </label>
            </div>

            {formData.medio === "En vehículo" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  name="marca"
                  placeholder="Marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                />
                <input
                  type="text"
                  name="modelo"
                  placeholder="Modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                />
                <input
                  type="text"
                  name="color"
                  placeholder="Color"
                  value={formData.color}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                />
                <div>
                  <input
                    type="text"
                    name="placas"
                    placeholder="Placas (ej: ABC1234) *"
                    value={formData.placas}
                    onChange={handleChange}
                    maxLength={12}
                    className="border rounded-md px-3 py-2 w-full focus:ring-[#1a237e] focus:border-[#1a237e]"
                    required={formData.medio === "En vehículo"}
                  />
                  <p className="text-xs text-gray-500 mt-1">5-12 caracteres alfanuméricos</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- BOTÓN DE ENVÍO --- */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-[#1a237e] text-white px-6 py-2 rounded-md hover:bg-[#303f9f] transition font-[Mitr] ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
