/**
 * Scenario Manager & Developer Utilities for Test Universe Expansion
 * Supports resetting, seeding, and switching between the 8 fan personas and edge test scenarios.
 */

import { AppState, TenantId } from '../domain/types';
import { createInitialState } from './fixtures';
import { applyPersonaToState } from './expandedUniverse';
import { resetTenantStorage, saveState } from '../services/storageAdapter';

export type ScenarioPresetKey =
  | 'newFan'
  | 'casualFan'
  | 'hallMember'
  | 'multiFandom'
  | 'collector'
  | 'longtimeFan'
  | 'commerceFan'
  | 'publicVoiceFan'
  | 'roomDense'
  | 'roomSparse'
  | 'edgeCases';

/**
 * Builds an AppState configured for a specific scenario persona.
 */
export function buildScenarioState(presetKey: ScenarioPresetKey | string, tenantId: TenantId = 'vieworld-demo'): AppState {
  const base = createInitialState(tenantId);
  const normalizedKey = presetKey
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

  if (normalizedKey === 'room-dense') {
    return applyPersonaToState(base, 'collector');
  }
  if (normalizedKey === 'room-sparse') {
    return applyPersonaToState(base, 'newFan');
  }

  return applyPersonaToState(base, presetKey);
}

/**
 * Global Dev Utility: seedDemo
 * Resets storage and seeds canonical expanded universe.
 */
export function seedDemo(tenantId: TenantId = 'vieworld-demo'): AppState {
  resetTenantStorage(tenantId);
  const initial = createInitialState(tenantId);
  saveState(initial);
  return initial;
}

/**
 * Global Dev Utility: resetDemo
 * Restores initial baseline state.
 */
export function resetDemo(tenantId: TenantId = 'vieworld-demo'): AppState {
  return seedDemo(tenantId);
}

/**
 * Global Dev Utility: loadScenario
 * Loads a specified named persona or scenario preset into storage and returns the state.
 */
export function loadScenario(preset: ScenarioPresetKey | string, tenantId: TenantId = 'vieworld-demo'): AppState {
  const scenarioState = buildScenarioState(preset, tenantId);
  saveState(scenarioState);
  return scenarioState;
}
