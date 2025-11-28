import Swal from 'sweetalert2';

/**
 * Configuración de colores personalizada para coincidir con el tema de la universidad
 */
const customColors = {
  primary: '#1a237e',      // Azul universitario
  success: '#10b981',      // Verde
  error: '#ef4444',        // Rojo
  warning: '#f59e0b',      // Amarillo/Naranja
  info: '#3b82f6',         // Azul claro
};

/**
 * Alerta de éxito
 */
export const showSuccess = (message, title = '¡Éxito!') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: customColors.success,
    confirmButtonText: 'Aceptar',
    timer: 3000,
    timerProgressBar: true,
  });
};

/**
 * Alerta de error
 */
export const showError = (message, title = 'Error') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: customColors.error,
    confirmButtonText: 'Entendido',
  });
};

/**
 * Alerta de advertencia
 */
export const showWarning = (message, title = '¡Atención!') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonColor: customColors.warning,
    confirmButtonText: 'Entendido',
  });
};

/**
 * Alerta de información
 */
export const showInfo = (message, title = 'Información') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonColor: customColors.info,
    confirmButtonText: 'Aceptar',
  });
};

/**
 * Alerta de confirmación (con botones Sí/No)
 */
export const showConfirm = (message, title = '¿Estás seguro?') => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: customColors.primary,
    cancelButtonColor: customColors.error,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
  });
};

/**
 * Alerta de confirmación para eliminación
 */
export const showDeleteConfirm = (itemName = 'este elemento') => {
  return Swal.fire({
    icon: 'warning',
    title: '¿Eliminar?',
    html: `¿Estás seguro de que deseas eliminar <strong>${itemName}</strong>?<br><small>Esta acción no se puede deshacer.</small>`,
    showCancelButton: true,
    confirmButtonColor: customColors.error,
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  });
};

/**
 * Alerta de carga/loading
 */
export const showLoading = (message = 'Procesando...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Cerrar la alerta de loading
 */
export const closeLoading = () => {
  Swal.close();
};

/**
 * Toast (notificación pequeña en la esquina)
 */
export const showToast = (message, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon: icon,
    title: message,
  });
};

/**
 * Alerta con input de texto
 */
export const showInputAlert = (title, inputPlaceholder = '', inputValue = '') => {
  return Swal.fire({
    title: title,
    input: 'text',
    inputValue: inputValue,
    inputPlaceholder: inputPlaceholder,
    showCancelButton: true,
    confirmButtonColor: customColors.primary,
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Este campo es obligatorio';
      }
    },
  });
};

/**
 * Alerta con select/dropdown
 */
export const showSelectAlert = (title, options, placeholder = 'Selecciona una opción') => {
  return Swal.fire({
    title: title,
    input: 'select',
    inputOptions: options,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonColor: customColors.primary,
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes seleccionar una opción';
      }
    },
  });
};

/**
 * Alerta personalizada avanzada
 */
export const showCustomAlert = (config) => {
  return Swal.fire({
    confirmButtonColor: customColors.primary,
    ...config,
  });
};
