import { strict as assert } from "node:assert";
import test from "node:test";

import {
  availableModules,
  deploymentTargets,
  resolveDeploymentTarget,
} from "./deployment.config";

test("deployment.config memiliki target public-api dan module auth/projects", () => {
  assert.ok(Array.isArray(deploymentTargets["public-api"].modules));
  assert.ok(deploymentTargets["public-api"].modules.includes("auth"));
  assert.ok(deploymentTargets["public-api"].modules.includes("projects"));
  assert.equal(deploymentTargets.worker.port, 2020);
  assert.equal(typeof availableModules.auth, "function");
  assert.equal(typeof availableModules.projects, "function");
});

test("resolveDeploymentTarget fallback ke public-api bila target tidak dikenal", () => {
  const resolved = resolveDeploymentTarget("unknown-target");
  assert.equal(resolved.targetName, "public-api");
});
