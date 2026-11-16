import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...angular.configs.tsRecommended,
  { files: ['**/*.ts'], processor: angular.processInlineTemplates },
  ...angular.configs.templateRecommended.map((config) => ({ ...config, files: ['**/*.html'] })),
  ...angular.configs.templateAccessibility.map((config) => ({ ...config, files: ['**/*.html'] })),
  { files: ['**/*.html'], rules: { '@angular-eslint/template/prefer-control-flow': 'off' } },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
