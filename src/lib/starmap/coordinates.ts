import { Quaternion, Vector3 } from "three";

const DEG_TO_RAD = Math.PI / 180;

// World-frame convention used throughout the star-map feature (this is the
// one thing every other file in src/lib/starmap and the render components
// must agree on): a right-handed, Y-up frame anchored at the observer,
// where +Y is straight up (zenith), +Z is due south along the horizon, and
// +X is due east along the horizon. This matches Three.js's own Y-up
// default, so the camera and scene need no extra axis remapping.
export function altAzToWorld(altitudeDeg: number, azimuthDeg: number): Vector3 {
  const altRad = altitudeDeg * DEG_TO_RAD;
  const azRad = azimuthDeg * DEG_TO_RAD;
  const cosAlt = Math.cos(altRad);
  return new Vector3(cosAlt * Math.sin(azRad), Math.sin(altRad), -cosAlt * Math.cos(azRad));
}

// Fixed-star position in the (non-rotating) equatorial reference frame,
// before the LST+latitude transform below is applied. Chosen so that the
// celestial pole (dec=+90) sits along +Y — i.e. this frame looks like the
// final world frame BEFORE Earth's rotation/the observer's latitude have
// been accounted for, which is what makes the two-rotation composition in
// buildSkyRotation below correct (rotate around Y first for hour angle,
// then tip around X to bring the pole down to the observer's actual
// latitude). Astronomical proper motion/precession are ignored — this is a
// fixed J2000 position, matching the rest of this project's stance that
// this feature isn't chasing full-ephemeris precision.
export function raDecToEquatorial(raHours: number, decDeg: number): Vector3 {
  const raRad = raHours * 15 * DEG_TO_RAD;
  const decRad = decDeg * DEG_TO_RAD;
  const cosDec = Math.cos(decRad);
  return new Vector3(cosDec * Math.sin(raRad), Math.sin(decRad), cosDec * Math.cos(raRad));
}

// The one hand-rolled piece of astronomical math in this feature (see
// star-map plan doc) — everything else (planet positions, individual
// alt/az) goes through astronomy-engine directly. This has no
// astronomy-engine equivalent because it's a rendering-performance trick,
// not a physics computation: instead of re-projecting every star through
// RA/Dec->Alt/Az every frame, we rotate the WHOLE static equatorial-frame
// point cloud once per (coarse) tick with a single quaternion, derived from
// local sidereal time (hour angle) and observer latitude.
//
// Derivation: a star's hour angle H = LST - RA. Rotating the equatorial
// frame around its polar axis (+Y, see raDecToEquatorial) by -H brings the
// meridian (H=0, i.e. RA=LST) to align with the frame's own reference
// meridian (+Z, "south" in raDecToEquatorial's un-tilted frame). Then
// rotating around the (world) +X axis by (latitude - 90deg) tips the
// celestial pole from straight up (+Y) down to its true altitude, which
// equals the observer's latitude, in the north direction. Both signs and
// the rotation order were verified numerically against astronomy-engine's
// own Horizon() output (not just derived on paper) — see
// scripts/verify-sky-rotation.mjs during development.
export function buildSkyRotation(localSiderealHours: number, latitudeDeg: number): Quaternion {
  const hourAngleDeg = localSiderealHours * 15;
  const qHourAngle = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -hourAngleDeg * DEG_TO_RAD);
  const qLatitude = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), (latitudeDeg - 90) * DEG_TO_RAD);
  // Apply hour-angle rotation first, then the latitude tilt: qLatitude * qHourAngle.
  return qLatitude.multiply(qHourAngle);
}
