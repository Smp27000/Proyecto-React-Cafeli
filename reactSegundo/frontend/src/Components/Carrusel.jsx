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
    <section className="w-full max-w-[600px] mx-auto p-4 sm:p-5 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white font-sans">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-stone-400 uppercase tracking-[0.18em] text-xs">
            Galería destacada
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black leading-tight font-serif">
            10 imágenes inspiradoras
          </h2>
        </div>
      </div>

      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] rounded-3xl overflow-hidden bg-stone-950 shadow-inner">
        {images.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.caption}
            className={`absolute inset-0 w-full h-full object-cover block transition-all duration-700 ease-out ${
              index === currentSlide
                ? 'opacity-100 scale-100 z-20'
                : 'opacity-0 scale-105 z-10'
            }`}
          />
        ))}

        <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/50 backdrop-blur-md text-base font-medium z-30 border border-white/10">
          {images[currentSlide].caption}
        </div>

        <div className="absolute top-1/2 w-full flex justify-between -translate-y-1/2 px-3 pointer-events-none z-30">
          <button
            type="button"
            onClick={previous}
            aria-label="Anterior"
            className="pointer-events-auto border-none bg-white/20 hover:bg-white/30 text-white cursor-pointer p-3.5 rounded-full text-lg shadow-lg shadow-black/40 hover:scale-110 transition-all duration-200 backdrop-blur-md border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente"
            className="pointer-events-auto border-none bg-white/20 hover:bg-white/30 text-white cursor-pointer p-3.5 rounded-full text-lg shadow-lg shadow-black/40 hover:scale-110 transition-all duration-200 backdrop-blur-md border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-2.5">
        {images.map((_, index) => {
          const active = index === currentSlide
          return (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={`h-2.5 w-2.5 rounded-full border cursor-pointer transition-all duration-300 ${
                active
                  ? 'scale-125 bg-gradient-to-r from-amber-400 to-amber-300 border-amber-300 shadow-lg shadow-amber-400/40'
                  : 'bg-white/15 border-white/40 hover:bg-white/30 hover:scale-110'
              }`}
            />
          )
        })}
      </div>
    </section>
  )
}

export default Carrusel
