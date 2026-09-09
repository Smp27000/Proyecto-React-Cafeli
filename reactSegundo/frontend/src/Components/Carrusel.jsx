import { useEffect, useState } from 'react'
import img1 from '../img/img-coffe1.jpg'
import img2 from '../img/img-coffe2.jpg'
import img3 from '../img/img-coffe3.jpg'
import img4 from '../img/img-coffe4.jpg'
import img5 from '../img/img-coffe5.jpg'
import img6 from '../img/img-coffe6.jpg'
import img7 from '../img/img-coffe7.jpg'
import img8 from '../img/img-coffe8.jpg'
import img9 from '../img/img-coffe9.jpg'
import img10 from '../img/img-coffe10.jpg'


const images = [
  { src: img1, caption: 'Aroma Andino' },
  { src: img2, caption: 'Cumbre Cafetera' },
  { src: img3, caption: 'Grano Dorado' },
  { src: img4, caption: 'Risaralda Orgánico' },
  { src: img5, caption: 'Orgánico de Altura' },
  { src: img6, caption: 'Montaña Sagrada' },
  { src: img7, caption: 'Finca Paraiso' },
  { src: img8, caption: 'Cordillera Excelsa' },
  { src: img9, caption: 'Montaña Real' },
  { src: img10, caption: 'Café Tierra Alta' },
]

const styles = {
  carousel: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1rem',
    borderRadius: '22px',
    overflow: 'hidden',
    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
    background: 'linear-gradient(180deg, #111 0%, #1a1a1a 100%)',
    color: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  viewport: {
    position: 'relative',
    width: '100%',
    height: '500px', // Altura fija y firme para la caja
    borderRadius: '18px',
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Hace que la imagen llene la caja sin deformarse
    display: 'block',
    transition: 'opacity 0.8s ease',
  },
  caption: {
    position: 'absolute',
    bottom: '18px',
    left: '18px',
    right: '18px',
    padding: '14px 18px',
    borderRadius: '16px',
    background: 'rgba(10, 10, 10, 0.55)',
    backdropFilter: 'blur(10px)',
    fontSize: '1rem',
    fontWeight: '500',
    zIndex: 3, // Asegura que esté por encima de las imágenes
  },
  controls: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    transform: 'translateY(-50%)',
    padding: '0 12px',
    pointerEvents: 'none',
    zIndex: 3, // Asegura que esté por encima de las imágenes
  },
  button: {
    pointerEvents: 'auto',
    border: 'none',
    background: 'rgba(0, 0, 0, 0.45)',
    color: '#fff',
    cursor: 'pointer',
    padding: '0.9rem 1rem',
    borderRadius: '999px',
    fontSize: '1.1rem',
    boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s ease, background 0.2s ease',
  },
  buttonHover: {
    transform: 'scale(1.05)',
    background: 'rgba(255, 255, 255, 0.12)',
  },
  pager: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.5)',
    background: 'rgba(255,255,255,0.18)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background 0.2s ease',
  },
  dotActive: {
    background: '#ffe9b0',
    transform: 'scale(1.2)',
    borderColor: '#ffe9b0',
  },
}

function Carrusel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  function goTo(index) {
    setCurrentSlide(index)
  }

  function previous() {
    setCurrentSlide((previous) => (previous - 1 + images.length) % images.length)
  }

  function next() {
    setCurrentSlide((previous) => (previous + 1) % images.length)
  }

  return (
    <section style={styles.carousel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <p style={{ margin: 0, color: '#8f8f8f', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.8rem' }}>
            Galería destacada
          </p>
          <h2 style={{ margin: '8px 0 0', fontSize: '2rem', lineHeight: '1.05' }}>
            10 imágenes inspiradoras
          </h2>
        </div>
      </div>

      <div style={styles.viewport}>
        {images.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.caption}
            style={{
              ...styles.image,
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: index === currentSlide ? 1 : 0,
              zIndex: index === currentSlide ? 2 : 1,
            }}
          />
        ))}

        <div style={styles.caption}>{images[currentSlide].caption}</div>

        <div style={styles.controls}>
          <button type="button" onClick={previous} style={styles.button} aria-label="Anterior">
            ‹
          </button>
          <button type="button" onClick={next} style={styles.button} aria-label="Siguiente">
            ›
          </button>
        </div>
      </div>

      <div style={styles.pager}>
        {images.map((_, index) => {
          const active = index === currentSlide
          return (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver imagen ${index + 1}`}
              style={{
                ...styles.dot,
                ...(active ? styles.dotActive : {}),
              }}
            />
          )
        })}
      </div>
    </section>
  )
}

export default Carrusel
