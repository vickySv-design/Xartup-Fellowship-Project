"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import companies from "@/data/mockCompanies.json";
import { scoreCompany } from "@/lib/scoring";
import { generateInsight } from "@/lib/thesis";
import { ArrowLeft, Sparkles, Loader2, ExternalLink, Save, Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle, TrendingUp, BarChart3, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { showToast } from "@/components/Toast";
import ScoreVisualizer from "@/components/ScoreVisualizer";

export default function CompanyProfile() {
  const params = useParams();
  const company = companies.find(c => c.id === params.id);

  const [enrichment, setEnrichment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [enrichmentStep, setEnrichmentStep] = useState("");
  const [showDataSources, setShowDataSources] = useState(false);

  useEffect(() => {
    if (company) {
      const cached = localStorage.getItem(`enrich-${company.id}`);
      if (cached) {
        try {
          setEnrichment(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached enrichment");
          localStorage.removeItem(`enrich-${company.id}`);
        }
      }
      const savedNotes = localStorage.getItem(`notes-${company.id}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [company]);

  useEffect(() => {
    if (company && notes !== "") {
      const timer = setTimeout(() => {
        localStorage.setItem(`notes-${company.id}`, notes);
        setSaveStatus("Saved");
        setTimeout(() => setSaveStatus(""), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [notes, company]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "e" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        if (!loading) handleEnrich();
      }
      if (e.key === "s" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        saveToList();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [loading]);

  if (!company) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Company not found</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  const handleEnrich = async () => {
    setLoading(true);
    setError("");
    setEnrichmentStep("Fetching public website...");

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEnrichmentStep("Extracting intelligence...");

      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: company.website }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Enrichment failed");
      }

      if (!data.data || typeof data.data !== 'object') {
        throw new Error("Invalid enrichment data received");
      }

      setEnrichment(data);
      localStorage.setItem(`enrich-${company.id}`, JSON.stringify(data));
      setEnrichmentStep("");
      showToast("Enrichment complete!", "success");
    } catch (err: any) {
      setError(err.message || "Enrichment failed. Please try again.");
      setEnrichmentStep("");
    } finally {
      setLoading(false);
    }
  };

  const saveToList = () => {
    const lists = JSON.parse(localStorage.getItem("savedCompanies") || "[]");
    if (!lists.find((c: any) => c.id === company.id)) {
      lists.push(company);
      localStorage.setItem("savedCompanies", JSON.stringify(lists));
      showToast("Saved to list!", "success");
    } else {
      showToast("Already in saved list", "info");
    }
  };

  const scoringResult = enrichment?.data
    ? scoreCompany(company, enrichment.data)
    : { score: 0, reasons: [], breakdown: { marketAlignment: 0, stageAlignment: 0, geography: 0, tractionSignals: 0 }, confidence: 'Low' as const };

  const insight = enrichment?.data?.signals ? generateInsight(enrichment.data.signals) : "";
  const isDemo = enrichment?.demo === true;
  const isCached = enrichment && !loading;

  // Thesis match indicators
  const thesisMatches = {
    sector: company.sector === "ClimateTech" || company.sector === "DeepTech",
    location: company.location === "India",
    stage: company.stage === "Pre-Seed" || company.stage === "Seed"
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-4 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition"
              >
                {company.website}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveToList}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center gap-2 transition shadow-lg"
              >
                <Save className="h-4 w-4" />
                Save to List
              </button>
              <button
                onClick={handleEnrich}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 rounded-lg flex items-center gap-2 transition shadow-lg shadow-blue-600/20 font-medium disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : enrichment ? (
                  <RefreshCw className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? enrichmentStep : enrichment ? "Re-enrich" : "Enrich with AI"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Overview with Thesis Match Indicators */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className={`bg-gray-900 border rounded-lg p-5 shadow-lg ${thesisMatches.sector ? 'border-green-800' : 'border-gray-800'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-xs uppercase tracking-wider">Sector</div>
              {thesisMatches.sector ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <div className="text-xl font-semibold">{company.sector}</div>
          </div>
          <div className={`bg-gray-900 border rounded-lg p-5 shadow-lg ${thesisMatches.stage ? 'border-green-800' : 'border-gray-800'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-xs uppercase tracking-wider">Stage</div>
              {thesisMatches.stage ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <div className="text-xl font-semibold">{company.stage}</div>
          </div>
          <div className={`bg-gray-900 border rounded-lg p-5 shadow-lg ${thesisMatches.location ? 'border-green-800' : 'border-gray-800'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-xs uppercase tracking-wider">Location</div>
              {thesisMatches.location ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <div className="text-xl font-semibold">{company.location}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 shadow-lg">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Status</div>
            <div className="text-xl font-semibold">
              {enrichment ? (
                <span className="text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Enriched
                </span>
              ) : (
                <span className="text-gray-500">Pending</span>
              )}
            </div>
          </div>
        </div>

        {isCached && !loading && (
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300">
                Cached result – Enriched on {new Date(enrichment.timestamp).toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleEnrich}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Re-run enrichment
            </button>
          </div>
        )}



        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold mb-1">Enrichment Failed</div>
              <div className="text-sm mb-3">{error}</div>
              <button
                onClick={handleEnrich}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded text-sm flex items-center gap-2 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        {!enrichment && !loading && (
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-lg p-8 text-center mb-8">
            <Sparkles className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Enrich</h3>
            <p className="text-gray-400 mb-4">Click "Enrich with AI" to extract intelligence from this company's website</p>
          </div>
        )}

        {loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center mb-8">
            <Loader2 className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">{enrichmentStep}</h3>
            <p className="text-gray-400">This may take a few seconds...</p>
          </div>
        )}

        {enrichment && !loading && (
          <div className="space-y-6">
            {/* Thesis Score with Breakdown and Confidence */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-lg p-6 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Thesis Match Score</h2>
                  <p className="text-gray-400 text-sm">Weighted scoring based on fund investment criteria</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {scoringResult.score}
                    <span className="text-2xl text-gray-500">/100</span>
                  </div>
                  <div className="w-32 mb-2">
                    <ScoreVisualizer score={scoringResult.score} size="sm" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    scoringResult.confidence === 'High' ? 'bg-green-900/30 text-green-300' :
                    scoringResult.confidence === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    Confidence: {scoringResult.confidence}
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Market (30%)</div>
                  <div className="text-lg font-bold text-blue-300">{scoringResult.breakdown.marketAlignment}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Stage (20%)</div>
                  <div className="text-lg font-bold text-purple-300">{scoringResult.breakdown.stageAlignment}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Geography (20%)</div>
                  <div className="text-lg font-bold text-green-300">{scoringResult.breakdown.geography}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Traction (30%)</div>
                  <div className="text-lg font-bold text-yellow-300">{scoringResult.breakdown.tractionSignals}</div>
                </div>
              </div>

              {scoringResult.reasons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {scoringResult.reasons.map((r, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-900/50 text-blue-200 rounded-full text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Enrichment - Structured Intelligence */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Summary</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{enrichment.data.summary}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">What They Do</h3>
                </div>
                <ul className="space-y-2.5">
                  {enrichment.data.whatTheyDo?.map((item: string, i: number) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2.5 leading-relaxed">
                      <TrendingUp className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {enrichment.data.keywords?.length > 0 ? (
                    enrichment.data.keywords.map((kw: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-green-900/20 text-green-300 rounded-lg text-sm border border-green-800/30 font-medium">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No keywords extracted</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Traction Signals</h3>
                </div>
                <div className="space-y-2">
                  {enrichment.data.signals?.length > 0 ? (
                    enrichment.data.signals.map((sig: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm bg-yellow-900/10 p-2 rounded">
                        <BarChart3 className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{sig}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No signals detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Intelligence Insight */}
            {insight && (
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30 rounded-lg p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Why This Could Be Early Signal</h3>
                    <p className="text-gray-300 leading-relaxed">{insight}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sources & Data Transparency */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => setShowDataSources(!showDataSources)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-800/50 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Data Sources & Transparency</h3>
                </div>
                {showDataSources ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {showDataSources && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-800">
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Data Sources</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Company website</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Public blog content</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Careers page</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Limitations</h4>
                    <ul className="space-y-1.5 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        <span>Based on publicly available content only</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        <span>No private or confidential data accessed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        <span>Enrichment reflects data available at time of scan</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex items-center gap-3 text-sm">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <a href={enrichment.source} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        {enrichment.source}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Enriched on {new Date(enrichment.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Based on {enrichment.data.signals?.length || 0} detected signals from public data
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Notes</h3>
                </div>
                {saveStatus && (
                  <span className="text-sm text-green-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {saveStatus}
                  </span>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this company... (auto-saves)"
                className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-300"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
