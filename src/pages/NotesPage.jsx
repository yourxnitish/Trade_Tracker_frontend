import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Calendar,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Brain,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Hash
} from 'lucide-react';
import { notesApi } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  'All',
  'Market Observation',
  'Trading Strategy',
  'Mistakes',
  'Important Lesson',
  'Trading Psychology',
  'Future Improvement',
];

const categoryIcons = {
  'Market Observation': TrendingUp,
  'Trading Strategy': Tag,
  'Mistakes': AlertTriangle,
  'Important Lesson': Lightbulb,
  'Trading Psychology': Brain,
  'Future Improvement': BookOpen,
};

const categoryBadgeStyles = {
  'Market Observation': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Trading Strategy': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Mistakes': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Important Lesson': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Trading Psychology': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Future Improvement': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Market Observation',
    description: '',
    relatedDate: '',
    relatedTradeId: '',
  });

  const [noteToDelete, setNoteToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await notesApi.getNotes(params);
      setNotes(res.data || []);
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleOpenAdd = () => {
    setEditingNote(null);
    setForm({
      title: '',
      category: 'Market Observation',
      description: '',
      relatedDate: new Date().toISOString().split('T')[0],
      relatedTradeId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setForm({
      title: note.title || '',
      category: note.category || 'Market Observation',
      description: note.description || '',
      relatedDate: note.relatedDate || '',
      relatedTradeId: note.relatedTradeId || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        relatedDate: form.relatedDate || null,
        relatedTradeId: form.relatedTradeId ? parseInt(form.relatedTradeId) : null,
      };

      if (editingNote) {
        await notesApi.updateNote(editingNote.id, payload);
      } else {
        await notesApi.createNote(payload);
      }

      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error('Failed to save note', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;
    try {
      await notesApi.deleteNote(noteToDelete.id);
      setNoteToDelete(null);
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Notes & Observations</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Discipline Log
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Capture market insights, trading psychology reflections, rules, and post-trade reviews
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Create Note
        </button>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-dark-card p-4 rounded-2xl border border-dark-border shadow-lg shadow-black/30 space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search note titles or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
          />
        </form>

        {/* Categories Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-dark-bg text-slate-400 hover:text-slate-200 border border-dark-border hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes found"
          description="Record key trading insights, mistakes to avoid, and psychology reflections to build sustainable discipline."
          actionLabel="Write New Note"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => {
            const IconComponent = categoryIcons[note.category] || FileText;
            const badgeClass = categoryBadgeStyles[note.category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

            return (
              <div
                key={note.id}
                className="bg-dark-card rounded-2xl p-5 border border-dark-border shadow-lg shadow-black/20 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                      <IconComponent className="w-3 h-3 mr-1" />
                      {note.category}
                    </span>

                    <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-dark-bg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setNoteToDelete(note)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mt-3 leading-snug group-hover:text-emerald-400 transition-colors">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-4 leading-relaxed whitespace-pre-wrap font-sans">
                    {note.description}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="mt-4 pt-3 border-t border-dark-border flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {note.relatedDate || (note.createdAt ? note.createdAt.slice(0, 10) : 'General')}
                  </span>
                  {note.relatedTradeId && (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <Hash className="w-3 h-3" /> Trade {note.relatedTradeId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dark-card w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-dark-border text-slate-100">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                {editingNote ? 'Edit Observation Note' : 'Create New Observation Note'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-dark-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Respecting intraday VWAP rejection"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c} className="bg-dark-card text-slate-200">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Related Date</label>
                  <input
                    type="date"
                    value={form.relatedDate}
                    onChange={(e) => setForm({ ...form, relatedDate: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Related Trade ID (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={form.relatedTradeId}
                  onChange={(e) => setForm({ ...form, relatedTradeId: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description / Notes *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Elaborate on market behavior, rules reinforced, or behavioral emotions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-xs sm:text-sm p-3 bg-dark-bg border border-dark-border rounded-xl text-slate-100 placeholder-slate-600 resize-none focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-dark-bg border border-dark-border hover:border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(noteToDelete)}
        title="Delete Observation Note"
        message={`Are you sure you want to delete note "${noteToDelete?.title}"?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
};

export default NotesPage;