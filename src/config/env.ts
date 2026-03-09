import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

import {
  envTargetRules,
  getEnvFileForTarget,
  resolveEnvTargetName,
  type EnvTargetName,
} from '@/config/envTargetRules';

const DEFAULT_JWT_SECRET = 'replace-me';

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
  REFRESH_TOKEN_COOKIE_NAME: string;
  REFRESH_TOKEN_TTL_DAYS: number;
  NODE_ENV: 'development' | 'test' | 'production';
  IS_PRODUCTION: boolean;
  ENV_SOURCE: 'root' | 'service' | 'none';
  ENV_FILE_LOADED: string | null;
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

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseNodeEnv = (
  value: string | undefined,
): 'development' | 'test' | 'production' => {
  if (value === 'test' || value === 'production') {
    return value;
  }

  return 'development';
};

function loadEnvForCurrentTarget(): {
  targetName: EnvTargetName;
  source: 'root' | 'service' | 'none';
  loadedFile: string | null;
} {
  const targetName = resolveEnvTargetName(process.env.DEPLOYMENT_TARGET);
  const cwd = process.cwd();
  const nodeEnv = parseNodeEnv(process.env.NODE_ENV);

  const explicitEnvFile = process.env.ENV_FILE;
  const candidate = explicitEnvFile
    ? path.resolve(cwd, explicitEnvFile)
    : nodeEnv === 'production'
      ? path.resolve(cwd, '.env')
      : path.resolve(cwd, getEnvFileForTarget(targetName));

  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: true, quiet: true });
    return {
      targetName,
      source: nodeEnv === 'production' ? 'root' : 'service',
      loadedFile: path.relative(cwd, candidate),
    };
  }

  return {
    targetName,
    source: 'none',
    loadedFile: null,
  };
}

const loadedEnv = loadEnvForCurrentTarget();

export const env: Env = {
  PORT: parsePort(process.env.PORT),
  HOST: process.env.HOST ?? '0.0.0.0',
  DEPLOYMENT_TARGET: loadedEnv.targetName,
  HTTP_SERVER: parseHttpServer(process.env.HTTP_SERVER),
  JWT_SECRET: process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  CORS_ALLOWED_ORIGINS: parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS),
  REFRESH_TOKEN_COOKIE_NAME: process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'refresh_token',
  REFRESH_TOKEN_TTL_DAYS: parsePositiveInteger(process.env.REFRESH_TOKEN_TTL_DAYS, 30),
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
  IS_PRODUCTION: parseNodeEnv(process.env.NODE_ENV) === 'production',
  ENV_SOURCE: loadedEnv.source,
  ENV_FILE_LOADED: loadedEnv.loadedFile,
};

export function assertSecurityEnv(targetName: string): void {
  const resolvedTarget = resolveEnvTargetName(targetName);
  if (!env.ENV_FILE_LOADED) {
    throw new Error(
      `Env file is required but not found for target "${resolvedTarget}". Expected source: ${env.ENV_SOURCE}.`,
    );
  }

  const rule = envTargetRules[resolvedTarget];

  for (const key of rule.requiredVars) {
    const value = process.env[key];
    if (!value || value.trim().length === 0) {
      throw new Error(
        `Missing required env "${key}" for target "${resolvedTarget}". Env source: ${env.ENV_SOURCE}. Loaded file: ${env.ENV_FILE_LOADED ?? '(none)'}.`,
      );
    }
  }

  if (resolvedTarget === 'public-api' && env.JWT_SECRET === DEFAULT_JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not configured. Set a strong JWT_SECRET before running public-api.',
    );
  }
}
