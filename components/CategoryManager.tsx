"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  icon: string | null;
}

interface Props {
  initial: Category[];
}

const EMOJI_SUGGESTIONS = ["🍔","🚗","🛍️","📄","💊","📦","☕","🏠","✈️","🎮","📚","💪","🎵","🐶","💼"];

export default function CategoryManager({ initial }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initial);

  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteError, setDeleteError] = useState<Record<number, string>>({});
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), icon: newIcon.trim() || undefined }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) { setAddError(data.error); return; }
    setCategories((prev) => [...prev, data]);
    setNewName("");
    setNewIcon("");
    router.refresh();
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon ?? "");
    setEditError("");
  }

  async function handleSave(id: number) {
    setEditError("");
    setSaving(true);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), icon: editIcon.trim() || undefined }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setEditError(data.error); return; }
    setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
    setEditId(null);
    router.refresh();
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    setDeleteError((prev) => ({ ...prev, [id]: "" }));
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (!res.ok) {
      const data = await res.json();
      setDeleteError((prev) => ({ ...prev, [id]: data.error }));
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Add new category</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-3">
            <div className="w-24">
              <label className="block text-xs text-slate-500 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="🍔"
                maxLength={10}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Groceries"
                maxLength={50}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_SUGGESTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setNewIcon(emoji)}
                className={`w-8 h-8 rounded-lg text-base transition-all ${
                  newIcon === emoji
                    ? "bg-indigo-100 ring-2 ring-indigo-400"
                    : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {addError && (
            <p className="text-sm text-red-600">⚠️ {addError}</p>
          )}
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {adding ? "Adding…" : "Add category"}
          </button>
        </form>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            All categories
            <span className="ml-2 text-xs font-normal text-slate-400">{categories.length} total</span>
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            No categories yet. Add one above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <li key={cat.id} className="px-5 py-3">
                {editId === cat.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        maxLength={10}
                        className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={50}
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleSave(cat.id)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                      >
                        {saving ? "…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-0.5">
                      {EMOJI_SUGGESTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditIcon(emoji)}
                          className={`w-7 h-7 rounded-lg text-sm transition-all ${
                            editIcon === emoji
                              ? "bg-indigo-100 ring-2 ring-indigo-400"
                              : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    {editError && <p className="text-xs text-red-600">⚠️ {editError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-9 text-center flex-shrink-0">
                      {cat.icon ?? "📦"}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-800">{cat.name}</span>
                    {deleteError[cat.id] && (
                      <span className="text-xs text-red-500 mr-2">{deleteError[cat.id]}</span>
                    )}
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deleting === cat.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}