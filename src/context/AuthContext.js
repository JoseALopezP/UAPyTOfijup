'use client';
import { useState, useEffect, useContext, createContext } from 'react';
import {
    onAuthStateChanged,
    getAuth,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebase_app from '@/firebase/config';

const auth = getAuth(firebase_app);

export const AuthContext = createContext({});

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({
    children,
}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async(user) => {
            if (user) {
                setUser(user);
                try {
                    const db = getFirestore(firebase_app);
                    const docRef = doc(db, 'users', 'listaUsuarios');
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const usersData = docSnap.data();
                        
                        let flatList = [];
                        const traverse = (obj) => {
                            if (!obj) return;
                            if (typeof obj === 'object') {
                                if (obj.userId || obj.uid) {
                                    flatList.push(obj);
                                } else {
                                    Object.values(obj).forEach(traverse);
                                }
                            }
                        };
                        traverse(usersData);
                        
                        const userEntry = flatList.find(u => u.userId === user.uid || u.uid === user.uid);
                        
                        if (userEntry) {
                            setUserRole(userEntry.type);
                        } else {
                            setUserRole(null);
                        }
                    } else {
                        console.log("No docSnap exists for users/listaUsuarios");
                        setUserRole(null);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setUserRole(null);
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userRole }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};
