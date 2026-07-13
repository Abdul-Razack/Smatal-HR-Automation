module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.base.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-restricted-imports': [
      'error',
      {
        'paths': [
          {
            'name': '@nestjs/common',
            'message': 'Domain layer must not depend on NestJS. Use pure TypeScript.'
          },
          {
            'name': '@prisma/client',
            'message': 'Domain layer must not depend on Prisma. Use Repository interfaces.'
          }
        ],
        'patterns': [
          {
            'group': ['libs/modules/*/src/*'],
            'message': 'Cross-module imports must only go through @smatal/[module]/contracts'
          }
        ]
      }
    ]
  },
  overrides: [
    {
      'files': ['libs/modules/*/src/domain/**/*.ts'],
      'rules': {
        'no-restricted-imports': [
          'error',
          {
            'paths': ['@nestjs/common', '@nestjs/core', '@prisma/client'],
            'patterns': ['@smatal/database/*', '@smatal/infrastructure/*']
          }
        ]
      }
    }
  ]
};
