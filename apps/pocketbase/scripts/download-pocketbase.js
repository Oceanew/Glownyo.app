#!/usr/bin/env node
// Downloads the pinned PocketBase binary for the current platform from the
// official GitHub releases. The binary itself is not committed to git (see
// .gitignore) — every environment fetches its own build instead.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const version = fs.readFileSync(path.join(root, '.pocketbase-version'), 'utf8').trim();

const platformMap = { linux: 'linux', darwin: 'darwin', win32: 'windows' };
const archMap = { x64: 'amd64', arm64: 'arm64' };

const platform = platformMap[os.platform()];
const arch = archMap[os.arch()];

if (!platform || !arch) {
	console.error(`Unsupported platform/arch: ${os.platform()}/${os.arch()}`);
	process.exit(1);
}

const binaryName = platform === 'windows' ? 'pocketbase.exe' : 'pocketbase';
const destination = path.join(root, binaryName);

if (fs.existsSync(destination)) {
	console.log('pocketbase binary already present, skipping download.');
	process.exit(0);
}

const zipName = `pocketbase_${version}_${platform}_${arch}.zip`;
const url = `https://github.com/pocketbase/pocketbase/releases/download/v${version}/${zipName}`;
const zipPath = path.join(root, zipName);

console.log(`Downloading PocketBase v${version} for ${platform}/${arch}...`);

try {
	execSync(`curl -fsSL "${url}" -o "${zipPath}"`, { stdio: 'inherit' });
	execSync(`unzip -o "${zipPath}" ${binaryName} -d "${root}"`, { stdio: 'inherit' });
	fs.chmodSync(destination, 0o755);
	fs.unlinkSync(zipPath);
	console.log('PocketBase downloaded successfully.');
} catch (err) {
	// Never fail `npm install` for the whole monorepo over this — offline or
	// network-restricted environments just need to re-run this script once
	// they have access (`npm run postinstall --workspace=apps/pocketbase`).
	console.warn('Could not download PocketBase automatically:', err.message);
	console.warn('Re-run "node apps/pocketbase/scripts/download-pocketbase.js" once you have network access.');
}
