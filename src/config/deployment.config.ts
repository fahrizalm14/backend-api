import type { ModuleFactory } from '@/core/http/types';

type ModuleLoader = () => Promise<ModuleFactory>;

export const availableModules = {
  auth: async () => (await import('@/modules/auth/auth.routes')).default,
  projects: async () => (await import('@/modules/projects/projects.routes')).default,
} satisfies Record<string, ModuleLoader>;

type AvailableModuleName = keyof typeof availableModules;

type ModulesTuple = readonly AvailableModuleName[];
type DeploymentTargetsShape = Record<string, { port: number; modules: ModulesTuple }>;

type IsUniqueTuple<T extends readonly unknown[], Seen = never> = T extends readonly [
  infer Head,
  ...infer Tail,
]
  ? Head extends Seen
    ? false
    : IsUniqueTuple<Tail, Seen | Head>
  : true;

type EnsureUniqueModulesPerTarget<T extends DeploymentTargetsShape> = {
  [K in keyof T]: IsUniqueTuple<T[K]['modules']> extends true ? T[K] : never;
};

function defineDeploymentTargets<const T extends DeploymentTargetsShape>(
  targets: T & EnsureUniqueModulesPerTarget<T>,
): T {
  return targets;
}

export interface DeploymentTarget {
  port: number;
  modules: readonly AvailableModuleName[];
}

export const deploymentTargets = defineDeploymentTargets({
  'public-api': {
    port: 2001,
    modules: ['auth', 'projects'],
  },
  'internal-api': {
    port: 2002,
    modules: [],
  },
  worker: {
    port: 2020,
    modules: [],
  },
});

export type DeploymentTargetName = keyof typeof deploymentTargets;

function isDeploymentTargetName(value: string): value is DeploymentTargetName {
  return Object.prototype.hasOwnProperty.call(deploymentTargets, value);
}

export function resolveDeploymentTarget(targetName?: string): {
  targetName: DeploymentTargetName;
  target: DeploymentTarget;
} {
  const fallbackName: DeploymentTargetName = 'public-api';
  const resolvedName =
    targetName && isDeploymentTargetName(targetName) ? targetName : fallbackName;

  return {
    targetName: resolvedName,
    target: deploymentTargets[resolvedName],
  };
}
