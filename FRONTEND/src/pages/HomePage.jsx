import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from 'axios';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);

  // useEffect para ir a buscar los datos a la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products?limit=6');
        setProducts(response.data);
      } catch (error) {
        console.error("¡Upa! No se pudieron cargar los productos:", error);
        // Si hay un error, preparamos un array vacío para que se usen las imágenes estáticas
        setProducts([]);
      }
    };

    fetchProducts();

    gsap.to(".new-arrivals", {
      opacity: 1,
      y: 0,
      duration: 1.5,
      delay: 0.5
    });
  }, []);

  // useEffect para construir la lista de 6 productos a mostrar
  useEffect(() => {
    const placeholders = Array.from({ length: 6 }, (_, i) => ({
      id: `placeholder-${i + 1}`,
      nombre: `Producto de Muestra ${i + 1}`,
      // ¡Acá está la clave! Usamos tus imágenes estáticas como base
      urls_imagenes: `/img/Portada${i + 1}.jpg`,
    }));

    // Reemplazamos los placeholders con los productos reales que llegaron de la API
    const finalProducts = placeholders.map((placeholder, index) => {
      if (products[index]) {
        // Si el producto de la API no tiene imagen, MANTIENE la de placeholder.
        return {
          ...products[index],
          urls_imagenes: products[index].urls_imagenes || placeholder.urls_imagenes,
        };
      }
      return placeholder;
    });

    setDisplayProducts(finalProducts);
  }, [products]); // Se ejecuta cuando los 'products' de la API están listos

  // useEffect para las animaciones, se activa cuando la lista final está lista
  useEffect(() => {
    if (displayProducts.length > 0) {
      gsap.fromTo(".product-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".product-grid",
            start: "top 80%",
          }
        }
      );
    }
  }, [displayProducts]);

  return (
    <main>
      {/* Sección de la portada (sin cambios) */}
      <section className="hero-section">
        <div className="hero-image-left">
          <img src="/img/PortadaIzquierda.jpg" alt="Modelo con prenda vanguardista" />
        </div>
        <div className="hero-image-right">
          <img src="/img/PortadaDerecha.jpg" alt="Modelo con traje sastre oscuro" />
        </div>
      </section>

      <section className="new-arrivals">
        <div className="section-title-container">
          <h2 className="section-title">THE NEW</h2>
          <div className="title-line"></div>
        </div>

        <div className="product-grid">
          {/* Mapeamos la lista final de 6 productos */}
          {displayProducts.map(product => (
            <div className="product-card" key={product.id}>
              <img
                src={product.urls_imagenes}
                alt={product.nombre}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;