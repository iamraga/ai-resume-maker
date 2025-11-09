import { Buffer } from "node:buffer";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getServiceAccount() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!key) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Provide the JSON service account string."
    );
  }

  try {
    // Support base64 encoding or raw json string.
    const jsonString = key.trim().startsWith("{")
      ? key
      : Buffer.from(key, "base64").toString("utf-8");
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(
      "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string or base64 encoded JSON."
    );
  }
}

let adminAppSingleton = null;

function getAdminApp() {
  if (adminAppSingleton) {
    return adminAppSingleton;
  }

  const existing = getApps()[0];
  if (existing) {
    adminAppSingleton = existing;
    return adminAppSingleton;
  }

  adminAppSingleton = initializeApp({
    credential: cert(getServiceAccount()),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return adminAppSingleton;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
