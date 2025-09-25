// En FRONTEND/src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Centralizamos el cliente de axios aquí por ahora
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// --- Lógica para obtener el carrito ---
const fetchCart = async () => {
  const token = localStorage.getItem('authToken');
  let guestId = localStorage.getItem('guestSessionId');
  if (!guestId && !token) {
    // Si no hay sesión de invitado ni de usuario, no hay nada que buscar.
    // Devolvemos un carrito vacío por defecto para evitar un error 404.
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
    // En caso de error (ej: carrito no encontrado), devolvemos uno vacío
    return { items: [], user_id: null, guest_session_id: null };
  }
};

// --- Lógica para añadir un item ---
const addItemApi = async (item) => {
  const token = localStorage.getItem('authToken');
  let guestId = localStorage.getItem('guestSessionId');
  if (!guestId && !token) { // Si no hay sesión, creamos una de invitado
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

// --- Lógica para eliminar un item ---
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


// --- El Hook Campeón ---
export const useCart = () => {
  const queryClient = useQueryClient();

  // Query para obtener los datos del carrito
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  // Mutación para añadir un item
  const { mutate: addItem, isPending: isAddingItem } = useMutation({
    mutationFn: addItemApi,
    onSuccess: (updatedCart) => {
      // Cuando la mutación es exitosa, invalidamos la query 'cart'
      // para que React Query la vuelva a obtener con los datos actualizados.
      queryClient.setQueryData(['cart'], updatedCart);
    },
  });

  // Mutación para eliminar un item
  const { mutate: removeItem, isPending: isRemovingItem } = useMutation({
    mutationFn: removeItemApi,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
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