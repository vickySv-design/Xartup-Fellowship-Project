"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FolderOpen, Download, Trash2, Edit2 } from "lucide-react";
import { exportToCSV } from "@/lib/utils";

export default function ListsPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("companyLists") || "[]");
    setLists(saved);
  }, []);

  const createList = () => {
    if (!newListName.trim()) return;
    
    const newList = {
      id: Date.now().toString(),
      name: newListName,
      companies: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [...lists, newList];
    setLists(updated);
    localStorage.setItem("companyLists", JSON.stringify(updated));
    setNewListName("");
    setShowCreate(false);
  };

  const deleteList = (id: string) => {
    if (!confirm("Delete this list?")) return;
    const updated = lists.filter(l => l.id !== id);
    setLists(updated);
    localStorage.setItem("companyLists", JSON.stringify(updated));
  };

  const exportList = (list: any) => {
    if (list.companies.length === 0) {
      alert("List is empty");
      return;
    }
    exportToCSV(list.companies, list.name);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lists</h1>
          <p className="text-gray-400">Organize and manage your company portfolios</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create List
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4">Create New List</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name (e.g., Q1 2024 Pipeline)"
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && createList()}
            />
            <button
              onClick={createList}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {lists.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Lists Yet</h3>
          <p className="text-gray-400 mb-6">Create your first list to organize companies</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            Create First List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map(list => (
            <div key={list.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">{list.name}</h3>
                </div>
                <button
                  onClick={() => deleteList(list.id)}
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="text-sm text-gray-400 mb-4">
                {list.companies.length} companies
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Created {new Date(list.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => exportList(list)}
                  disabled={list.companies.length === 0}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
