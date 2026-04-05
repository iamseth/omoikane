import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: [
				'src/hooks.server.ts',
				'src/lib/server/**/*.ts',
				'src/routes/**/*.server.ts'
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			}
		}
	}
});
