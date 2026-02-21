export const FUND_THESIS = {
  name: "Early Stage India Fund",
  focus: [
    {
      icon: "🌍",
      title: "India-First Startups",
      description: "Companies building for and from India"
    },
    {
      icon: "🌱",
      title: "ClimateTech & DeepTech",
      description: "Technology-driven solutions for climate and infrastructure"
    },
    {
      icon: "🚀",
      title: "Pre-Seed / Seed Stage",
      description: "Early-stage companies with strong founding teams"
    },
    {
      icon: "👥",
      title: "Technical Founders",
      description: "Teams with deep technical expertise and domain knowledge"
    }
  ],
  weights: {
    marketAlignment: "30%",
    stageAlignment: "20%",
    geography: "20%",
    tractionSignals: "30%"
  }
};

export function generateInsight(signals: string[]): string {
  const hasHiring = signals.some(s => s.toLowerCase().includes("hiring") || s.toLowerCase().includes("careers"));
  const hasBlog = signals.some(s => s.toLowerCase().includes("blog") || s.toLowerCase().includes("content"));
  const hasProduct = signals.some(s => s.toLowerCase().includes("product") || s.toLowerCase().includes("changelog"));
  
  if (hasHiring && (hasBlog || hasProduct)) {
    return "Active hiring and product iteration suggest early growth momentum. Team is scaling while building.";
  }
  
  if (hasHiring) {
    return "Active hiring indicates the company is in growth mode and expanding their team.";
  }
  
  if (hasBlog && hasProduct) {
    return "Regular content and product updates show consistent execution and market engagement.";
  }
  
  if (hasBlog) {
    return "Active content creation suggests strong market positioning and thought leadership.";
  }
  
  if (hasProduct) {
    return "Recent product updates indicate active development and customer feedback integration.";
  }
  
  return "Limited public signals detected. Consider direct outreach for deeper intelligence.";
}
