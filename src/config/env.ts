import 'dotenv/config';

export interface Env {
  PORT: number;
  HOST: string;
  DEPLOYMENT_TARGET: string;
  HTTP_SERVER: 'express' | 'fastify';
  JWT_SECRET: string;
}

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value ?? '2001');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2001;
};

const parseHttpServer = (
  value: string | undefined,
): 'express' | 'fastify' => {
  return value === 'fastify' ? 'fastify' : 'express';
};

export const env: Env = {
  PORT: parsePort(process.env.PORT),
  HOST: process.env.HOST ?? '0.0.0.0',
  DEPLOYMENT_TARGET: process.env.DEPLOYMENT_TARGET ?? 'public-api',
  HTTP_SERVER: parseHttpServer(process.env.HTTP_SERVER),
  JWT_SECRET: process.env.JWT_SECRET ?? 'replace-me',
};
