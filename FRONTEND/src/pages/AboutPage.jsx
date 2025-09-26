// En FRONTEND/src/pages/AboutPage.jsx
import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page-container">
      <div className="about-hero">
        <img src="/img/PortadaIzquierda.png" alt="Concepto de VOID" />
        <div className="about-hero-overlay">
          <h1>EL CONCEPTO DETRÁS DEL VACÍO</h1>
        </div>
      </div>
      <div className="about-content">
        <h2>Nuestra Filosofía</h2>
        <p>
          VOID no es solo una marca de indumentaria; es una declaración. Nacimos de la idea de que en la simplicidad reside la máxima sofisticación. Creemos en el poder de las siluetas puras, los materiales de alta calidad y una paleta de colores que trasciende las temporadas.
        </p>
        <p>
          Cada pieza está diseñada meticulosamente en nuestro atelier, pensando en la atemporalidad y la versatilidad. Creamos ropa para individuos que no siguen tendencias, sino que definen su propio estilo. El vacío no es ausencia, es un lienzo de posibilidades infinitas.
        </p>
        <div className="about-separator"></div>
        <h2>El Compromiso</h2>
        <p>
          Estamos comprometidos con la artesanía y la sostenibilidad. Colaboramos con pequeños talleres y seleccionamos cuidadosamente cada textil, asegurando no solo una estética impecable sino también una producción ética y responsable.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;