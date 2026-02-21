//logger simples com console
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  error: (message, data) => {
    console.error(`[ERROR] ${message}`, data || '');
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  debug: (message, data) => {
    console.log(`[DEBUG] ${message}`, data || '');
  },
};

export default logger;
