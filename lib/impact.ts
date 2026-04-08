export interface ImpactMetrics {
  trees: number;
  carbonOffset: number; // in tonnes
  waterSaved: number;  // in kiloliters
  soilVitality: number; // score out of 10
  survivalRate: number; // percentage
}

export function calculateImpact(trees: number = 0): ImpactMetrics {
  return {
    trees: trees,
    carbonOffset: Number((trees * 0.022).toFixed(2)),
    waterSaved: Number((trees * 1.5).toFixed(1)),
    soilVitality: trees > 0 ? Number(Math.min(7.5 + (trees * 0.05), 9.8).toFixed(1)) : 0,
    survivalRate: trees > 0 ? 94.8 : 0,
  };
}
