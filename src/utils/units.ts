import type { UnitSystem } from '../types/scene';

/** Exact conversion factors from meters (display-boundary only). */
export const METERS_TO_FEET = 3.280839895;
export const METERS_TO_INCHES = 39.3700787;

/** Metric distance readout, e.g. `"6.26 m"`. */
export function formatMeters(meters: number): string {
  return `${meters.toFixed(2)} m`;
}

/**
 * Imperial feet+inches readout from a metric length.
 * Converts to total inches, rounds to the nearest inch, e.g. `"20' 6\""`.
 */
export function formatFeetInches(meters: number): string {
  const totalInches = Math.round(Math.abs(meters) * METERS_TO_INCHES);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const sign = meters < 0 ? '-' : '';
  return `${sign}${feet}' ${inches}"`;
}

/** Format a distance using the active unit system. */
export function formatDistance(meters: number, unit: UnitSystem): string {
  return unit === 'imperial' ? formatFeetInches(meters) : formatMeters(meters);
}

/** Format a single axis coordinate using the active unit system. */
export function formatCoordinate(meters: number, unit: UnitSystem): string {
  return formatDistance(meters, unit);
}

/** Opposite unit system for secondary / dual readouts. */
export function oppositeUnit(unit: UnitSystem): UnitSystem {
  return unit === 'imperial' ? 'metric' : 'imperial';
}
