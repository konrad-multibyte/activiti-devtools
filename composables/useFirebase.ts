import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const useFirebase = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyBYssSoqLAVHLu6dA6MWLSnj2udW-nJZic",
        authDomain: "activiti-devtools-test.firebaseapp.com",
        projectId: "activiti-devtools-test",
        storageBucket: "activiti-devtools-test.appspot.com",
        messagingSenderId: "126344006233",
        appId: "1:126344006233:web:dbbc7543c85cc45bfdff48",
        measurementId: "G-GMGGSYSG7G"
    };
    const firebaseApp = initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    return {
        firebaseApp,
        firestore,
    }
}