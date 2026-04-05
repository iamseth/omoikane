import { createHash, randomBytes } from 'node:crypto';

const SLUG_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function randomString(length: number, alphabet: string) {
	const bytes = randomBytes(length);
	let result = '';

	for (let index = 0; index < length; index += 1) {
		result += alphabet[bytes[index] % alphabet.length];
	}

	return result;
}

export function generateAdminToken() {
	return randomBytes(24).toString('base64url');
}

export function hashAdminToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}

export function generateEventSlug() {
	return randomString(8, SLUG_ALPHABET);
}
