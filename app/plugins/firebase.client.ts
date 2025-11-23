import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();

    const firebaseConfig = {
        apiKey: config.public.firebaseApiKey as string,
        authDomain: config.public.firebaseAuthDomain as string,
        projectId: config.public.firebaseProjectId as string,
        storageBucket: config.public.firebaseStorageBucket as string,
        messagingSenderId: config.public.firebaseMessagingSenderId as string,
        appId: config.public.firebaseAppId as string
    };

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    return {
        provide: {
            db: firestore,
            storage: storage
        }
    };
});
