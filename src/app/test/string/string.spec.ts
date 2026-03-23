import { message } from './string';

describe('message', () => {
		it('returns Saludos plus the given name', () => {
			const result = message('Carlos');
			const expected = 'Saludos Carlos';
			expect(typeof result).toBe('string');
			expect(result).toBe(expected);
		});

		it('works with empty string', () => {
			const result = message('');
			const expected = 'Saludos ';
			expect(typeof result).toBe('string');
			expect(result).toBe(expected);
		});
		
});

