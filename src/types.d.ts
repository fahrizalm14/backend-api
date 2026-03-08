declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    HOST?: string;
    DEPLOYMENT_TARGET?: string;
    HTTP_SERVER?: 'express' | 'fastify';
    JWT_SECRET?: string;
  }
}
