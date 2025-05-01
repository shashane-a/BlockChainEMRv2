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

  // const aesKeyBase64 = btoa(
  //   String.fromCharCode(...new Uint8Array(exportedAESKey))
  // );

  for (const wallet of authorizedWallets) {
    encryptedKeys[wallet] = await encryptAESKeyForWallet(
      exportedAESKey,
      wallet
    );
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

  // Base64 encode the entire encrypted object for storage/transmission
  return btoa(JSON.stringify(encrypted));
}

export async function decryptAESKeyFromMetaMask(encryptedKeyBase64) {
  const encryptedObj = JSON.parse(atob(encryptedKeyBase64));
  console.log("Encrypted object:", encryptedObj);

  const accounts = await window.ethereum.request({ method: "eth_accounts" });

  // Convert the JSON object to a string
  const encryptedObjString = JSON.stringify(encryptedObj);

  // Convert the string to a hex string by encoding to UTF-8 bytes first, then to hex
  const hexString =
    "0x" +
    Array.from(new TextEncoder().encode(encryptedObjString))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const decryptedBase64 = await window.ethereum.request({
    method: "eth_decrypt",
    params: [hexString, accounts[0]],
  });

  const keyBuffer = Uint8Array.from(atob(decryptedBase64), (c) =>
    c.charCodeAt(0)
  );
  return await importAESKey(keyBuffer.buffer);
}
