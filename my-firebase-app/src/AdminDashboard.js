import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/');
          return;
        }

        const userDoc = await getDocs(collection(db, 'users'));
        const usersData = userDoc.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user => user.role !== 'admin'); // Exclude admin from the list

        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        setError('Error loading users');
        setLoading(false);
      }
    };

    checkAdminAndLoadUsers();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      setError('Error logging out');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        setError('Error deleting user');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-content">
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>New Users (Today)</h3>
            <p>
              {users.filter(user => {
                const today = new Date().toDateString();
                const userDate = new Date(user.createdAt).toDateString();
                return today === userDate;
              }).length}
            </p>
          </div>
        </div>

        <div className="users-table-container">
          <h2>Registered Users</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;