// En FRONTEND/src/components/admin/ProductManagement.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/hooks/axiosClient'; // Suponiendo que tienes un cliente axios configurado

// --- API Functions ---
const fetchAdminProducts = async () => {
  const { data } = await axiosClient.get('/products'); // Asumiendo endpoint público para verlos
  return data;
};

const createAdminProduct = async (formData) => {
  // El header es clave para que FastAPI entienda que es un formulario con archivos
  const { data } = await axiosClient.post('/admin/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const ProductManagement = () => {
  const queryClient = useQueryClient();
  const [productData, setProductData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    sku: '',
    stock: '',
    categoria_id: 1, // Ejemplo
  });
  const [imageFile, setImageFile] = useState(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: fetchAdminProducts,
  });

  const createProductMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      // Refresca la lista de productos después de crear uno nuevo
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      // Limpiar formulario
    },
    onError: (error) => {
      console.error("Error al crear producto:", error);
      alert("Error: " + error.response?.data?.detail);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Por favor, selecciona una imagen para el producto.");
      return;
    }

    // 1. Creamos un objeto FormData
    const formData = new FormData();

    // 2. Añadimos el archivo de imagen
    formData.append('file', imageFile);

    // 3. Añadimos el resto de los datos del producto
    for (const key in productData) {
      formData.append(key, productData[key]);
    }

    createProductMutation.mutate(formData);
  };

  return (
    <div>
      <h2>Gestión de Productos</h2>

      {/* Formulario de Creación */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h3>Crear Nuevo Producto</h3>
        {/* ... inputs para nombre, descripcion, precio, etc. ... */}
        <input type="text" name="nombre" placeholder="Nombre" onChange={handleInputChange} required />
        <input type="text" name="sku" placeholder="SKU" onChange={handleInputChange} required />
        <input type="number" name="precio" placeholder="Precio" onChange={handleInputChange} required />
        <input type="number" name="stock" placeholder="Stock" onChange={handleInputChange} required />
        <textarea name="descripcion" placeholder="Descripción" onChange={handleInputChange}></textarea>
        
        <div>
          <label>Imagen del Producto</label>
          <input type="file" onChange={handleFileChange} required accept="image/*" />
        </div>
        
        <button type="submit" disabled={createProductMutation.isPending}>
          {createProductMutation.isPending ? 'Creando...' : 'Crear Producto'}
        </button>
      </form>

      {/* Lista de Productos */}
      <h3>Productos Existentes</h3>
      {isLoading ? <p>Cargando productos...</p> : (
        <ul>
          {products?.map(p => (
            <li key={p.id}>
              <img src={p.urls_imagenes} alt={p.nombre} width="50" />
              {p.nombre} ({p.sku})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductManagement;