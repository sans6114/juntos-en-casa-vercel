export const siteConfig = {
  // Información básica del sitio
  title: "Juntos en Casa - Conferencia Cristiana 2025",
  description: "Únete a nuestra conferencia cristiana de jóvenes y adolescentes, con oradores increíbles, adoración y unidad. 26 de septiembre 2025.",
  
  // SEO Meta
  siteName: "Juntos en Casa",
  siteUrl: "https://juntosencasaivs.netlify.app/ ", // Cambia por tu dominio
  locale: "es-AR",
  
  // Autor/Organización
  author: {
    name: "Iglesia Vida Sobrenatural",
    email: "contacto@juntosencasa.com",
    url: "https://tu-dominio.com"
  },
  
  // Social Media
  social: {
    instagram: "https://www.instagram.com/juntosencasa.ivs/",
    youtube: "https://www.youtube.com/@vidasobrenatural"
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    siteName: "Juntos en Casa",
    title: "Conferencia Cristiana 2025 - Juntos en Casa",
    description: "Únete a nuestra conferencia cristiana anual con oradores inspiradores, adoración y comunión. 26 de septiembre 2025.",
    image: "/logos/logonegro.png", // Imagen 1200x630px
    imageAlt: "Conferencia Juntos en Casa 2025"
  },
  
  
  // Evento específico
  event: {
    name: "Conferencia Juntos en Casa 2025",
    date: "2025-09-26",
    time: "19:30",
    timezone: "America/Argentina/Buenos_Aires",
    location: {
      name: "Centro de Convenciones [Nombre]",
      address: "Dirección completa, Ciudad, Provincia",
      coordinates: {
        lat: -34.6037, // Coordenadas de ejemplo (Buenos Aires)
        lng: -58.3816
      }
    },
    organizer: "Iglesia Vida Sobrenatural",
    price: "Entrada gratuita",
    category: "Religión y Espiritualidad"
  },
  
};

// Tipos TypeScript para mejor autocompletado
export type SiteConfig = typeof siteConfig;