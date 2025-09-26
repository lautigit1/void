// En FRONTEND/src/pages/AdminProductFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/services/api';

const fetchProduct = async (productId) => {
  if (!productId) return null;
  const { data } = await axiosClient.get(`/products/${productId}`);
  return data;
};

const createOrUpdateProduct = async ({ productId, formData }) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  if (productId) {
    const { data } = await axiosClient.put(`/admin/products/${productId}`, formData, config);
    return data;
  } else {
    const { data } = await axiosClient.post('/admin/products', formData, config);
    return data;
  }
};

const AdminProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(productId);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    sku: '',
    stock: '',
    categoria_id: 1,
  });
  const [imageFile, setImageFile] = useState(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
    enabled: isEditing,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        sku: product.sku || '',
        stock: product.stock || '',
        categoria_id: product.categoria_id || 1,
      });
    }
  }, [product]);
  
  const mutation = useMutation({
    mutationFn: createOrUpdateProduct,
    onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ['adminProducts']});
        navigate('/admin/products');
    },
    onError: (error) => {
        alert("Error: " + error.response?.data?.detail);
    }
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    if(imageFile) {
        data.append('file', imageFile);
    }

    for (const key in formData) {
      data.append(key, formData[key]);
    }
    
    mutation.mutate({ productId, formData: data });
  };

  if (isLoading) return <p>Cargando producto...</p>;

  return (
    <div>
      <h1>{isEditing ? 'Editar Producto' : 'Crear Producto'}</h1>
      <form onSubmit={handleSubmit}>
        {/* ...inputs para los datos del producto... */}
        <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" />
        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" />
        <input name="precio" type="number" value={formData.precio} onChange={handleChange} placeholder="Precio" />
        <input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU" />
        <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stock" />
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
};

export default AdminProductFormPage;