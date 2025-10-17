import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/login.css';

function Login() {
    const [studentID, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`StudentID: ${studentID}, Password: ${password}`);
        // Dummy authentication logic
        if (studentID === 'admin@gmail.com' && password === 'pass') {
            setError('');
            alert('Login successful!');
            // Redirect to User Input page
            navigate('/user-input');
        } else {
            setError('Invalid email or password');
            alert('Invalid email or password');
        }
    }
    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="studentID"
                    placeholder="StudentID"
                    value={studentID}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <label>
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                    />
                    Remember me
                </label>
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    )
}

export default Login;
