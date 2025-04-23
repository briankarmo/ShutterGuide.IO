import React, { createContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, verifyPasswordResetCode, signInWithPopup, signOut, confirmPasswordReset } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import app, { actionCodeSettings } from '../firebase/firebase.config';

export const AuthContext = createContext();

const auth = getAuth(app);
const db = getFirestore(app)

const UserContext = ({ children }) => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);

    const googleProvider = new GoogleAuthProvider();

    const createUser = async (fullname, email, password) => {

        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        try {
            // Store additional user data in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name: fullname,
                email: user.email,
                createdAt: new Date(),
            });
        } catch (error) {
            // console.log(error);
        }

        return user;
    }

    const signIn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const passwordResetEmail = (email) => {
        return sendPasswordResetEmail(auth, email, actionCodeSettings)
    }

    const passwordResetCode = (oobCode) => {
        return verifyPasswordResetCode(auth, oobCode);
    }

    const passwordReset = (oobCode, newPassword) => {

        confirmPasswordReset(auth, oobCode, newPassword)
    }

    const signInWithGoogle = () => {
        return signInWithPopup(auth, googleProvider)
    }

    const logOut = () => {
        return signOut(auth);
    }

    //why are we doing this?
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            if ( currentUser ) {
                onSnapshot(
                    doc(db, 'subscriptions', currentUser.uid),
                    (snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.data();
                            setSubscription({
                                ...data,
                                isFree: data.status === 'free',
                                isActive: data.status === 'active',
                                isCanceled: data.status === 'canceled',
                                willExpire: data.currentPeriodEnd?.toDate() < new Date(),
                            });
                        } else {
                            setSubscription(null);
                        }
                        setLoading(false);
                    },
                    (error) => {
                        console.error('Subscription error:', error);
                        setLoading(false);
                    }
                );
            }
            setLoading(false);
            // console.log('auth state changed', currentUser);
        })
        return () => {
            unsubscribe();
        }
    }, [])

    const authInfo = { user, loading, createUser, signIn, logOut, signInWithGoogle, passwordResetEmail, passwordReset, passwordResetCode, subscription }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default UserContext;