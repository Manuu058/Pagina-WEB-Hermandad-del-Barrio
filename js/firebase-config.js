/* ============================================================
   HERMANDAD DEL BARRIO | MEDINA SIDONIA
   Configuración de Firebase (Firestore + Storage + Auth)
   ============================================================

   ╔══════════════════════════════════════════════════════════════╗
   ║  PASOS PARA ACTIVAR EL BACKEND REAL                          ║
   ║                                                                ║
   ║  1. Ve a https://console.firebase.google.com y crea un       ║
   ║     proyecto (gratuito).                                      ║
   ║  2. Activa Firestore Database (modo producción).             ║
   ║  3. Activa Storage.                                           ║
   ║  4. Activa Authentication → método "Correo electrónico/      ║
   ║     contraseña" → crea ahí los usuarios de la Junta.          ║
   ║  5. En Project settings → tus apps → añade una app web y     ║
   ║     copia aquí abajo el objeto de configuración.              ║
   ║  6. Pega las reglas de seguridad de Firestore y Storage que   ║
   ║     te haya entregado (Firestore Database → Rules / Storage   ║
   ║     → Rules).                                                 ║
   ║  7. En Authentication → Settings → Authorized domains, añade  ║
   ║     el dominio donde se publique la web (ej. tu dominio de    ║
   ║     GitHub Pages).                                            ║
   ╚══════════════════════════════════════════════════════════════╝
*/

const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:         "TU_PROYECTO.firebaseapp.com",
  projectId:          "TU_PROYECTO",
  storageBucket:      "TU_PROYECTO.appspot.com",
  messagingSenderId:  "TU_SENDER_ID",
  appId:              "TU_APP_ID",
};

firebase.initializeApp(firebaseConfig);

window.db      = firebase.firestore();
window.auth    = firebase.auth();
window.storage = firebase.storage();

/* La sesión del panel se cierra al cerrar la pestaña/navegador,
   igual que el comportamiento anterior basado en sessionStorage. */
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(() => {});
