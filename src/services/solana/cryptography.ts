import forge from 'node-forge';
import { Keypair } from '@solana/web3.js';

export const encrypt = async (file: File): Promise<{ encryptedBlob: Blob, keyBase64: string, ivBase64: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (!reader.result) {
        reject(new Error("Failed to read file content."));
        return;
      }

      const fileContent = reader.result as ArrayBuffer;
      const key = forge.random.getBytesSync(32); // 256-bit key
      const iv  = forge.random.getBytesSync(16); // 128-bit IV

      const cipher = forge.cipher.createCipher('AES-CBC', key);
      cipher.start({ iv: iv }); // Removed tagLength
      cipher.update(forge.util.createBuffer(
        new Uint8Array(fileContent).reduce((acc, byte) => acc + String.fromCharCode(byte), '')
      ));
      const success = cipher.finish();

      if (!success) {
        reject(new Error("Encryption failed."));
        return;
      }

      const encryptedBytes = cipher.output.getBytes();
      const encryptedUint8Array = new Uint8Array(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        encryptedUint8Array[i] = encryptedBytes.charCodeAt(i);
      }
      const encryptedBlob = new Blob([encryptedUint8Array]);

      // Convert the key and IV to base64 strings for easier handling
      const keyBase64 = forge.util.encode64(key);
      const ivBase64 = forge.util.encode64(iv);

      resolve({ encryptedBlob, keyBase64, ivBase64 });
    };

    reader.onerror = () => {
      reject(new Error("Error reading file."));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const decrypt = async ({
  encryptedBlob,
  keyBase64,
  ivBase64
}: {
  encryptedBlob: Blob;
  keyBase64: string;
  ivBase64: string;
}): Promise<Blob | null> => {
  try {

    console.log(`KEY BASE64: ${keyBase64} ; IV BASE64: ${ivBase64}`)
    const key = forge.util.decode64(keyBase64);
    const iv  = forge.util.decode64(ivBase64); // Decoded IV

    // Convert blob to ArrayBuffer for decryption
    const fileReader = new FileReader();
    const encryptedBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
      fileReader.onloadend = () => {
        if (fileReader.result instanceof ArrayBuffer) {
          resolve(fileReader.result);
        } else {
          reject(new Error("Failed to read encrypted file as ArrayBuffer."));
        }
      };
      fileReader.onerror = () => {
        reject(new Error("Error reading encrypted Blob."));
      };
      fileReader.readAsArrayBuffer(encryptedBlob);
    });

    // Convert ArrayBuffer to binary string
    const encryptedBytes = new Uint8Array(encryptedBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), '');

    // Perform decryption (AES-CBC without tagLength)
    const decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({ iv: iv }); // Removed tagLength
    decipher.update(forge.util.createBuffer(encryptedBytes));
    const success = decipher.finish();

    if (!success) {
      console.error("File decryption failed.");
      return null;
    }

    const decryptedBytes = decipher.output.getBytes();
    const decryptedUint8Array = new Uint8Array(decryptedBytes.length);
    for (let i = 0; i < decryptedBytes.length; i++) {
      decryptedUint8Array[i] = decryptedBytes.charCodeAt(i);
    }

    return new Blob([decryptedUint8Array]);
  } catch (error) {
    console.error("Decryption process failed:", error);
    return null;
  }
};

export const generateRandomBytes = (length: number): string => {
  const {publicKey} = Keypair.generate()
  return publicKey.toString()
};