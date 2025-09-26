import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from 'axios';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  // Mantenemos la lógica para traer los datos de los productos (nombre, id, etc.)
  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Traemos 6 productos para tener sus datos
        const response = await axios.get('http://localhost:8000/api/products?limit=6');
        setProducts(response.data);
      } catch (error) {
        console.error("¡Upa! No se pudieron cargar los productos:", error);
        // Si falla, al menos tendremos los placeholders
        setProducts([]);
      }
    };

    fetchProducts();

    // La animación de entrada (esto no cambia)
    gsap.to(".new-arrivals", {
      opacity: 1,
      y: 0,
      duration: 1.5,
      delay: 0.5
    });
  }, []);

  // ¡ACÁ ESTÁ LA MAGIA! Este es el cambio principal
  useEffect(() => {
    // 1. Creamos la lista de placeholders con TUS imágenes locales, que son la prioridad
    const placeholders = Array.from({ length: 6 }, (_, i) => ({
      id: `placeholder-${i}`, // Usamos un ID de placeholder
      nombre: `Producto ${i + 1}`, // Nombre por defecto
      // La fuente de la imagen es SIEMPRE la local
      urls_imagenes: `/img/Portada${i + 1}.jpg`,
    }));

    // 2. Combinamos los datos: usamos la info de la DB pero FORZAMOS la imagen local
    const finalProducts = placeholders.map((placeholder, index) => {
      const dbProduct = products[index];
      // Si existe un producto de la base de datos para esta posición...
      if (dbProduct) {
        // ...le "pisamos" la imagen. Usamos su ID y nombre, pero nuestra imagen local.
        return {
          ...dbProduct, // Mantenemos id, nombre, precio, etc.
          urls_imagenes: placeholder.urls_imagenes, // ¡PERO la imagen es la local!
        };
      }
      // Si no hay producto de la DB, usamos el placeholder completo
      return placeholder;
    });

    setDisplayProducts(finalProducts);
  }, [products]); // Este efecto se ejecuta cuando llegan los productos de la API


  // La animación de los productos (esto no cambia)
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
      <section className="hero-section">
        <div className="hero-image-left">
          <img src="/img/PortadaIzquierda.jpg" alt="Modelo con prenda vanguardista" />
        </div>
        <div className="hero-image-right">
          <img src="/img/PortadaDerecha.jpg" alt="Modelo con traje sastre oscuro" />
        </div>
      </section>

      <section className="new-arrivals">
        <div className="title-the-new-container">
          <h2 className="title-the-new-text">THE NEW</h2>
          <div className="title-the-new-line"></div>
        </div>

        <div className="product-grid">
          {displayProducts.map(product => (
            <div className="product-card" key={product.id}>
              <img
                // AHORA ESTO SIEMPRE VA A SER UNA RUTA LOCAL, COMO "/img/Portada6.jpg"
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