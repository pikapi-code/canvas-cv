import React from 'react';
import { ResumeEditor } from './components/ResumeEditor';
import { useResumeStore } from './store/useResumeStore';
import { ATSOptimizer } from './components/ATSOptimizer';
import { BlockType } from './types';
import { Download, LayoutTemplate, Briefcase, User, GraduationCap, Award, FileText, Plus, Github, Palette, Printer, Type, Share2, Sparkles } from 'lucide-react';

const Sidebar = () => {
    const { addBlock, theme, setTheme, styleConfig, setStyleConfig } = useResumeStore();

    const tools = [
        { id: 'header', label: 'Header', icon: <User size={18} /> },
        { id: 'summary', label: 'Summary', icon: <FileText size={18} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
        { id: 'skills', label: 'Skills', icon: <Award size={18} /> },
    ];

    const themes = [
        { id: 'modern', label: 'Modern', color: 'bg-blue-500' },
        { id: 'minimal', label: 'Minimal', color: 'bg-gray-200' },
        { id: 'serif', label: 'Serif', color: 'bg-emerald-700' },
        { id: 'classic', label: 'Classic', color: 'bg-slate-800' },
    ];

    return (
        <div className="w-72 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col print:hidden z-20 shadow-lg">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <LayoutTemplate className="text-blue-600" /> CanvasCV
                </h1>
                <p className="text-xs text-gray-500 mt-1">AI-Powered Resume Builder</p>
            </div>

            <div className="p-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Content Blocks</h3>
                <div className="grid grid-cols-1 gap-3">
                    {tools.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => addBlock(t.id as BlockType)}
                            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-sm font-medium text-gray-700 group text-left"
                        >
                            <span className="p-2 bg-gray-50 rounded text-gray-500 group-hover:text-blue-500 transition-colors">{t.icon}</span>
                            {t.label}
                            <Plus size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-blue-500" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Palette size={14} /> Theme
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id as any)}
                            className={`px-3 py-2 rounded-md text-xs font-medium border transition-all ${theme === t.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${t.color}`} />
                                {t.label}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Type size={14} /> Typography & Layout
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Font Family</label>
                        <div className="grid grid-cols-3 gap-1">
                            {['sans', 'serif', 'mono'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setStyleConfig({ fontFamily: f as any })}
                                    className={`px-2 py-1 text-xs border rounded capitalize ${styleConfig.fontFamily === f ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
                        <div className="grid grid-cols-3 gap-1">
                            {['sm', 'base', 'lg'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyleConfig({ fontSize: s as any })}
                                    className={`px-2 py-1 text-xs border rounded capitalize ${styleConfig.fontSize === s ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {s === 'sm' ? 'Small' : s === 'base' ? 'Medium' : 'Large'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Line Height</label>
                        <div className="grid grid-cols-3 gap-1">
                            {['tight', 'normal', 'loose'].map((h) => (
                                <button
                                    key={h}
                                    onClick={() => setStyleConfig({ lineHeight: h as any })}
                                    className={`px-2 py-1 text-xs border rounded capitalize ${styleConfig.lineHeight === h ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Page Margins</label>
                        <div className="grid grid-cols-3 gap-1">
                            {['compact', 'standard', 'spacious'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setStyleConfig({ pageMargin: m as any })}
                                    className={`px-2 py-1 text-xs border rounded capitalize ${styleConfig.pageMargin === m ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Share2 size={14} /> Export & Share
                </h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition text-sm"
                    >
                        <Download size={14} /> Download PDF
                    </button>
                    <button
                        onClick={() => alert('Public link copied to clipboard: https://canvascv.app/r/alex-johnson')}
                        className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 text-gray-700 rounded hover:bg-gray-50 transition text-sm"
                    >
                        <Share2 size={14} /> Share Public Link
                    </button>
                </div>
            </div>
        </div>
    );
};

const Header = () => {
    const { isAISuggestionsEnabled, toggleAISuggestions } = useResumeStore();

    return (
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 px-8 py-3 flex justify-between items-center print:hidden">
            <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">Untitled Resume</span> — Last saved just now
            </div>
            <div className="flex items-center gap-4 text-sm">
                <button
                    onClick={toggleAISuggestions}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isAISuggestionsEnabled ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                >
                    <Sparkles size={14} className={isAISuggestionsEnabled ? 'fill-purple-300' : 'text-gray-400'} />
                    {isAISuggestionsEnabled ? 'AI Suggestions On' : 'AI Suggestions Off'}
                </button>
                <div className="w-px h-4 bg-gray-200"></div>
                <a href="#" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
                    <Github size={16} /> <span>Github</span>
                </a>
            </div>
        </div>
    );
};

function App() {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
            <Sidebar />
            <ATSOptimizer />
            <main className="pl-72 pr-80 print:px-0 transition-all duration-300">
                <Header />
                <ResumeEditor />
            </main>
        </div>
    );
}

export default App;