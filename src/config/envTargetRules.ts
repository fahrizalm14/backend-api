export type EnvTargetName = 'public-api' | 'internal-api' | 'worker';

export interface EnvTargetRule {
  requiredVars: readonly string[];
  optionalVars?: readonly string[];
}

const sharedOptionalVars = [
  'PORT',
  'HOST',
  'HTTP_SERVER',
  'CORS_ALLOWED_ORIGINS',
  'REFRESH_TOKEN_COOKIE_NAME',
  'REFRESH_TOKEN_TTL_DAYS',
  'JWT_EXPIRES_IN',
] as const;

export const envTargetRules: Record<EnvTargetName, EnvTargetRule> = {
  'public-api': {
    requiredVars: ['JWT_SECRET', 'DATABASE_URL'],
    optionalVars: [...sharedOptionalVars, 'GOOGLE_CLIENT_ID'],
  },
  'internal-api': {
    requiredVars: [],
    optionalVars: sharedOptionalVars,
  },
  worker: {
    requiredVars: [],
    optionalVars: sharedOptionalVars,
  },
};

export function resolveEnvTargetName(value: string | undefined): EnvTargetName {
  if (value === 'internal-api' || value === 'worker' || value === 'public-api') {
    return value;
  }

  return 'public-api';
}

// Central setup: service -> env file.
export const envFileMap: Record<EnvTargetName, string> = {
  'public-api': 'env/public-api.env',
  'internal-api': 'env/internal-api.env',
  worker: 'env/worker.env',
};

export function getEnvFileForTarget(target: EnvTargetName): string {
  return envFileMap[target];
}
