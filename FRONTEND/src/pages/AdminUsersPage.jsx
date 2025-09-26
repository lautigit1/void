// En FRONTEND/src/pages/AdminUsersPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import Spinner from '../components/common/Spinner';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'No se pudieron cargar los usuarios.');
        }
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleRoleChange = async (userId, newRole) => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo actualizar el rol.');
        }
        
        const updatedUser = await response.json();
        setUsers(users.map(u => (u.id === userId ? updatedUser : u)));
        notify('Rol actualizado con éxito.', 'success');
    } catch (err) {
        notify(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
      if (!window.confirm('¿Seguro que quieres eliminar a este usuario?')) return;
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.status !== 204 && !response.ok) throw new Error('No se pudo eliminar el usuario.');
          setUsers(users.filter(u => u.id !== userId));
          notify('Usuario eliminado.', 'success');
      } catch (err) {
          notify(`Error: ${err.message}`, 'error');
      }
  };

  if (loading) return <Spinner message="Cargando usuarios..." />;

  return (
    <div>
      <div className="admin-header">
        <h1>Gestión de Usuarios</h1>
      </div>

      {error && <h2 className="error-message" style={{marginBottom: '1rem'}}>Error: {error}</h2>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user.id}>
                <td title={user.id}>{user.id ? user.id.slice(-6) : 'N/A'}...</td>
                <td>{user.name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="actions-cell">
                  <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{textAlign: 'center'}}>No hay usuarios para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;