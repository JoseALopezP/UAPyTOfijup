'use client'
import { useState, useContext } from 'react';
import signUp from '@/firebase/auth/signup';
import { DataContext } from '@/context/DataContext';

export function SignUpBlock () {
    const {addUser} = useContext(DataContext);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [userType, setUserType] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const { result, error } = await signUp(email, password);
            setEmail('');
            setPassword('');
            setUserType('');
            setError(null);
            const data = {
                userId: result.uid,
                type: userType
            }
            await addUser(data)
        }catch (error) {
            setError(error.message);
            console.error('Error adding user:', error);
        }
      };
    
    return(
        <div>
        <h1>Add User</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
            <label>
            Email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <br />
            <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <br />
            <label>
            User Type:
            <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="">Select User Type</option>
                <option value="admin">Admin</option>
                <option value="uac">UAC</option>
                <option value="ugaadmin">UGA Admin</option>
                <option value="operador">operador</option>
                <option value="uapyt">UAPyT</option>
            </select>
            </label>
            <br />
            <button type="submit">Add User</button>
        </form>
        </div>
    )
}