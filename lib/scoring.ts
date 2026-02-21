export interface ScoringWeights {
  marketAlignment: number;
  stageAlignment: number;
  geography: number;
  tractionSignals: number;
}

export interface ScoringResult {
  score: number;
  reasons: string[];
  breakdown: {
    marketAlignment: number;
    stageAlignment: number;
    geography: number;
    tractionSignals: number;
  };
  confidence: 'High' | 'Medium' | 'Low';
}

const WEIGHTS: ScoringWeights = {
  marketAlignment: 0.30,  // 30%
  stageAlignment: 0.20,   // 20%
  geography: 0.20,        // 20%
  tractionSignals: 0.30   // 30%
};

// Alignment levels for thesis matching
type AlignmentLevel = 'strong' | 'partial' | 'weak' | 'none';

function getMarketAlignment(sector: string): { level: AlignmentLevel; score: number; label: string } {
  if (sector === "ClimateTech") return { level: 'strong', score: 100, label: "ClimateTech focus" };
  if (sector === "DeepTech") return { level: 'strong', score: 90, label: "DeepTech sector" };
  if (sector === "FinTech" || sector === "HealthTech") return { level: 'partial', score: 60, label: "Adjacent sector" };
  return { level: 'weak', score: 30, label: "Non-core sector" };
}

function getStageAlignment(stage: string): { level: AlignmentLevel; score: number; label: string } {
  if (stage === "Pre-Seed") return { level: 'strong', score: 100, label: "Pre-Seed stage" };
  if (stage === "Seed") return { level: 'strong', score: 100, label: "Seed stage" };
  if (stage === "Series A") return { level: 'partial', score: 40, label: "Series A" };
  return { level: 'weak', score: 20, label: "Later stage" };
}

function getGeographyAlignment(location: string): { level: AlignmentLevel; score: number; label: string } {
  if (location === "India") return { level: 'strong', score: 100, label: "India-based" };
  if (location === "Southeast Asia") return { level: 'partial', score: 60, label: "Southeast Asia" };
  return { level: 'weak', score: 30, label: "Other location" };
}

export function scoreCompany(company: any, enrichment: any): ScoringResult {
  let reasons: string[] = [];
  let signalCount = 0;

  // Market Alignment (30%)
  const market = getMarketAlignment(company.sector);
  const marketScore = market.score;
  if (market.level === 'strong' || market.level === 'partial') {
    reasons.push(market.label);
  }

  // Stage Alignment (20%)
  const stage = getStageAlignment(company.stage);
  const stageScore = stage.score;
  if (stage.level === 'strong' || stage.level === 'partial') {
    reasons.push(stage.label);
  }

  // Geography (20%)
  const geo = getGeographyAlignment(company.location);
  const geoScore = geo.score;
  if (geo.level === 'strong' || geo.level === 'partial') {
    reasons.push(geo.label);
  }

  // Traction Signals (30%)
  let tractionScore = 0;
  if (enrichment?.signals) {
    signalCount = enrichment.signals.length;
    
    if (enrichment.signals.some((s: string) => s.toLowerCase().includes("hiring") || s.toLowerCase().includes("careers"))) {
      tractionScore += 40;
      reasons.push("Actively hiring");
    }
    
    if (enrichment.signals.some((s: string) => s.toLowerCase().includes("blog") || s.toLowerCase().includes("content"))) {
      tractionScore += 30;
      reasons.push("Active content");
    }
    
    if (enrichment.signals.some((s: string) => s.toLowerCase().includes("product") || s.toLowerCase().includes("changelog"))) {
      tractionScore += 30;
      reasons.push("Product updates");
    }
  }

  // Determine confidence level
  let confidence: 'High' | 'Medium' | 'Low' = 'Low';
  if (signalCount >= 4) {
    confidence = 'High';
  } else if (signalCount >= 2) {
    confidence = 'Medium';
  }

  // Dynamic weight adjustment based on confidence
  // If confidence is low, reduce traction weight slightly
  let adjustedTractionWeight = WEIGHTS.tractionSignals;
  if (confidence === 'Low' && signalCount > 0) {
    adjustedTractionWeight *= 0.9; // 10% reduction
    // Redistribute to other categories
    const redistribution = (WEIGHTS.tractionSignals - adjustedTractionWeight) / 3;
    const adjustedWeights = {
      marketAlignment: WEIGHTS.marketAlignment + redistribution,
      stageAlignment: WEIGHTS.stageAlignment + redistribution,
      geography: WEIGHTS.geography + redistribution,
      tractionSignals: adjustedTractionWeight
    };
    
    // Calculate weighted total with adjusted weights
    const totalScore = Math.round(
      (marketScore * adjustedWeights.marketAlignment) +
      (stageScore * adjustedWeights.stageAlignment) +
      (geoScore * adjustedWeights.geography) +
      (tractionScore * adjustedWeights.tractionSignals)
    );

    return {
      score: totalScore,
      reasons,
      breakdown: {
        marketAlignment: Math.round(marketScore * adjustedWeights.marketAlignment),
        stageAlignment: Math.round(stageScore * adjustedWeights.stageAlignment),
        geography: Math.round(geoScore * adjustedWeights.geography),
        tractionSignals: Math.round(tractionScore * adjustedWeights.tractionSignals)
      },
      confidence
    };
  }

  // Calculate weighted total with standard weights
  const totalScore = Math.round(
    (marketScore * WEIGHTS.marketAlignment) +
    (stageScore * WEIGHTS.stageAlignment) +
    (geoScore * WEIGHTS.geography) +
    (tractionScore * WEIGHTS.tractionSignals)
  );

  return {
    score: totalScore,
    reasons,
    breakdown: {
      marketAlignment: Math.round(marketScore * WEIGHTS.marketAlignment),
      stageAlignment: Math.round(stageScore * WEIGHTS.stageAlignment),
      geography: Math.round(geoScore * WEIGHTS.geography),
      tractionSignals: Math.round(tractionScore * WEIGHTS.tractionSignals)
    },
    confidence
  };
}
