import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();

  // Admin credentials
  const ADMIN_EMAIL = "jocelyn1@gmail.com";
  const ADMIN_PASSWORD = "123456";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/homepage');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: email,
          role: 'user',
          createdAt: new Date().toISOString()
        });
        alert('Account created successfully!');
        navigate('/homepage');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
        navigate('/homepage');
      }
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        const adminDoc = doc(db, "users", userCredential.user.uid);
        const adminSnapshot = await getDoc(adminDoc);
        
        if (!adminSnapshot.exists()) {
          await setDoc(adminDoc, {
            name: "Jocelyn",
            email: ADMIN_EMAIL,
            role: 'admin',
            createdAt: new Date().toISOString()
          });
        }
        
        alert('Logged in as admin successfully!');
        setShowAdminLogin(false);
        navigate('/admin-dashboard');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="input-group">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegistering}
              />
            </div>
          )}

          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="button-group">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="toggle-btn"
          >
            {isRegistering 
              ? 'Already have an account? Login' 
              : 'Need an account? Register'}
          </button>
          
          {!isRegistering && (
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="admin-btn"
            >
              Login as Admin
            </button>
          )}
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Admin Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAdminLogin}>
              <div className="input-group">
                <label>Admin Email:</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Admin Password:</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Login
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;