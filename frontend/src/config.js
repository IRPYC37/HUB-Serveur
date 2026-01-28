// Configuration de l'API backend
// Utilise la variable d'environnement VITE_API_URL
// En développement: http://localhost:3001
// En production: https://hub-api.cyprienfournier.com

const API_URL = import.meta.env.VITE_API_URL || "https://hub-api.cyprienfournier.com";

export default API_URL;
