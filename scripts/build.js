import { readFileSync } from 'fs'
import * as esbuild from 'esbuild'
import 'dotenv/config'

const NAME = 'SuperThanks Converter'

const generateMetadata = () => {
	const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))

	const metadata = {
		name: NAME,
		version: pkg.version,
		description: pkg.description,
		author: pkg.author,
		source: 'https://github.com/satohshi/superthanks-converter',
		license: pkg.license,
		match: 'https://studio.youtube.com/*',
		grant: 'window.onurlchange',
	}

	return [
		'// ==UserScript==',
		...Object.entries(metadata).map(([key, value]) => {
			return `// @${key.padEnd(13, ' ')}${value}`
		}),
		'// ==/UserScript==',
	].join('\n')
}

const args = process.argv.slice(2)

const BUILD_OPTIONS = {
	entryPoints: ['src/index.ts'],
	bundle: true,
	logLevel: 'info',
	format: 'esm',
	// wrap in async iife for "top-level" await
	banner: {
		js: generateMetadata() + '\n\n;(async () => {',
	},
	footer: {
		js: '\n})();',
	},
}

if (args.includes('--dev')) {
	const ctx = await esbuild.context({
		...BUILD_OPTIONS,
		outfile: 'dev/index.js',
		define: {
			_API_KEY: JSON.stringify(process.env.API_KEY),
			_LOCALE: JSON.stringify(process.env.LOCALE),
			_CURRENCY: JSON.stringify(process.env.CURRENCY),
		},
	})

	ctx.watch().catch((err) => {
		console.error(err)
		process.exit(1)
	})
} else {
	esbuild
		.build({
			...BUILD_OPTIONS,
			outfile: 'dist/index.js',
			define: {
				_API_KEY: '"YOUR_API_KEY"',
				_LOCALE: '"YOUR_LOCALE"',
				_CURRENCY: '"YOUR_CURRENCY"',
			},
		})
		.catch(() => {
			process.exit(1)
		})
}
