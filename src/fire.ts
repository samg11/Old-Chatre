import admin from 'firebase-admin';
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const fire = admin;
export const db   = admin.firestore();
export const auth = admin.auth();