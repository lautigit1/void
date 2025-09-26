// En FRONTEND/src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useNotify } from '@/context/NotificationContext'; // <-- ¡PASO 1: Importamos el hook para notificar!

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// --- Lógica para obtener el carrito (sin cambios) ---
const fetchCart = async () => {
  const token = localStorage.getItem('authToken');
  let guestId = localStorage.getItem('guestSessionId');
  if (!guestId && !token) {
    return { items: [], user_id: null, guest_session_id: null };
  }

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (guestId) {
    headers['X-Guest-Session-ID'] = guestId;
  }

  try {
    const { data } = await axios.get('http://localhost:8000/api/cart/', { headers });
    return data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { items: [], user_id: null, guest_session_id: null };
  }
};

// --- Lógica para añadir un item (sin cambios) ---
const addItemApi = async (item) => {
  const token = localStorage.getItem('authToken');
  let guestId = localStorage.getItem('guestSessionId');
  if (!guestId && !token) {
      guestId = uuidv4();
      localStorage.setItem('guestSessionId', guestId);
  }
  
  const headers = { 'X-Guest-Session-ID': guestId };
  if (token) {
      headers.Authorization = `Bearer ${token}`;
  }

  const { data } = await api.post('/cart/items', item, { headers });
  return data;
};

// --- Lógica para eliminar un item (sin cambios) ---
const removeItemApi = async (variante_id) => {
  const token = localStorage.getItem('authToken');
  const guestId = localStorage.getItem('guestSessionId');
  
  const headers = {};
  if (token) {
      headers.Authorization = `Bearer ${token}`;
  } else if (guestId) {
      headers['X-Guest-Session-ID'] = guestId;
  }

  const { data } = await axios.delete(`http://localhost:8000/api/cart/items/${variante_id}`, { headers });
  return data;
};


// --- El Hook Campeón (AHORA CON NOTIFICACIONES) ---
export const useCart = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotify(); // <-- ¡PASO 2: Traemos la función para notificar!

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  const { mutate: addItem, isPending: isAddingItem } = useMutation({
    mutationFn: addItemApi,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      // No necesitamos un toast acá porque ya lo muestra el modal de "Item Added"
    },
    onError: () => {
        notify('Error al agregar el producto', 'error');
    }
  });

  const { mutate: removeItem, isPending: isRemovingItem } = useMutation({
    mutationFn: removeItemApi,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      // --- ¡PASO 3: LA MAGIA! Llamamos al toast cuando se borra algo ---
      notify('Producto eliminado del carrito', 'success');
    },
    onError: () => {
        notify('Error al eliminar el producto', 'error');
    }
  });

  return {
    cart,
    isLoading,
    error,
    addItem,
    isAddingItem,
    removeItem,
    isRemovingItem,
  };
};