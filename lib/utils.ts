export function exportToCSV(companies: any[], filename: string) {
  const rows = companies.map(company => {
    const enrichment = localStorage.getItem(`enrich-${company.id}`);
    let score = "";
    let confidence = "";
    let enrichedAt = "";

    if (enrichment) {
      try {
        const data = JSON.parse(enrichment);
        const { scoreCompany } = require("@/lib/scoring");
        const result = scoreCompany(company, data.data);
        score = result.score.toString();
        confidence = result.confidence;
        enrichedAt = data.timestamp ? new Date(data.timestamp).toLocaleDateString() : "";
      } catch (e) {
        // Skip if error
      }
    }

    return {
      name: company.name,
      sector: company.sector,
      stage: company.stage,
      location: company.location,
      score: score,
      confidence: confidence,
      enrichedAt: enrichedAt
    };
  });

  const csv = [
    "name,sector,stage,location,score,confidence,enrichedAt",
    ...rows.map(row => `${row.name},${row.sector},${row.stage},${row.location},${row.score},${row.confidence},${row.enrichedAt}`)
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
