// Configuration for API endpoints
export const config = {
  // DigitalOcean backend URL
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://portal.aurafarming.co/api',
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://portal.aurafarming.co',
  
  // API endpoints
  endpoints: {
    checkUsername: '/check-username',
    register: '/register',
    health: '/health'
  }
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string) => {
  return `${config.API_BASE_URL}${endpoint}`;
}; 