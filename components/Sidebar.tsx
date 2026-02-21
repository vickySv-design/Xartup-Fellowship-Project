"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Bookmark, FolderOpen, Search, Target, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { FUND_THESIS } from "@/lib/thesis";

export default function Sidebar() {
  const pathname = usePathname();
  const [globalSearch, setGlobalSearch] = useState("");
  const [showThesis, setShowThesis] = useState(false);

  const links = [
    { href: "/", label: "Discover", icon: Building2 },
    { href: "/lists", label: "Lists", icon: FolderOpen },
    { href: "/saved", label: "Saved Searches", icon: Bookmark },
    { href: "/about", label: "About", icon: Target },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          VC Intel
        </h1>
        <p className="text-xs text-gray-400 mt-1">Thesis-First Intelligence</p>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Global search..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Fund Thesis Panel */}
      <div className="border-b border-gray-800">
        <button
          onClick={() => setShowThesis(!showThesis)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition"
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold">Fund Thesis</span>
          </div>
          {showThesis ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>
        
        {showThesis && (
          <div className="px-4 pb-4 space-y-3">
            {FUND_THESIS.focus.map((item, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span>{item.icon}</span>
                  <span className="font-medium text-gray-300">{item.title}</span>
                </div>
                <p className="text-gray-500 pl-6">{item.description}</p>
              </div>
            ))}
            
            <div className="pt-3 border-t border-gray-800">
              <div className="text-xs font-semibold text-gray-400 mb-2">Scoring Weights</div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Market Alignment</span>
                  <span>{FUND_THESIS.weights.marketAlignment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stage Alignment</span>
                  <span>{FUND_THESIS.weights.stageAlignment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Geography</span>
                  <span>{FUND_THESIS.weights.geography}</span>
                </div>
                <div className="flex justify-between">
                  <span>Traction Signals</span>
                  <span>{FUND_THESIS.weights.tractionSignals}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        <p>Explainable AI Enrichment</p>
        <p className="mt-1">Powered by Gemini</p>
      </div>
    </aside>
  );
}
