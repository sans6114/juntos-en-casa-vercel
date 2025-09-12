export const siteConfig = {
  // Información básica del sitio
  title: "Juntos en Casa - Conferencia Cristiana 2025",
  description: "Únete a nuestra conferencia cristiana de jovenes y adolescentes, con oradores increibles, adoración y unidad. 26 de septiembre 2025.",
  
  // SEO Meta
  siteName: "Juntos en Casa",
  siteUrl: "https://tu-dominio.com", // Cambia por tu dominio
  locale: "es-AR",
  
  // Autor/Organización
  author: {
    name: "Iglesia Juntos en Casa",
    email: "contacto@juntosencasa.com",
    url: "https://tu-dominio.com"
  },
  
  // Social Media
  social: {
    twitter: "@juntosencasa",
    facebook: "https://facebook.com/juntosencasa",
    instagram: "https://instagram.com/juntosencasa",
    youtube: "https://youtube.com/@juntosencasa"
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    siteName: "Juntos en Casa",
    title: "Conferencia Cristiana 2025 - Juntos en Casa",
    description: "Únete a nuestra conferencia cristiana anual con oradores inspiradores, adoración y comunión. 26 de septiembre 2025.",
    image: "/og-image.jpg", // Imagen 1200x630px
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
    organizer: "Iglesia Juntos en Casa",
    price: "Entrada gratuita", // o "AR$ 1500"
    category: "Religión y Espiritualidad"
  },
  
};

// Tipos TypeScript para mejor autocompletado
export type SiteConfig = typeof siteConfig;