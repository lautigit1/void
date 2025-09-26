// En FRONTEND/src/context/CartContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { NotificationContext } from './NotificationContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const guestId = localStorage.getItem('guest_session_id');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (guestId) {
      headers['X-Guest-Session-ID'] = guestId;
    }
    return headers;
  };

  const fetchCart = async () => {
    try {
      let guestId = localStorage.getItem('guest_session_id');
      if (!token && !guestId) {
        const res = await fetch('http://127.0.0.1:8000/api/cart/session/guest');
        if (!res.ok) throw new Error('No se pudo crear sesión de invitado.');
        const data = await res.json();
        guestId = data.guest_session_id;
        localStorage.setItem('guest_session_id', guestId);
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/cart/', { headers: getHeaders() });
      if (!response.ok) throw new Error('No se pudo obtener el carrito.');
      const cartData = await response.json();
      setCart(cartData);
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
      notify('Error al cargar el carrito', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addItemToCart = async (item) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/cart/items', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error("No se pudo agregar el producto.");
      const updatedCart = await response.json();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error al agregar item:", error);
      notify(error.message, 'error');
    }
  };

  const removeItemFromCart = async (variante_id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/cart/items/${variante_id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("No se pudo eliminar el producto.");
      const updatedCart = await response.json();
      setCart(updatedCart);
      notify('Producto eliminado del carrito.', 'success');
    } catch (error) {
      console.error("Error al eliminar item:", error);
      notify(error.message, 'error');
    }
  };

  const value = {
    cart,
    loading,
    itemCount: cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0,
    addItemToCart,
    removeItemFromCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};