import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon, Code } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const RichTextEditor = ({ value, onChange }) => {
  const [isCodeView, setIsCodeView] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isCodeView]);

  const executeCommand = (command, argument = null) => {
    document.execCommand(command, false, argument);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter link URL (e.g. https://google.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Editor Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Bold"
          disabled={isCodeView}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Italic"
          disabled={isCodeView}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h1>')}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors flex items-center"
          title="Heading 1"
          disabled={isCodeView}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors flex items-center"
          title="Heading 2"
          disabled={isCodeView}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Bullet List"
          disabled={isCodeView}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Add Link"
          disabled={isCodeView}
        >
          <LinkIcon size={16} />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => setIsCodeView(!isCodeView)}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-bold ${isCodeView ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Toggle Code View"
        >
          <Code size={16} /> HTML Code
        </button>
      </div>

      {/* Content Area */}
      {isCodeView ? (
        <textarea
          className="w-full min-h-[300px] p-4 text-xs font-mono border-none outline-none focus:ring-0 text-slate-800 bg-slate-900 text-slate-100 resize-y"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<h1>Write HTML here...</h1>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          className="w-full min-h-[300px] p-6 text-sm text-slate-800 bg-white outline-none focus:ring-0 overflow-y-auto prose max-w-none prose-slate prose-headings:font-black prose-p:leading-relaxed"
          style={{ minHeight: '300px' }}
        />
      )}
    </div>
  );
};


const SectionCard = ({ title, children, subtitle }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
    {title && (
      <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30">
        <h3 className="text-[13px] font-bold text-gray-700 uppercase tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium italic">{subtitle}</p>}
      </div>
    )}
    <div className="p-8">
      {children}
    </div>
  </div>
);


const PAGE_TABS = [
  { id: 'about_us', label: 'About Us' },
  { id: 'careers', label: 'Careers' },
  { id: 'newsroom', label: 'Newsroom' },
  { id: 'terms_conditions', label: 'Terms & Conditions' },
  { id: 'privacy_policy', label: 'Privacy Policy' },
  { id: 'refund_policy', label: 'Refund Policy' },
  { id: 'cancellation_policy', label: 'Cancellation Policy' },
];

const EMPTY_PAGES = Object.fromEntries(PAGE_TABS.map((t) => [t.id, '']));

const unescapeHtml = (text) => (text ? text
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&#x2F;/g, '/') : '');

/*
 * About / Careers / Newsroom and the legal policies. These are read by the
 * apps and the public /taxi/* pages. The website home page is edited under
 * Taxi admin > Website.
 */
const ContentPages = ({ defaultPage = 'about_us' }) => {
  const [activePage, setActivePage] = useState(defaultPage);
  const [pages, setPages] = useState(EMPTY_PAGES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLandingPageSettings();
      const data = res?.data?.pages || {};
      setPages(Object.fromEntries(PAGE_TABS.map((t) => [t.id, unescapeHtml(data[t.id])])));
    } catch (err) {
      console.error('Failed to load content pages:', err);
      toast.error('Failed to load content pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setSaving(true);
      await adminService.updateLandingPageSettings({ pages });
      toast.success('Content pages saved');
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Content Pages</h1>
          <p className="text-sm text-gray-500 mt-1">About, Careers, Newsroom and legal text shown in the apps and on the public pages.</p>
        </div>

        <SectionCard title="Select a page" subtitle="Edit the text, or switch to HTML Code for full control.">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
              {PAGE_TABS.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setActivePage(page.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activePage === page.id
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200 font-black'
                    : 'bg-white text-gray-500 hover:text-gray-700 border-gray-200'}`}
                >
                  {page.label}
                </button>
              ))}
            </div>
            <RichTextEditor
              value={pages[activePage] || ''}
              onChange={(val) => setPages((prev) => ({ ...prev, [activePage]: val }))}
            />
          </div>
        </SectionCard>

        <div className="fixed bottom-10 right-10 z-50">
          <button
            onClick={save}
            disabled={saving}
            className="bg-[#00BFA5] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,191,165,0.4)] hover:bg-[#00AC95] active:scale-95 transition-all disabled:opacity-50"
            title="Save"
          >
            {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentPages;
