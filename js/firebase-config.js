const firebaseConfig = {
  apiKey:            "AIzaSyDm_XiKp9tSWb0Y0eKMgJQyAN3PewcWD38",
  authDomain:        "pagina-web-hermandad-582af.firebaseapp.com",
  projectId:         "pagina-web-hermandad-582af",
  storageBucket:     "pagina-web-hermandad-582af.firebasestorage.app",
  messagingSenderId: "343628499518",
  appId:             "1:343628499518:web:2bc3f7fdaea1c7ec6d1f6f",
};

firebase.initializeApp(firebaseConfig);

const db   = firebase.firestore();
const auth = firebase.auth();

auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(() => {});
