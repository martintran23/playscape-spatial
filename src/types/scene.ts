/** Global unit convention for the playground staging sandbox. */
export type UnitSystem = 'metric' | 'imperial';

/** Plain XYZ tuple used by scene graph / persistence layers (1 unit = 1 meter in metric). */
export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}
