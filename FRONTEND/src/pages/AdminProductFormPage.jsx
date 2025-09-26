// En FRONTEND/src/pages/AdminProductFormPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import Spinner from '../components/common/Spinner';

const AdminProductFormPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { notify } = useContext(NotificationContext);

    const [productData, setProductData] = useState({
        nombre: '',
        descripcion: '',
        precio: 0,
        sku: '',
        stock: 0,
        categoria_id: 1,
        material: '',
        talle: '',
        color: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const isEditing = Boolean(productId);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}`);
                    if (!response.ok) throw new Error('No se pudo cargar el producto.');
                    const data = await response.json();
                    setProductData({
                        nombre: data.nombre || '',
                        descripcion: data.descripcion || '',
                        precio: data.precio || 0,
                        sku: data.sku || '',
                        stock: data.stock || 0,
                        categoria_id: data.categoria_id || 1,
                        material: data.material || '',
                        talle: data.talle || '',
                        color: data.color || '',
                    });
                    setExistingImages(data.urls_imagenes || []);
                } catch (err) {
                    notify(err.message, 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [productId, isEditing, notify]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setProductData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 3) {
            notify('Solo puedes subir hasta 3 imágenes nuevas.', 'error');
            e.target.value = null;
            return;
        }
        setImageFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        for (const key in productData) {
            formData.append(key, productData[key]);
        }
        imageFiles.forEach(file => {
            formData.append('images', file);
        });
        
        if (isEditing) {
            formData.append('existing_images_json', JSON.stringify(existingImages));
        }

        const url = isEditing ? `http://127.0.0.1:8000/api/products/${productId}` : 'http://127.0.0.1:8000/api/products/';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ocurrió un error.');
            }
            notify(`Producto ${isEditing ? 'actualizado' : 'creado'} con éxito!`, 'success');
            navigate('/admin/products');
        } catch (err) {
            notify(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (isEditing && loading) return <Spinner message="Cargando producto..." />;

    return (
        <div>
          <h1>{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h1>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              {Object.keys(productData).map(key => (
                <div className="form-group" key={key}>
                  <label htmlFor={key}>{key.replace(/_/g, ' ').toUpperCase()}</label>
                  <input
                    type={key.includes('precio') || key.includes('stock') || key.includes('id') ? 'number' : 'text'}
                    id={key}
                    name={key}
                    value={productData[key]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
            </div>
    
            <div className="form-group" style={{gridColumn: '1 / -1', marginTop: '1rem'}}>
                <label htmlFor="images">AÑADIR IMÁGENES (hasta 3)</label>
                <input type="file" id="images" name="images" multiple accept="image/*" onChange={handleFileChange} />
                {isEditing && existingImages.length > 0 && (
                    <div style={{marginTop: '10px'}}>
                        <p>Imágenes actuales:</p>
                        <div style={{display: 'flex', gap: '10px'}}>
                            {existingImages.map(img => <img key={img} src={img} alt="preview" width="60" style={{border: '1px solid #ddd'}}/>)}
                        </div>
                    </div>
                )}
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </form>
        </div>
      );
};

export default AdminProductFormPage;