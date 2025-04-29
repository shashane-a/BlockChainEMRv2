// utils/encryption.js
import { ethers } from "ethers";

/**
 * Generate a random AES key for symmetric encryption
 */
export async function generateAESKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Export an AES key to raw bytes
 */
export async function exportAESKey(key) {
  return await window.crypto.subtle.exportKey("raw", key);
}

/**
 * Import an AES key from raw bytes
 */
export async function importAESKey(rawKey) {
  return await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts data with an AES key
 */
export async function encryptWithAES(key, data) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    encrypted: encryptedData,
    iv: iv,
  };
}

/**
 * Decrypts data with an AES key
 */
export async function decryptWithAES(key, encryptedData, iv) {
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedData
  );

  const decodedData = new TextDecoder().decode(decryptedData);
  return JSON.parse(decodedData);
}

/**
 * Prepares encrypted data for storage and access
 */
export async function prepareEncryptedData(patientData, authorizedWallets) {
  // 1. Generate AES key
  const aesKey = await generateAESKey();

  // 2. Encrypt the patient data
  const { encrypted, iv } = await encryptWithAES(aesKey, patientData);

  // 3. Export AES key to raw bytes
  const exportedAESKey = await exportAESKey(aesKey);

  // 4. Encode AES key for each authorized user (TEMPORARY: just base64 encode)
  const encryptedKeys = {};

  const aesKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(exportedAESKey))
  );

  for (const wallet of authorizedWallets) {
    encryptedKeys[wallet] = aesKeyBase64;
  }

  // 5. Base64 encode the encrypted data and IV for storage
  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encrypted))
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    data: encryptedBase64,
    iv: ivBase64,
    keys: encryptedKeys,
    wallet_address: patientData.wallet_address,
  };
}

/**
 * Decrypts patient data for the current user
 */
export async function decryptPatientData(encryptedDataPackage) {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  const currentWallet = accounts[0];
  if (!currentWallet) throw new Error("No wallet connected");

  console.log("Current wallet address:", currentWallet);
  console.log("Encrypted data package:", encryptedDataPackage);

  // Find matching key ignoring case
  const matchingKey = Object.keys(encryptedDataPackage.keys).find(
    (storedAddress) =>
      storedAddress.toLowerCase() === currentWallet.toLowerCase()
  );

  if (!matchingKey) {
    throw new Error("You don't have access to this data");
  }
  // Get the AES key from base64
  const aesKeyBase64 = encryptedDataPackage.keys[matchingKey];
  const aesKeyBytes = Uint8Array.from(atob(aesKeyBase64), (c) =>
    c.charCodeAt(0)
  );
  const aesKey = await importAESKey(aesKeyBytes.buffer);

  // Decode encrypted data and IV
  const encryptedData = Uint8Array.from(atob(encryptedDataPackage.data), (c) =>
    c.charCodeAt(0)
  ).buffer;
  const iv = Uint8Array.from(atob(encryptedDataPackage.iv), (c) =>
    c.charCodeAt(0)
  );

  // Decrypt
  const patientData = await decryptWithAES(aesKey, encryptedData, iv);

  return patientData;
}
