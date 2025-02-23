import React, { useContext, useEffect, useState } from 'react'
import './LeftSidebar.css'
import assests from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from '@firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'



const LeftSidebar = () => {

    const navigate = useNavigate();

    const { userData ,chatData,chatUser,setChatUser,setMessagesId,messageId ,chatVisible,setChatVisible} = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                 setShowSearch(true);
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    let userExist = false
                    chatData.map((user)=>{
                           if(user.rId === querySnap.docs[0].data().id){
                            userExist =true;
                           }
                    })

                    if(!userExist){

                        setUser(querySnap.docs[0].data());
                    }
                }else{
                    setUser(null);
                }
            }
            else{
                setShowSearch(false);
            }

        } catch (error) {
          
        }
    }

         
const addChat = async () => {

    
    const messagesRef = collection(db,"messages");
    const chatsRef = collection(db,"chats");
    try {
        const newMessageRef = doc(messagesRef);
        await setDoc(newMessageRef,{
            createdAt:serverTimestamp(),
            messages:[]
        });
        
        await updateDoc(doc(chatsRef,user.id),{
            chatData:arrayUnion({
                messageId:newMessageRef.id,
                lastMessage:"",
                rId:userData.id,
                updatedAt:Date.now(),
                messageSeen:true
            })
        })

        await updateDoc(doc(chatsRef,userData.id),{
            chatData:arrayUnion({
                messageId:newMessageRef.id,
                lastMessage:"",
                  rId:user.id,
                updatedAt:Date.now(),
                messageSeen:true
            })
        })

       const uSnap = await getDoc(doc(db,"users",user.id));
       const uData = uSnap.data();
       setChat({
        setMessagesId:newMessageRef.id,
        lastMessage:"",
        rId:user.id,
        updatedAt:date.now(),
        messageSeen:true,
        userData:uData
       })
        setShowSearch(false)
        setChatVisible(true)
        
    } catch (error) {
         toast.error(error.message);
         console.error(error)
    }
  }

    const setChat = async(item)=>{

        try {
            
            setMessagesId(item.messageId);
            setChatUser(item)
            const userChatsRef = doc(db,'chats',userData.id);
            const userChatsSnapshot = await getDoc(userChatsRef);
            const userchatsData = userChatsSnapshot.data();
            const chatIndex = userchatsData.chatData.findIndex((c)=>c.messageId=== item.messageId);
            userchatsData.chatData[chatIndex].messageSeen = true;
           await updateDoc(userChatsRef,{
            chatData : userchatsData.chatData
           })
           setChatVisible(true);
        } catch (error) {
            toast.error(error.message)
        }
         

    }
       
    useEffect(()=>{
          
        const updateChatUserData = async ()=>{
           
            if(chatUser){
                const userRef = doc(db,"users",chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev =>({...prev,userData:userData}))
            }
            
        }
        updateChatUserData();
    },[chatData])

    return (
        <div className={` ls ${chatVisible?"hidden":""}`}>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assests.logo} className='logo' alt="" />
                    <div className="menu">
                        <img src={assests.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>  Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assests.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder='search here...' />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user ? <div onClick={addChat} className="freinds add-user">
                    <img src={user.avatar} alt="" />
                    <p>{user.name}</p>
                </div> 
                :
                chatData.map((item, index) => (
                    <div onClick={()=>setChat(item)} key={index} className={`freinds ${item.messageSeen || item.messageId === messageId ?"":"border"}`}>
                        <img src={item.userData.avatar} alt="" />
                        <div>
                            <p>{item.userData.name}</p>
                            <span>{item.lastMessage}</span>
                        </div>
                    </div>
                ))
                }
               
            </div>
        </div>
    )
}

export default LeftSidebar
