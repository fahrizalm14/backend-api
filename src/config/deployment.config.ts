import type { ModuleFactory } from '@/core/http/types';

type ModuleLoader = () => Promise<ModuleFactory>;

export const availableModules: Record<string, ModuleLoader> = {
  projects: async () => (await import('@/modules/projects/projects.routes')).default,
};

type AvailableModuleName = keyof typeof availableModules;

export type ModuleEntry =
  | AvailableModuleName
  | {
      name: AvailableModuleName;
      prefix?: string;
    };

export interface DeploymentTarget {
  port: number;
  modules: ModuleEntry[];
}

export const deploymentTargets: Record<string, DeploymentTarget> = {
  'public-api': {
    port: 2001,
    modules: ['projects'],
  },
  'internal-api': {
    port: 2002,
    modules: [],
  },
  worker: {
    port: 2020,
    modules: [],
  },
};

export function resolveDeploymentTarget(targetName?: string): {
  targetName: string;
  target: DeploymentTarget;
} {
  const fallbackName = 'public-api';
  const resolvedName = targetName && deploymentTargets[targetName]
    ? targetName
    : fallbackName;

  return {
    targetName: resolvedName,
    target: deploymentTargets[resolvedName],
  };
}
