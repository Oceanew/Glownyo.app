import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
	{ ignores: ['node_modules/**', 'dist/**', 'build/**', 'vite.config.js'] },
	{
		files: ['**/*.js', '**/*.jsx'],
		plugins: { react, 'react-hooks': reactHooks, 'import': importPlugin },
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: { ecmaFeatures: { jsx: true } },
			globals: { ...globals.browser, ...globals.node },
		},
		settings: {
			'react': { version: 'detect' },
			'import/extensions': ['.js', '.jsx'],
			'import/resolver': {
				node: { extensions: ['.js', '.jsx'] },
				alias: { map: [['@', './src']], extensions: ['.js', '.jsx'] },
			},
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			...importPlugin.flatConfigs.recommended.rules,

			'react/prop-types': 'off',
			'react/no-unescaped-entities': 'off',
			'react/display-name': 'off',
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',

			'no-unused-vars': 'warn',
			'no-undef': 'error',
			'no-empty': ['error', { allowEmptyCatch: true }],

			'import/no-named-as-default': 'off',
			'import/no-named-as-default-member': 'off',
			'import/no-self-import': 'error',
			'import/no-cycle': 'off',
		},
	},
];
