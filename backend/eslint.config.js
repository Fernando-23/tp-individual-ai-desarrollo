import js from '@eslint/js';

export default [
  { ignores: ['node_modules/', 'coverage/'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    // Solo el arranque del servidor y el log de errores inesperados usan Node directo.
    files: ['src/server.js', 'src/http/errores.js'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
  },
];
