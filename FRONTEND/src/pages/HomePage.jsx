import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  
  useEffect(() => {
    // CAMBIO: Usamos una animación más simple para probar
    gsap.to(".new-arrivals", {
      opacity: 1, // La hacemos visible
      y: 0, // La movemos a su posición final
      duration: 1.5, // Le damos una duración para verla bien
      delay: 0.5 // Esperamos medio segundo antes de empezar
    });
    
  }, []);

  return (
    <main>
      {/* Sección de la portada */}
      <section className="hero-section">
        <div className="hero-image-left">
          <img src="/img/PortadaIzquierda.jpg" alt="Modelo con prenda vanguardista" />
        </div>
        <div className="hero-image-right">
          <img src="/img/PortadaDerecha.jpg" alt="Modelo con traje sastre oscuro" />
        </div>
      </section>

      {/* Sección de nuevos productos */}
      <section className="new-arrivals">
        <div className="section-title-container">
          <h2 className="section-title">THE NEW</h2>
          <div className="title-line"></div>
        </div>

        {/* Grilla de productos con la estructura correcta */}
        <div className="product-grid">
          <div className="product-card">
            <img src="/img/Portada1.jpg" alt="Producto 1" />
          </div>
          <div className="product-card">
            <img src="/img/Portada2.jpg" alt="Producto 2" />
          </div>
          <div className="product-card">
            <img src="/img/Portada3.jpg" alt="Producto 3" />
          </div>
          <div className="product-card">
            <img src="/img/Portada4.jpg" alt="Producto 4" />
          </div>
          <div className="product-card">
            <img src="/img/Portada5.jpg" alt="Producto 5" />
          </div>
          <div className="product-card">
            <img src="/img/Portada6.jpg" alt="Producto 6" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;