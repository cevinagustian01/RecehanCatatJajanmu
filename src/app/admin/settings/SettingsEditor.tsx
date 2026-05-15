"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Edit3, Check, X } from "lucide-react";
import { toast } from "sonner";

type Setting = {
  id: string;
  key: string;
  value: string;
  type: string;
};

export function SettingsEditor({ initialSettings }: { initialSettings: Setting[] }) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Setting>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleEdit = (setting: Setting) => {
    setEditingId(setting.id);
    setEditForm({ value: setting.value, type: setting.type });
  };

  const handleSave = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });

      if (res.ok) {
        toast.success("Setting updated");
        setEditingId(null);
        window.location.reload();
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      toast.error("Error updating");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this setting?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Setting deleted");
        window.location.reload();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Error deleting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newKey || !newValue) {
      toast.error("Key and value are required");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey, value: newValue, type: "string" }),
      });

      if (res.ok) {
        toast.success("Setting added");
        setNewKey("");
        setNewValue("");
        window.location.reload();
      } else {
        toast.error("Failed to add");
      }
    } catch (error) {
      toast.error("Error adding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {settings.map((setting) => {
        const isEditing = editingId === setting.id;
        return (
          <div key={setting.id} className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-3">
              <code className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{setting.key}</code>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button onClick={() => handleSave(setting.id)} disabled={isLoading} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 disabled:opacity-50">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(setting)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(setting.id)} disabled={isLoading} className="p-2 hover:bg-red-50 rounded-lg text-red-400 disabled:opacity-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Value</label>
                  <input
                    type="text"
                    value={editForm.value || ""}
                    onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Type</label>
                  <select
                    value={editForm.type || "string"}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 font-mono bg-gray-50 rounded-lg p-3 break-all">{setting.value}</p>
            )}
          </div>
        );
      })}

      {/* Add New Setting */}
      <div className="bg-white/70 backdrop-blur-xl border border-dashed border-gray-200 rounded-[20px] p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Add Setting</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Setting key (e.g., site_name)"
            className="flex-1 h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            disabled={isLoading}
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1 h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            disabled={isLoading}
          />
          <button
            onClick={handleAdd}
            disabled={isLoading || !newKey || !newValue}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
