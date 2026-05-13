const isDev = process.env.NODE_ENV === 'development';

export const devLog = {
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
};
