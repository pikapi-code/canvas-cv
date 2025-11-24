import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check, Copy } from 'lucide-react';
import { improveText } from '../services/geminiService';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onApply: (newText: string) => void;
  contextInstruction?: string;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, originalText, onApply, contextInstruction }) => {
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  if (!isOpen) return null;

  const handleGenerate = async (instruction: string) => {
    setIsLoading(true);
    setGeneratedText('');
    try {
      const result = await improveText(originalText, instruction);
      setGeneratedText(result);
    } catch (e) {
      console.error(e);
      setGeneratedText("Failed to generate. Please check your API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const presets = [
    { label: "Add Metrics & Impact", prompt: "Rewrite this text to include plausible, specific metrics, numbers, and impact-driven outcomes. Make it impressive." },
    { label: "Make Professional", prompt: "Rewrite this to be more professional, formal, and suitable for a resume." },
    { label: "Fix Grammar", prompt: "Correct all grammar, spelling, and punctuation errors. Keep the tone the same." },
    { label: "Make Concise", prompt: "Make this text more concise and direct. Remove fluff words." },
    { label: "Add Action Verbs", prompt: "Rewrite this using strong action verbs to start sentences." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-300" />
            <h2 className="font-semibold text-lg">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Original Text</label>
                <div className="p-3 bg-gray-50 border rounded-lg text-sm text-gray-700 min-h-[100px] max-h-[200px] overflow-y-auto">
                    {originalText || <span className="text-gray-400 italic">No text selected...</span>}
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">AI Suggestion</label>
                 <div className={`p-3 border rounded-lg text-sm min-h-[100px] max-h-[200px] overflow-y-auto relative ${generatedText ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white border-gray-200 text-gray-800'}`}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-indigo-500">
                            <Loader2 className="animate-spin mr-2" /> Generating...
                        </div>
                    ) : generatedText ? (
                        generatedText
                    ) : (
                        <span className="text-gray-400 italic">Select an option to generate...</span>
                    )}
                </div>
             </div>
          </div>

          <div className="flex gap-4 border-b mb-4">
              <button 
                className={`pb-2 px-1 text-sm font-medium ${activeTab === 'presets' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('presets')}
              >
                Quick Actions
              </button>
              <button 
                className={`pb-2 px-1 text-sm font-medium ${activeTab === 'custom' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('custom')}
              >
                Custom Instruction
              </button>
          </div>

          {activeTab === 'presets' ? (
              <div className="flex flex-wrap gap-2">
                {contextInstruction && (
                   <button 
                    onClick={() => handleGenerate(contextInstruction)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full text-sm font-medium transition flex items-center gap-2 border border-purple-200"
                   >
                     <Sparkles size={14} /> Recommended
                   </button>
                )}
                {presets.map(p => (
                    <button 
                        key={p.label}
                        onClick={() => handleGenerate(p.prompt)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition"
                    >
                        {p.label}
                    </button>
                ))}
              </div>
          ) : (
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g., 'Make it sound more enthusiastic'"
                    className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 placeholder-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate(customPrompt)}
                  />
                  <button 
                    onClick={() => handleGenerate(customPrompt)}
                    disabled={!customPrompt.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                      Generate
                  </button>
              </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition">Cancel</button>
          <button 
            onClick={() => { onApply(generatedText); onClose(); }} 
            disabled={!generatedText}
            className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center shadow-lg shadow-gray-200"
          >
            <Check size={16} className="mr-2" /> Apply Change
          </button>
        </div>
      </div>
    </div>
  );
};