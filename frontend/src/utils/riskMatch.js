const BETA_THRESHOLDS = { conservative: 0.8, moderate: 1.2, aggressive: Infinity }

export const getComfortLevel = (tolerance) =>
  tolerance <= 3 ? 'conservative' : tolerance <= 6 ? 'moderate' : 'aggressive'

export const getComfortLabel = (tolerance) => {
  const level = getComfortLevel(tolerance)
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export const getBetaThreshold = (tolerance) =>
  BETA_THRESHOLDS[getComfortLevel(tolerance)]

export const isRiskMatch = (beta, tolerance) =>
  beta <= getBetaThreshold(tolerance)

export const isTooConservative = (beta, tolerance) =>
  tolerance >= 7 && beta < 0.5
