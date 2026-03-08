declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    HOST?: string;
    DEPLOYMENT_TARGET?: string;
    HTTP_SERVER?: 'express' | 'fastify';
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    DATABASE_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    CORS_ALLOWED_ORIGINS?: string;
  }
}
