// utils/encryption.js
import * as ethSigUtil from "@metamask/eth-sig-util";
import { Buffer } from "buffer";

/**
 * Generate a random AES key for symmetric encryption
 */
export async function generateAESKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
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
  //
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

  // Convert decrypted data to string and parse as JSON
  const decodedData = new TextDecoder().decode(decryptedData);
  return JSON.parse(decodedData);
}

/**
 * Prepares encrypted data for storage and access
 */
export async function prepareEncryptedData(patientData, authorizedWallets) {
  const aesKey = await generateAESKey(); // Generate a new AES key
  const { encrypted, iv } = await encryptWithAES(aesKey, patientData); // Encrypt the patient data
  const exportedAESKey = await exportAESKey(aesKey); // Export the AES key
  const encryptedKeys = {}; // Object to hold encrypted keys for each wallet

  // Encrypt the AES key for each authorized wallet
  for (const wallet of authorizedWallets) {
    encryptedKeys[wallet] = await encryptAESKeyForWallet(
      exportedAESKey,
      wallet
    );
  }

  // Convert encrypted data and IV to base64 strings for storage
  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encrypted))
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));

  // Store the encrypted data, IV, and encrypted keys in a structured object
  return {
    data: encryptedBase64,
    iv: ivBase64,
    keys: encryptedKeys,
    wallet_address: patientData.wallet_address,
  };
}

/**
 * Prepares encrypted data for patient update
 */
export async function prepareEncryptedDataPatientUpdate(patientData, keys) {
  const aesKey = await getCachedAESKey(patientData.wallet_address);
  if (!aesKey) {
    throw new Error("No AES key found for this wallet address");
  }

  const { encrypted, iv } = await encryptWithAES(aesKey, patientData);

  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encrypted))
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    data: encryptedBase64,
    iv: ivBase64,
    keys: keys,
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
  const encryptedKey = encryptedDataPackage.keys[matchingKey];

  let aesKey = await getCachedAESKey(encryptedDataPackage.wallet_address);

  if (!aesKey) {
    aesKey = await decryptAESKeyFromMetaMask(encryptedKey);
    cacheAESKey(aesKey, encryptedDataPackage.wallet_address);
  }

  // Decode encrypted data and IV
  // Convert base64 strings to Uint8Array
  const encryptedData = Uint8Array.from(atob(encryptedDataPackage.data), (c) =>
    c.charCodeAt(0)
  ).buffer;
  // Convert base64 strings to Uint8Array
  const iv = Uint8Array.from(atob(encryptedDataPackage.iv), (c) =>
    c.charCodeAt(0)
  );

  // Decrypt the data using the AES key and IV
  const patientData = await decryptWithAES(aesKey, encryptedData, iv);

  return patientData;
}

/**
 * Caches the AES key in session storage for the given wallet address
 */
export async function cacheAESKey(aesKey, walletAddress) {
  const exportedAESKey = await exportAESKey(aesKey);
  const aesKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(exportedAESKey))
  );

  sessionStorage.setItem(walletAddress, aesKeyBase64);
  console.log("Cached AES key for wallet:", walletAddress);
}

export async function getCachedAESKey(walletAddress) {
  const aesKeyBase64 = sessionStorage.getItem(walletAddress);
  if (!aesKeyBase64) return null;

  const aesKeyBuffer = Uint8Array.from(atob(aesKeyBase64), (c) =>
    c.charCodeAt(0)
  ).buffer;

  return await importAESKey(aesKeyBuffer);
}

/**
 * Decrypts the AES key and re-encrypts it for a new wallet address
 */
export async function decryptAESkeyAndEncrypt(
  encryptedDataPackage,
  newWalletAddress,
  userWalletAddress
) {
  const encryptedKey = encryptedDataPackage.keys[userWalletAddress];
  const aesKey = await decryptAESKeyFromMetaMask(encryptedKey);
  const exportedAESKey = await exportAESKey(aesKey);
  const newEncryptedKey = await encryptAESKeyForWallet(
    exportedAESKey,
    newWalletAddress
  );
  return newEncryptedKey;
}

/**
 * Encrypts the AES key for a given wallet address using MetaMask's encryption
 */
async function encryptAESKeyForWallet(exportedAESKeyBuffer, walletAddress) {
  const publicKey = await window.ethereum.request({
    method: "eth_getEncryptionPublicKey",
    params: [walletAddress],
  });

  // Convert AES key to base64 string for encryption
  const base64Key = Buffer.from(exportedAESKeyBuffer).toString("base64");

  const encrypted = ethSigUtil.encrypt({
    publicKey,
    data: base64Key,
    version: "x25519-xsalsa20-poly1305",
  });

  // Base64 encode the entire encrypted object
  return btoa(JSON.stringify(encrypted));
}

/**
 * Decrypts the AES key using MetaMask's decryption method
 */
export async function decryptAESKeyFromMetaMask(encryptedKeyBase64) {
  const encryptedObj = JSON.parse(atob(encryptedKeyBase64));
  console.log("Encrypted object:", encryptedObj);

  const accounts = await window.ethereum.request({ method: "eth_accounts" });

  // Convert the JSON object to a string
  const encryptedObjString = JSON.stringify(encryptedObj);

  // Convert the string to a hex string by encoding to UTF-8 bytes first, then to hex
  const hexString =
    "0x" +
    Array.from(new TextEncoder().encode(encryptedObjString)) //Convert JSON string to bytes
      .map((b) => b.toString(16).padStart(2, "0")) //Convert each byte to hex
      .join(""); // Join the hex values into a single string

  // Decrypt the hex string using MetaMask's eth_decrypt method
  const decryptedBase64 = await window.ethereum.request({
    method: "eth_decrypt",
    params: [hexString, accounts[0]],
  });

  // Convert the decrypted base64 string back to a Uint8Array
  const keyBuffer = Uint8Array.from(atob(decryptedBase64), (c) =>
    c.charCodeAt(0)
  );
  return await importAESKey(keyBuffer.buffer);
}
