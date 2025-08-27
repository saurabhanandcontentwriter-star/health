
// =================================================================================
// NOTE: FIREBASE AUTHENTICATION HAS BEEN DISABLED
// =================================================================================
// The application was failing to start because of an invalid Firebase configuration.
// To fix this, the Firebase-based phone authentication has been replaced with a
// simple mock login system in `contexts/AuthContext.tsx`. You can now log in as a
// sample patient or admin from the login page without needing Firebase credentials.
//
// To re-enable Firebase authentication in the future:
// 1. Restore the original content of this file (including the imports).
// 2. Provide your valid Firebase project configuration in the `firebaseConfig` object.
// 3. Restore the original content of `contexts/AuthContext.tsx` and `components/LoginPage.tsx`.
// =================================================================================

// The original file content has been commented out or removed to prevent the initialization error.
// Exporting a null object to prevent breaking changes if other files were to import `auth`.
export const auth = null;
