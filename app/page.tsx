"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import companies from "@/data/mockCompanies.json";
import { Search, ArrowUpDown, CheckSquare, Download, FolderPlus, TrendingUp, Database, Award, Target } from "lucide-react";
import { showToast } from "@/components/Toast";

export default function Home() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selected, setSelected] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (sectorFilter ? c.sector === sectorFilter : true) &&
    (stageFilter ? c.stage === stageFilter : true)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "sector") return a.sector.localeCompare(b.sector);
    return 0;
  });

  const sectors = [...new Set(companies.map(c => c.sector))];
  const stages = [...new Set(companies.map(c => c.stage))];

  // Calculate analytics with useMemo for performance
  const analytics = useMemo(() => {
    const enrichedCount = companies.filter(c => 
      localStorage.getItem(`enrich-${c.id}`)
    ).length;

    const avgScore = companies.reduce((acc, c) => {
      const enrichment = localStorage.getItem(`enrich-${c.id}`);
      if (enrichment) {
        try {
          const data = JSON.parse(enrichment);
          const { scoreCompany } = require("@/lib/scoring");
          const result = scoreCompany(c, data.data);
          return acc + result.score;
        } catch (e) {
          return acc;
        }
      }
      return acc;
    }, 0) / (enrichedCount || 1);

    const highFitCount = companies.filter(c => {
      const enrichment = localStorage.getItem(`enrich-${c.id}`);
      if (enrichment) {
        try {
          const data = JSON.parse(enrichment);
          const { scoreCompany } = require("@/lib/scoring");
          const result = scoreCompany(c, data.data);
          return result.score >= 75;
        } catch (e) {
          return false;
        }
      }
      return false;
    }).length;

    return { enrichedCount, avgScore, highFitCount };
  }, [companies]);

  const toggleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getEnrichmentStatus = (id: string) => {
    return localStorage.getItem(`enrich-${id}`) ? "enriched" : "pending";
  };

  const hasNotes = (id: string) => {
    return !!localStorage.getItem(`notes-${id}`);
  };

  const isSaved = (id: string) => {
    const saved = JSON.parse(localStorage.getItem("savedCompanies") || "[]");
    return saved.some((c: any) => c.id === id);
  };

  const bulkAddToList = () => {
    if (selected.length === 0) return;
    const saved = JSON.parse(localStorage.getItem("savedCompanies") || "[]");
    const toAdd = companies.filter(c => selected.includes(c.id) && !saved.some((s: any) => s.id === c.id));
    localStorage.setItem("savedCompanies", JSON.stringify([...saved, ...toAdd]));
    showToast(`Added ${toAdd.length} companies to saved list`, "success");
    setSelected([]);
  };

  const bulkExport = () => {
    if (selected.length === 0) return;
    const toExport = companies.filter(c => selected.includes(c.id));
    const csv = [
      "Name,Sector,Stage,Location,Website",
      ...toExport.map(c => `${c.name},${c.sector},${c.stage},${c.location},${c.website}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "companies-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${toExport.length} companies`, "success");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Companies</h1>
        <p className="text-gray-400">Thesis-first startup scouting dashboard</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Database className="h-5 w-5 text-blue-400" />
            <span className="text-2xl font-bold text-blue-300">{companies.length}</span>
          </div>
          <div className="text-sm text-gray-400">Total Companies</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckSquare className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-green-300">{analytics.enrichedCount}</span>
          </div>
          <div className="text-sm text-gray-400">Enriched</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-purple-300">{Math.round(analytics.avgScore)}</span>
          </div>
          <div className="text-sm text-gray-400">Avg Thesis Score</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-300">{analytics.highFitCount}</span>
          </div>
          <div className="text-sm text-gray-400">High-Fit (&gt;75)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search companies by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          >
            <option value="">All Sectors</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          >
            <option value="">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={() => setSortBy(sortBy === "name" ? "sector" : "name")}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </button>
        </div>

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 text-sm bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
            <span className="text-blue-300 font-medium">{selected.length} selected</span>
            <button 
              onClick={bulkAddToList}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
            >
              <FolderPlus className="h-4 w-4" />
              Add to List
            </button>
            <button 
              onClick={bulkExport}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button 
              onClick={() => setSelected([])} 
              className="text-gray-400 hover:text-gray-300 ml-auto"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      {sorted.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No companies match your current filters</h3>
          <p className="text-gray-400 mb-4">Try adjusting your sector, stage, or search criteria</p>
          <button
            onClick={() => {
              setSearch("");
              setSectorFilter("");
              setStageFilter("");
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden shadow-xl">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 w-12">
                    <CheckSquare className="h-4 w-4" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Sector</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sorted.map(company => {
                  const enriched = getEnrichmentStatus(company.id) === "enriched";
                  return (
                    <tr 
                      key={company.id} 
                      className="hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(company.id)}
                          onChange={() => toggleSelect(company.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/companies/${company.id}`} 
                          className="text-blue-400 hover:text-blue-300 font-medium group-hover:underline"
                        >
                          {company.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{company.sector}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium">
                          {company.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{company.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {enriched && (
                            <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs font-medium">
                              ✓ Enriched
                            </span>
                          )}
                          {hasNotes(company.id) && (
                            <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                              📝 Notes
                            </span>
                          )}
                          {isSaved(company.id) && (
                            <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded text-xs">
                              ⭐ Saved
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {sorted.length} of {companies.length} companies
          </div>
        </>
      )}
    </div>
  );
}
