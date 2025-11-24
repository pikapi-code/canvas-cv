import React, { useState, useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';
import { HeaderData, SummaryData, ExperienceData, SkillsData, EducationData, Theme } from '../types';
import { Plus, Trash2, GripVertical, Sparkles, Wand2 } from 'lucide-react';
import { getSmartCompletion } from '../services/geminiService';

interface BlockProps {
  data: any;
  onChange: (data: any) => void;
  isEditing: boolean;
  theme: Theme;
  onAIRequest?: (text: string, fieldId: string, instruction: string) => void;
}

const ThemeStyles = {
  modern: {
    heading: "text-gray-800 font-bold font-sans",
    subheading: "text-gray-600 font-semibold font-sans",
    body: "text-gray-700 font-sans",
    accent: "text-blue-600",
    divider: "border-gray-200"
  },
  minimal: {
    heading: "text-gray-900 font-medium tracking-tight font-sans",
    subheading: "text-gray-500 font-medium font-sans",
    body: "text-gray-600 font-sans text-sm",
    accent: "text-black",
    divider: "border-transparent"
  },
  serif: {
    heading: "text-gray-900 font-bold font-serif",
    subheading: "text-gray-700 font-serif italic",
    body: "text-gray-800 font-serif leading-relaxed",
    accent: "text-emerald-800",
    divider: "border-emerald-100"
  },
  classic: {
    heading: "text-slate-800 font-bold uppercase tracking-wider font-mono",
    subheading: "text-slate-600 font-bold font-mono",
    body: "text-slate-700 font-mono text-sm",
    accent: "text-slate-900",
    divider: "border-slate-300"
  }
};

const AITrigger = ({ onClick, label }: { onClick: () => void, label?: string }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="ml-2 px-2 py-1 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-all opacity-0 group-hover:opacity-100 print:hidden flex items-center gap-1 text-xs font-medium border border-purple-200"
    title="Enhance with AI"
  >
    <Sparkles size={12} /> {label || "Enhance"}
  </button>
);

const SuggestionBox = ({ text, onAccept }: { text: string, onAccept: () => void }) => {
    if (!text) return null;
    return (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-purple-200 shadow-lg rounded-lg p-2 max-w-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-2">
                <Wand2 size={14} className="text-purple-500 mt-1 shrink-0" />
                <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">AI Suggestion</p>
                    <p className="text-sm text-gray-800 mb-2">...{text}</p>
                    <button 
                        onClick={onAccept}
                        className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition"
                    >
                        Click to Append
                    </button>
                </div>
            </div>
        </div>
    );
};

export const HeaderBlock: React.FC<BlockProps> = ({ data, onChange, theme }) => {
  const d = data as HeaderData;
  const s = ThemeStyles[theme];

  const handleChange = (field: keyof HeaderData, value: string) => {
    onChange({ ...d, [field]: value });
  };

  return (
    <div className={`flex flex-col gap-2 mb-6 ${theme === 'minimal' ? 'items-start' : 'items-center text-center'}`}>
      <ContentEditable
        html={d.fullName}
        disabled={false}
        onChange={(e) => handleChange('fullName', e.target.value)}
        className={`text-3xl ${s.heading} outline-none focus:bg-blue-50/50 rounded px-1`}
      />
      <ContentEditable
        html={d.title}
        disabled={false}
        onChange={(e) => handleChange('title', e.target.value)}
        className={`text-xl ${s.accent} ${s.subheading} outline-none focus:bg-blue-50/50 rounded px-1`}
      />
      <div className={`flex flex-wrap gap-3 ${s.body} text-sm mt-2 justify-center`}>
        {['email', 'phone', 'location', 'linkedin', 'website'].map((field) => (
          <div key={field} className="flex items-center">
            <ContentEditable
              html={(d as any)[field] || ''}
              disabled={false}
              onChange={(e) => handleChange(field as keyof HeaderData, e.target.value)}
              className="outline-none focus:bg-blue-50/50 rounded px-1 min-w-[50px] empty:hidden"
              placeholder={field}
            />
            <span className="last:hidden ml-3 text-gray-300">|</span>
          </div>
        ))}
      </div>
      <div className={`w-full border-b mt-4 ${s.divider}`}></div>
    </div>
  );
};

export const SummaryBlock: React.FC<BlockProps> = ({ data, onChange, theme, onAIRequest }) => {
  const d = data as SummaryData;
  const s = ThemeStyles[theme];

  return (
    <div className="mb-6 group relative">
       <div className="flex items-center mb-2">
        <h3 className={`uppercase text-sm tracking-widest ${s.heading}`}>Professional Summary</h3>
        {onAIRequest && <AITrigger onClick={() => onAIRequest(d.content, 'content', 'Rewrite this summary to be more impactful and professional.')} label="Rewrite" />}
      </div>
      <ContentEditable
        html={d.content}
        disabled={false}
        onChange={(e) => onChange({ ...d, content: e.target.value })}
        className={`w-full outline-none focus:bg-blue-50/50 rounded p-1 ${s.body}`}
      />
    </div>
  );
};

export const ExperienceBlock: React.FC<BlockProps> = ({ data, onChange, theme, onAIRequest }) => {
  const d = data as ExperienceData;
  const s = ThemeStyles[theme];
  const [suggestion, setSuggestion] = useState<{ idx: number, text: string } | null>(null);
  const debounceRef = useRef<any>(null);

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...d.items];
    (newItems[index] as any)[field] = value;
    onChange({ ...d, items: newItems });

    // Suggestion Logic for Description
    if (field === 'description') {
        setSuggestion(null);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        
        // Only trigger if enough text and cursor is likely at end (simplified)
        if (value.length > 10 && !value.endsWith('.')) {
             debounceRef.current = setTimeout(async () => {
                const completed = await getSmartCompletion(value, 'Work Experience');
                if (completed) setSuggestion({ idx: index, text: completed });
             }, 1000); // 1s pause trigger
        }
    }
  };

  const acceptSuggestion = (index: number) => {
      if (!suggestion) return;
      const newItems = [...d.items];
      const currentDesc = newItems[index].description;
      newItems[index].description = currentDesc + " " + suggestion.text;
      onChange({ ...d, items: newItems });
      setSuggestion(null);
  };

  const addItem = () => {
    const newItem = {
      id: `job-${Date.now()}`,
      role: 'Role',
      company: 'Company',
      startDate: 'Start',
      endDate: 'End',
      description: 'Key achievements...'
    };
    onChange({ ...d, items: [newItem, ...d.items] });
  };

  const removeItem = (index: number) => {
    const newItems = [...d.items];
    newItems.splice(index, 1);
    onChange({ ...d, items: newItems });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-1">
        <h3 className={`uppercase text-sm tracking-widest ${s.heading}`}>Work Experience</h3>
        <button onClick={addItem} className="text-gray-400 hover:text-blue-500 print:hidden"><Plus size={16} /></button>
      </div>
      <div className="flex flex-col gap-6">
        {d.items.map((item, idx) => (
          <div key={item.id} className="group/item relative hover:bg-gray-50/50 p-2 -m-2 rounded transition-colors">
            <div className="flex justify-between items-baseline mb-1">
              <div className="flex-1">
                <ContentEditable
                  html={item.role}
                  onChange={(e) => updateItem(idx, 'role', e.target.value)}
                  className={`font-bold text-lg outline-none focus:bg-blue-50/50 rounded ${s.heading}`}
                />
                <ContentEditable
                  html={item.company}
                  onChange={(e) => updateItem(idx, 'company', e.target.value)}
                  className={`text-md outline-none focus:bg-blue-50/50 rounded ${s.accent}`}
                />
              </div>
              <div className={`text-right text-sm shrink-0 ml-4 ${s.subheading}`}>
                 <ContentEditable
                  html={`${item.startDate} – ${item.endDate}`}
                  onChange={(e) => { /* Complex split handling simplified */ }}
                  className="outline-none focus:bg-blue-50/50 rounded"
                />
              </div>
            </div>
            <div className="relative group/desc">
                <ContentEditable
                    html={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className={`w-full outline-none focus:bg-blue-50/50 rounded whitespace-pre-wrap ${s.body}`}
                />
                {/* AI Tools Overlay */}
                <div className="absolute top-0 right-0 flex gap-2">
                     {onAIRequest && (
                        <AITrigger 
                            onClick={() => onAIRequest(item.description, `items[${idx}].description`, 'Rewrite these bullet points to be results-oriented using strong action verbs.')} 
                            label="Polish"
                        />
                     )}
                </div>
                {/* Smart Suggestion Box */}
                {suggestion && suggestion.idx === idx && (
                    <SuggestionBox text={suggestion.text} onAccept={() => acceptSuggestion(idx)} />
                )}
            </div>
            
            <button 
                onClick={() => removeItem(idx)}
                className="absolute -right-6 top-0 text-red-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity print:hidden"
            >
                <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkillsBlock: React.FC<BlockProps> = ({ data, onChange, theme }) => {
    const d = data as SkillsData;
    const s = ThemeStyles[theme];

    const handleChange = (idx: number, val: string) => {
        const newItems = [...d.items];
        newItems[idx].name = val;
        onChange({...d, items: newItems});
    }

    const addItem = () => {
        onChange({...d, items: [...d.items, { id: `s-${Date.now()}`, name: 'New Skill'}]})
    }
    
    const removeItem = (idx: number) => {
        const newItems = [...d.items];
        newItems.splice(idx, 1);
        onChange({...d, items: newItems});
    }

    return (
        <div className="mb-6">
             <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-1">
                <h3 className={`uppercase text-sm tracking-widest ${s.heading}`}>Skills</h3>
                 <button onClick={addItem} className="text-gray-400 hover:text-blue-500 print:hidden"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
                {d.items.map((item, idx) => (
                    <div key={item.id} className="relative group">
                        <span className={`px-2 py-1 bg-gray-100 rounded text-sm ${s.body}`}>
                             <ContentEditable
                                html={item.name}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                className="outline-none min-w-[20px] inline-block"
                            />
                        </span>
                        <button 
                            onClick={() => removeItem(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 print:hidden"
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const EducationBlock: React.FC<BlockProps> = ({ data, onChange, theme }) => {
    const d = data as EducationData;
    const s = ThemeStyles[theme];

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...d.items];
        (newItems[index] as any)[field] = value;
        onChange({ ...d, items: newItems });
      };

    return (
        <div className="mb-6">
            <h3 className={`uppercase text-sm tracking-widest mb-3 border-b border-gray-100 pb-1 ${s.heading}`}>Education</h3>
            <div className="flex flex-col gap-4">
                {d.items.map((item, idx) => (
                    <div key={item.id}>
                         <div className="flex justify-between">
                            <ContentEditable
                                html={item.school}
                                onChange={(e) => updateItem(idx, 'school', e.target.value)}
                                className={`font-bold ${s.heading} outline-none focus:bg-blue-50/50 rounded`}
                            />
                            <ContentEditable
                                html={item.year}
                                onChange={(e) => updateItem(idx, 'year', e.target.value)}
                                className={`${s.subheading} outline-none focus:bg-blue-50/50 rounded`}
                            />
                        </div>
                        <ContentEditable
                            html={item.degree}
                            onChange={(e) => updateItem(idx, 'degree', e.target.value)}
                            className={`${s.body} outline-none focus:bg-blue-50/50 rounded`}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}