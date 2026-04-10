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

export function calculateRank(trees: number) {
  if (trees >= 100) return { title: 'Botanical Legend', icon: 'diamond', color: '#b2f432' };
  if (trees >= 50) return { title: 'Forest Founder', icon: 'forest', color: '#97d700' };
  if (trees >= 20) return { title: 'Grove Architect', icon: 'architecture', color: '#7bb200' };
  if (trees >= 5) return { title: 'Sprout Steward', icon: 'eco', color: '#5e8c00' };
  return { title: 'Seedling Guardian', icon: 'grass', color: '#424935' };
}
