package com.noteguard.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
public class EncryptionUtil {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES";

    @Value("${app.encryption.secret-key:mySecretKey12345}")
    private String secretKey;

    /**
     * Encrypts the given plaintext using AES encryption
     * @param plainText The text to encrypt
     * @return Base64 encoded encrypted text
     * @throws Exception If encryption fails
     */
    public String encrypt(String plainText) throws Exception {
        SecretKey key = generateKey();
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] encryptedBytes = cipher.doFinal(plainText.getBytes());
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    /**
     * Decrypts the given encrypted text using AES decryption
     * @param encryptedText Base64 encoded encrypted text
     * @return Decrypted plaintext
     * @throws Exception If decryption fails
     */
    public String decrypt(String encryptedText) throws Exception {
        SecretKey key = generateKey();
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] decodedBytes = Base64.getDecoder().decode(encryptedText);
        byte[] decryptedBytes = cipher.doFinal(decodedBytes);
        return new String(decryptedBytes);
    }

    /**
     * Generates a secret key from the configured secret key string
     * @return SecretKey for AES encryption/decryption
     */
    private SecretKey generateKey() {
        // Pad or truncate the secret key to exactly 16 bytes (128 bits)
        String key = secretKey;
        if (key.length() < 16) {
            key = String.format("%-16s", key).replace(' ', '0');
        } else if (key.length() > 16) {
            key = key.substring(0, 16);
        }
        return new SecretKeySpec(key.getBytes(), ALGORITHM);
    }
}
