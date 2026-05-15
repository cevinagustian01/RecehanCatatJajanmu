"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Check, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

type SectionContent = {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  content: any;
  isActive: boolean;
  order: number;
};

type TestimonialItem = { name: string; role: string; text: string; avatar?: string };
type FaqItem = { question: string; answer: string };

export function ContentEditor({ initialContents }: { initialContents: SectionContent[] }) {
  const [sections, setSections] = useState<SectionContent[]>(initialContents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SectionContent>>({});
  const [testimonialItems, setTestimonialItems] = useState<TestimonialItem[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [contentRaw, setContentRaw] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const sectionLabels: Record<string, string> = {
    hero: "Hero Section",
    features: "Features",
    cta: "Call to Action",
    testimonials: "Testimonials",
    faq: "FAQ",
  };

  const hasItemsEditor = (section: string) => section === "testimonials" || section === "faq";

  const handleEdit = (section: SectionContent) => {
    setEditingId(section.id);
    setEditForm({
      title: section.title || "",
      subtitle: section.subtitle || "",
      content: section.content,
      isActive: section.isActive,
    });
    if (section.section === "testimonials") {
      setTestimonialItems((section.content?.items as TestimonialItem[]) || []);
      setFaqItems([]);
    } else if (section.section === "faq") {
      setFaqItems((section.content?.items as FaqItem[]) || []);
      setTestimonialItems([]);
    } else {
      setContentRaw(JSON.stringify(section.content, null, 2) || "{}");
      setTestimonialItems([]);
      setFaqItems([]);
    }
  };

  const handleSave = async (id: string, section: string) => {
    setIsLoading(true);
    let parsedContent = editForm.content;
    if (section === "testimonials") {
      parsedContent = { items: testimonialItems.filter(i => i.name || i.text) };
    } else if (section === "faq") {
      parsedContent = { items: faqItems.filter(i => i.question || i.answer) };
    } else if (typeof parsedContent === "string") {
      try { parsedContent = JSON.parse(parsedContent); } catch { parsedContent = {}; }
    }
    const payload = { ...editForm, content: parsedContent };
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      if (res.ok) {
        toast.success("Content updated");
        setEditingId(null);
        window.location.reload();
      } else {
        toast.error("Failed to update content");
      }
    } catch {
      toast.error("Error updating content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Section deleted");
        window.location.reload();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Error deleting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (section: string) => {
    setIsLoading(true);
    const defaultContent = section === "testimonials"
      ? { items: [{ name: "", role: "", text: "", avatar: "" }] }
      : section === "faq"
      ? { items: [{ question: "", answer: "" }] }
      : {};
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, title: "", subtitle: "", content: defaultContent, isActive: true }),
      });
      if (res.ok) {
        toast.success("Section added");
        window.location.reload();
      } else {
        toast.error("Failed to add section");
      }
    } catch {
      toast.error("Error adding section");
    } finally {
      setIsLoading(false);
    }
  };

  const existingSections = sections.map((s) => s.section);
  const availableSections = Object.keys(sectionLabels).filter((s) => !existingSections.includes(s));
  const editingSection = sections.find(s => s.id === editingId);

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isEditing = editingId === section.id;
        return (
          <div key={section.id} className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900">{sectionLabels[section.section] || section.section}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${section.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                  {section.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button onClick={() => {
                      if (editingSection) handleSave(section.id, editingSection.section);
                    }} disabled={isLoading} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 disabled:opacity-50">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(section)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(section.id)} disabled={isLoading} className="p-2 hover:bg-red-50 rounded-lg text-red-400 disabled:opacity-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Title</label>
                  <input type="text" value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subtitle</label>
                  <textarea value={editForm.subtitle || ""} onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    rows={2} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
                </div>

                {/* Structured editor for testimonials */}
                {editingSection?.section === "testimonials" && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Testimonials</label>
                    {testimonialItems.map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3 space-y-3 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item {i + 1}</span>
                          <button onClick={() => setTestimonialItems(testimonialItems.filter((_, j) => j !== i))}
                            className="p-1 hover:bg-red-50 rounded-lg text-red-400">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold text-gray-400 block mb-1">Name</label>
                            <input type="text" value={item.name} placeholder="Rina Amelia"
                              onChange={(e) => { const n = [...testimonialItems]; n[i] = { ...n[i], name: e.target.value }; setTestimonialItems(n); }}
                              className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-400 block mb-1">Role</label>
                            <input type="text" value={item.role} placeholder="Freelancer"
                              onChange={(e) => { const n = [...testimonialItems]; n[i] = { ...n[i], role: e.target.value }; setTestimonialItems(n); }}
                              className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 block mb-1">Text</label>
                          <textarea value={item.text} placeholder="Testimoni mereka..."
                            onChange={(e) => { const n = [...testimonialItems]; n[i] = { ...n[i], text: e.target.value }; setTestimonialItems(n); }}
                            rows={2} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 block mb-1">Avatar URL (optional)</label>
                          <div className="flex items-center gap-3">
                            {item.avatar && (
                              <img src={item.avatar} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                            )}
                            <input type="text" value={item.avatar || ""} placeholder="https://..."
                              onChange={(e) => { const n = [...testimonialItems]; n[i] = { ...n[i], avatar: e.target.value }; setTestimonialItems(n); }}
                              className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setTestimonialItems([...testimonialItems, { name: "", role: "", text: "", avatar: "" }])}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                      <Plus className="h-4 w-4" /> Add Testimonial
                    </button>
                  </div>
                )}

                {/* Structured editor for FAQ */}
                {editingSection?.section === "faq" && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">FAQ Items</label>
                    {faqItems.map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3 space-y-3 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item {i + 1}</span>
                          <button onClick={() => setFaqItems(faqItems.filter((_, j) => j !== i))}
                            className="p-1 hover:bg-red-50 rounded-lg text-red-400">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 block mb-1">Question</label>
                          <input type="text" value={item.question} placeholder="Apakah Domptt gratis?"
                            onChange={(e) => { const n = [...faqItems]; n[i] = { ...n[i], question: e.target.value }; setFaqItems(n); }}
                            className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 block mb-1">Answer</label>
                          <textarea value={item.answer} placeholder="Jawabannya..."
                            onChange={(e) => { const n = [...faqItems]; n[i] = { ...n[i], answer: e.target.value }; setFaqItems(n); }}
                            rows={3} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setFaqItems([...faqItems, { question: "", answer: "" }])}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                      <Plus className="h-4 w-4" /> Add FAQ
                    </button>
                  </div>
                )}

                {/* JSON fallback for other sections */}
                {editingSection && !hasItemsEditor(editingSection.section) && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Content (JSON)</label>
                    <textarea value={contentRaw}
                      onChange={(e) => { setContentRaw(e.target.value); try { setEditForm({ ...editForm, content: JSON.parse(e.target.value) }); } catch {} }}
                      rows={6} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.isActive || false}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">Active</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {section.title && <p className="text-sm font-semibold text-gray-900">{section.title}</p>}
                {section.subtitle && <p className="text-sm text-gray-500">{section.subtitle}</p>}
                {section.content?.items && Array.isArray(section.content.items) && (
                  <p className="text-xs text-gray-400">{section.content.items.length} item(s)</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add New Section */}
      {availableSections.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl border border-dashed border-gray-200 rounded-[20px] p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Add Section</h3>
          <div className="flex flex-wrap gap-2">
            {availableSections.map((section) => (
              <button key={section} onClick={() => handleAddSection(section)} disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors">
                <Plus className="h-4 w-4" />
                {sectionLabels[section]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
