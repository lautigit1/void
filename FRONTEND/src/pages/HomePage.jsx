import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from 'axios';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products?limit=6');
        setProducts(response.data);
      } catch (error) {
        console.error("¡Upa! No se pudieron cargar los productos:", error);
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

  useEffect(() => {
    const placeholders = Array.from({ length: 6 }, (_, i) => ({
      id: `placeholder-${i + 1}`,
      nombre: `Producto de Muestra ${i + 1}`,
      urls_imagenes: `/img/Portada${i + 1}.jpg`,
    }));

    const finalProducts = placeholders.map((placeholder, index) => {
      if (products[index]) {
        return {
          ...products[index],
          urls_imagenes: products[index].urls_imagenes || placeholder.urls_imagenes,
        };
      }
      return placeholder;
    });

    setDisplayProducts(finalProducts);
  }, [products]);

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