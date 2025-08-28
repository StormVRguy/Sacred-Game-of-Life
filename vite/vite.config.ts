import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	base: '/Sacred-Game-of-Life/', // Replace with your repository name
	plugins: [react()]
});