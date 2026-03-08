import { availableModules, resolveDeploymentTarget } from '@/config/deployment.config';
import type { ModuleDefinition } from '@/core/http/types';
import { Logger } from '@/shared/utils/logger';

export async function loadConfiguredModules(
  targetName: string,
  logger: Logger,
): Promise<ModuleDefinition[]> {
  const modules: ModuleDefinition[] = [];
  const resolved = resolveDeploymentTarget(targetName);
  const entries = resolved.target.modules;

  if (resolved.targetName !== targetName) {
    logger.error(
      `DEPLOYMENT_TARGET "${targetName}" not found. Fallback to "${resolved.targetName}".`,
    );
  }

  for (const entry of entries) {
    const moduleName = entry;
    const loader = availableModules[moduleName];
    if (!loader) {
      logger.error(`Module loader not found: ${moduleName}`);
      continue;
    }

    const factory = await loader();
    const result = factory();
    modules.push({
      prefix: `/${moduleName}`,
      routes: result.routes,
    });
  }

  return modules;
}
