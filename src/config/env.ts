import 'dotenv/config';

export interface Env {
  PORT: number;
  HOST: string;
  DEPLOYMENT_TARGET: string;
  HTTP_SERVER: 'express' | 'fastify';
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DATABASE_URL: string;
  GOOGLE_CLIENT_ID: string;
  CORS_ALLOWED_ORIGINS: string[];
}

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value ?? '2001');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2001;
};

const parseHttpServer = (value: string | undefined): 'express' | 'fastify' => {
  return value === 'fastify' ? 'fastify' : 'express';
};

const parseAllowedOrigins = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const env: Env = {
  PORT: parsePort(process.env.PORT),
  HOST: process.env.HOST ?? '0.0.0.0',
  DEPLOYMENT_TARGET: process.env.DEPLOYMENT_TARGET ?? 'public-api',
  HTTP_SERVER: parseHttpServer(process.env.HTTP_SERVER),
  JWT_SECRET: process.env.JWT_SECRET ?? 'replace-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  CORS_ALLOWED_ORIGINS: parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS),
};
