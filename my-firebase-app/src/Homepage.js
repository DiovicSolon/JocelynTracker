import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

function Homepage() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!userData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="homepage-container">
      <nav className="homepage-nav">
        <h1>Welcome, {userData.name}!</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>
      
      <div className="homepage-content">
        <div className="user-info">
          <h2>Your Profile</h2>
          <p>Email: {userData.email}</p>
          <p>Member since: {new Date(userData.createdAt).toLocaleDateString()}</p>
        </div>
        
        {/* Add more content sections here */}
      </div>
    </div>
  );
}

export default Homepage;