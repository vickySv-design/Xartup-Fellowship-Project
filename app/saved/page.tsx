"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Trash2, Save, Plus, Search as SearchIcon } from "lucide-react";
import { exportToCSV } from "@/lib/utils";

export default function SavedPage() {
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchConfig, setSearchConfig] = useState({
    sector: "",
    stage: "",
    location: "",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("savedSearches") || "[]");
    setSavedSearches(data);
  }, []);

  const saveSearch = () => {
    if (!searchName.trim()) return;

    const newSearch = {
      id: Date.now().toString(),
      name: searchName,
      config: searchConfig,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem("savedSearches", JSON.stringify(updated));
    setSearchName("");
    setSearchConfig({ sector: "", stage: "", location: "" });
    setShowCreate(false);
  };

  const deleteSearch = (id: string) => {
    if (!confirm("Delete this saved search?")) return;
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem("savedSearches", JSON.stringify(updated));
  };

  const runSearch = (searchItem: any) => {
    // Calculate metrics before redirecting
    const allCompanies = require("@/data/mockCompanies.json");
    const matches = allCompanies.filter((c: any) => {
      return (
        (!searchItem.config.sector || c.sector === searchItem.config.sector) &&
        (!searchItem.config.stage || c.stage === searchItem.config.stage) &&
        (!searchItem.config.location || c.location === searchItem.config.location)
      );
    });

    // Store metrics for display
    localStorage.setItem(`search-metrics-${searchItem.id}`, JSON.stringify({
      matchCount: matches.length,
      lastRun: new Date().toISOString()
    }));

    const params = new URLSearchParams();
    if (searchItem.config.sector) params.set("sector", searchItem.config.sector);
    if (searchItem.config.stage) params.set("stage", searchItem.config.stage);
    if (searchItem.config.location) params.set("location", searchItem.config.location);
    window.location.href = `/?${params.toString()}`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Saved Searches</h1>
          <p className="text-gray-400">Quick access to your frequent search criteria</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Save New Search
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4">Save Search Configuration</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search name (e.g., India ClimateTech Early Stage)"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                value={searchConfig.sector}
                onChange={(e) => setSearchConfig({ ...searchConfig, sector: e.target.value })}
                placeholder="Sector (e.g., ClimateTech)"
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={searchConfig.stage}
                onChange={(e) => setSearchConfig({ ...searchConfig, stage: e.target.value })}
                placeholder="Stage (e.g., Seed)"
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={searchConfig.location}
                onChange={(e) => setSearchConfig({ ...searchConfig, location: e.target.value })}
                placeholder="Location (e.g., India)"
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveSearch}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Save Search
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {savedSearches.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <SearchIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Saved Searches</h3>
          <p className="text-gray-400 mb-6">Save your frequent search criteria for quick access</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            Save First Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSearches.map(search => (
            <div key={search.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SearchIcon className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold">{search.name}</h3>
                </div>
                <button
                  onClick={() => deleteSearch(search.id)}
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {search.config.sector && (
                  <div className="text-sm">
                    <span className="text-gray-500">Sector:</span>{" "}
                    <span className="text-gray-300">{search.config.sector}</span>
                  </div>
                )}
                {search.config.stage && (
                  <div className="text-sm">
                    <span className="text-gray-500">Stage:</span>{" "}
                    <span className="text-gray-300">{search.config.stage}</span>
                  </div>
                )}
                {search.config.location && (
                  <div className="text-sm">
                    <span className="text-gray-500">Location:</span>{" "}
                    <span className="text-gray-300">{search.config.location}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Saved {new Date(search.createdAt).toLocaleDateString()}
              </div>

              <button
                onClick={() => runSearch(search)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition flex items-center justify-center gap-2"
              >
                <SearchIcon className="h-3.5 w-3.5" />
                Run Search
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
