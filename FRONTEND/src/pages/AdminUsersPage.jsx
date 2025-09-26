// En FRONTEND/src/pages/AdminUsersPage.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, updateAdminUserRole } from '@/services/api';

const AdminUsersPage = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAdminUsers,
  });

  const roleMutation = useMutation({
    mutationFn: updateAdminUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err) => {
      alert(`Error al cambiar el rol: ${err.response?.data?.detail || err.message}`);
    }
  });

  const handleRoleChange = (userId, newRole) => {
    if (!userId) {
        alert("Error: ID de usuario no encontrado.");
        return;
    }
    roleMutation.mutate({ userId, role: newRole });
  };

  if (isLoading) return <p>Cargando usuarios...</p>;
  if (isError) return <p className="error-message">Error al cargar usuarios: {error.message}</p>;

  return (
    <div>
      <div className="admin-header">
        <h1>Gestión de Usuarios</h1>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.map(user => (
            <tr key={user.id || user.email}>
              <td title={user.id || 'ID no disponible'}>
                {user.id ? `${user.id.slice(-6)}...` : 'N/A'}
              </td>
              <td>{`${user.name} ${user.last_name}`}</td>
              <td>{user.email}</td>
              <td>
                <select 
                  value={user.role} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={roleMutation.isPending || !user.id}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;