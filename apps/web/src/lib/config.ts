// Environment variables with fallbacks for development
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
    userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
    region: import.meta.env.VITE_COGNITO_REGION || "us-east-1",
  },
};
