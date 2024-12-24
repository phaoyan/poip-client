import { encrypt, decrypt } from '../cryptography';

describe('Cryptography Functions', () => {
    describe('encrypt', () => {
        it('should encrypt a file and return an encrypted blob and an encryption key', async () => {
            const fileContent = 'This is some test content.';
            const file = new File([fileContent], 'test.txt', { type: 'text/plain' });

            const result = await encrypt(file);

            expect(result).toBeDefined();
            expect(result.encryptedBlob).toBeInstanceOf(Blob);
            expect(typeof result.keyBase64).toBe('string');
            expect(result.keyBase64).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
        });

        it('should handle an empty file', async () => {
            const file = new File([], 'empty.txt', { type: 'text/plain' });

            const result = await encrypt(file);

            expect(result).toBeDefined();
            expect(result.encryptedBlob).toBeInstanceOf(Blob);
            expect(typeof result.keyBase64).toBe('string');
            expect(result.keyBase64).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
        });
    });

    describe('decrypt', () => {
        it('should decrypt an encrypted blob using the correct key', async () => {
            const fileContent = 'This is some content to encrypt and then decrypt.';
            const file = new File([fileContent], 'original.txt', { type: 'text/plain' });
            const { encryptedBlob, keyBase64, ivBase64 } = await encrypt(file);
            
            const decryptedBlob = await decrypt({ encryptedBlob, keyBase64, ivBase64 });

            expect(decryptedBlob).toBeInstanceOf(Blob);
            const decryptedText = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.readAsText(decryptedBlob!);
            });
            expect(decryptedText).toEqual(fileContent);
        });

        it('should return null if decryption fails due to an incorrect key', async () => {
            const fileContent = 'Secret message.';
            const file = new File([fileContent], 'secret.txt', { type: 'text/plain' });
            const { encryptedBlob, ivBase64 } = await encrypt(file);
            const incorrectKey = 'thisisnotavalidkey';

            const decryptedBlob = await decrypt({ encryptedBlob, keyBase64: incorrectKey, ivBase64 });
            expect(decryptedBlob).toBeNull();
        });

        it('should return null if the decryption key is not a valid base64 string', async () => {
            const fileContent = 'More secret stuff.';
            const file = new File([fileContent], 'more_secret.txt', { type: 'text/plain' });
            const { encryptedBlob, ivBase64 } = await encrypt(file);
            const invalidBase64Key = 'invalid-base64!';

            const decryptedBlob = await decrypt({ encryptedBlob, keyBase64: invalidBase64Key, ivBase64 });
            expect(decryptedBlob).toBeNull();
        });

    });
});