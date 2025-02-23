
import { initializeApp } from "firebase/app";
import{createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyA01hUfjd9bXd06qrPvoi_Oq_kobzHnRwY",
  authDomain: "chat-app-gs-94a1a.firebaseapp.com",
  projectId: "chat-app-gs-94a1a",
  storageBucket: "chat-app-gs-94a1a.appspot.com", 
  messagingSenderId: "903616646641",
  appId: "1:903616646641:web:dc69ce269b7526ed524850"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);


const signup = async (username , email ,password)=>{
    try {
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"hey ,there i am using chat app",
            lastSeen: Date.now()
        

        })
        await setDoc(doc(db, "chats", user.uid), {
            chatData: []
        });

        toast.success("Account created successfully!");
    } catch (error) {
         console.error(error)
         toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async (email ,password) => {
  try {
    await signInWithEmailAndPassword(auth,email,password);
    toast.success("Login successful!");
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
}

const logout = async()=>{
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    } 
}

const resetPass = async(email) => {
  if(!email){
      toast.error("Enter your email");
      return null;s
  }

  try {
    const userRef = collection(db,'users');
    const q = query(userRef,where("email","==",email));
    const querySnap = await getDocs(q);
    if(!querySnap.empty){
      await sendPasswordResetEmail(auth,email);
      toast.success("Reset Email Sent")
    }else{
      toast.error("Email doesn't exists")
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message)
  }
}

export {signup , login,logout,auth,db, resetPass}