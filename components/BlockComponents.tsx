import React, { useState, useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';
import { HeaderData, SummaryData, ExperienceData, SkillsData, EducationData, Theme, StyleConfig, ATSAnalysisResult } from '../types';
import { Plus, Trash2, Sparkles, Wand2 } from 'lucide-react';
import { getSmartCompletion } from '../services/geminiService';

interface BlockProps {
  data: any;
  onChange: (data: any) => void;
  isEditing: boolean;
  theme: Theme;
  styleConfig: StyleConfig;
  onAIRequest?: (text: string, fieldId: string, instruction: string) => void;
  isHeatmapVisible?: boolean;
  atsAnalysis?: ATSAnalysisResult | null;
  isAISuggestionsEnabled?: boolean;
}

const getDynamicStyles = (config: StyleConfig) => {
  const font = config.fontFamily === 'serif' ? 'font-serif' : config.fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const size = config.fontSize === 'sm' ? 'text-sm' : config.fontSize === 'lg' ? 'text-lg' : 'text-base';
  const leading = config.lineHeight === 'tight' ? 'leading-tight' : config.lineHeight === 'loose' ? 'leading-loose' : 'leading-normal';
  return `${font} ${size} ${leading}`;
};

const ThemeStyles = {
  modern: {
    heading: "text-gray-800 font-bold",
    subheading: "text-gray-600 font-semibold",
    body: "text-gray-700",
    accent: "text-blue-600",
    divider: "border-gray-200"
  },
  minimal: {
    heading: "text-gray-900 font-medium tracking-tight",
    subheading: "text-gray-500 font-medium",
    body: "text-gray-600 text-sm",
    accent: "text-black",
    divider: "border-transparent"
  },
  serif: {
    heading: "text-gray-900 font-bold",
    subheading: "text-gray-700 italic",
    body: "text-gray-800 leading-relaxed",
    accent: "text-emerald-800",
    divider: "border-emerald-100"
  },
  classic: {
    heading: "text-slate-800 font-bold uppercase tracking-wider",
    subheading: "text-slate-600 font-bold",
    body: "text-slate-700 text-sm",
    accent: "text-slate-900",
    divider: "border-slate-300"
  }
};

// Helper to strip HTML for AI processing
const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const highlightContent = (text: string) => {
  if (!text) return '';
  let cleanText = stripHtml(text);

  // Highlight numbers (metrics)
  let html = cleanText.replace(/(\d+%?|\$\d+)/g, '<span class="bg-blue-100 text-blue-800 border-b-2 border-blue-300 px-0.5 rounded">$1</span>');

  // Highlight action verbs
  const verbs = ['led', 'managed', 'created', 'developed', 'designed', 'implemented', 'increased', 'reduced', 'improved', 'launched', 'orchestrated', 'spearheaded'];
  const verbRegex = new RegExp(`\\b(${verbs.join('|')})\\b`, 'gi');
  html = html.replace(verbRegex, '<span class="bg-green-100 text-green-800 border-b-2 border-green-300 px-0.5 rounded">$1</span>');

  return html.replace(/\n/g, '<br>');
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

const SuggestionBox = ({ text, onAccept, onDismiss }: { text: string, onAccept: () => void, onDismiss?: () => void }) => {
  if (!text) return null;
  return (
    <div className="absolute z-30 top-full left-0 mt-2 mb-4 bg-white border border-purple-200 shadow-xl rounded-lg p-3 max-w-md animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-2">
        <Wand2 size={14} className="text-purple-500 mt-1 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">AI Suggestion</p>
          <p className="text-sm text-gray-800 mb-2">...{text}</p>
          <div className="flex gap-2">
            <button onClick={onAccept} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 transition">Append</button>
            {onDismiss && <button onClick={onDismiss} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200 transition">Dismiss</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeaderBlock: React.FC<BlockProps> = ({ data, onChange, theme, styleConfig, isHeatmapVisible }) => {
  const d = data as HeaderData;
  const s = ThemeStyles[theme];
  const dyn = getDynamicStyles(styleConfig);

  const handleChange = (field: keyof HeaderData, value: string) => {
    onChange({ ...d, [field]: value });
  };

  return (
    <div className={`flex flex-col gap-2 mb-6 ${theme === 'minimal' ? 'items-start' : 'items-center text-center'} ${dyn}`}>
      <ContentEditable
        html={d.fullName}
        disabled={isHeatmapVisible}
        onChange={(e) => handleChange('fullName', e.target.value)}
        className={`text-3xl ${s.heading} outline-none focus:bg-blue-50/50 rounded px-1`}
      />
      <ContentEditable
        html={d.title}
        disabled={isHeatmapVisible}
        onChange={(e) => handleChange('title', e.target.value)}
        className={`text-xl ${s.accent} ${s.subheading} outline-none focus:bg-blue-50/50 rounded px-1`}
      />
      <div className={`flex flex-wrap gap-3 ${s.body} text-sm mt-2 justify-center`}>
        {['email', 'phone', 'location', 'linkedin', 'website'].map((field, i, arr) => (
          <div key={field} className="flex items-center">
            <ContentEditable
              html={(d as any)[field] || ''}
              disabled={isHeatmapVisible}
              onChange={(e) => handleChange(field as keyof HeaderData, e.target.value)}
              className="outline-none focus:bg-blue-50/50 rounded px-1 min-w-[50px]"
              placeholder={field}
            />
            {i < arr.length - 1 && <span className="ml-3 text-gray-300">|</span>}
          </div>
        ))}
      </div>
      <div className={`w-full border-b mt-4 ${s.divider}`}></div>
    </div>
  );
};

export const SummaryBlock: React.FC<BlockProps> = ({ data, onChange, theme, onAIRequest, styleConfig, isHeatmapVisible }) => {
  const d = data as SummaryData;
  const s = ThemeStyles[theme];
  const dyn = getDynamicStyles(styleConfig);

  return (
    <div className={`mb-6 group relative ${dyn}`}>
      <div className="flex items-center mb-2">
        <h3 className={`uppercase text-sm tracking-widest ${s.heading}`}>Professional Summary</h3>
        {onAIRequest && !isHeatmapVisible && <AITrigger onClick={() => onAIRequest(stripHtml(d.content), 'content', 'Rewrite this summary to be more impactful and professional.')} label="Rewrite" />}
      </div>
      {isHeatmapVisible ? (
        <div
          className={`w-full p-1 ${s.body}`}
          dangerouslySetInnerHTML={{ __html: highlightContent(d.content) }}
        />
      ) : (
        <ContentEditable
          html={d.content}
          disabled={false}
          onChange={(e) => onChange({ ...d, content: e.target.value })}
          className={`w-full outline-none focus:bg-blue-50/50 rounded p-1 ${s.body}`}
        />
      )}
    </div>
  );
};

export const ExperienceBlock: React.FC<BlockProps> = ({ data, onChange, theme, onAIRequest, styleConfig, isHeatmapVisible, isAISuggestionsEnabled }) => {
  const d = data as ExperienceData;
  const s = ThemeStyles[theme];
  const dyn = getDynamicStyles(styleConfig);
  const [suggestion, setSuggestion] = useState<{ idx: number, text: string } | null>(null);
  const aiDebounceRef = useRef<any>(null);
  const descriptionRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...d.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...d, items: newItems });

    if (field === 'description' && isAISuggestionsEnabled) {
      setSuggestion(null);
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);

      const plainText = stripHtml(value);
      const lines = plainText.split('\n').filter(l => l.trim());
      const lastLine = lines[lines.length - 1] || '';
      const cleanLine = lastLine.replace(/^[•\-\*\→▪]\s*/, '').trim();

      if (cleanLine.length > 15 && !cleanLine.endsWith('.')) {
        aiDebounceRef.current = setTimeout(async () => {
          const item = d.items[index];
          const completed = await getSmartCompletion(cleanLine, 'Work Experience', item.role, item.company);
          if (completed) setSuggestion({ idx: index, text: completed });
        }, 1500);
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
    <div className={`mb-6 ${dyn}`}>
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-1">
        <h3 className={`uppercase text-sm tracking-widest ${s.heading}`}>Work Experience</h3>
        {!isHeatmapVisible && <button onClick={addItem} className="text-gray-400 hover:text-blue-500 print:hidden"><Plus size={16} /></button>}
      </div>
      <div className="flex flex-col gap-6">
        {d.items.map((item, idx) => (
          <div key={item.id} className="group/item relative hover:bg-gray-50/50 p-2 -m-2 rounded transition-colors">
            <div className="flex justify-between items-baseline mb-1">
              <div className="flex-1">
                <ContentEditable
                  html={item.role}
                  disabled={isHeatmapVisible}
                  onChange={(e) => updateItem(idx, 'role', e.target.value)}
                  className={`font-bold text-lg outline-none focus:bg-blue-50/50 rounded ${s.heading}`}
                />
                <ContentEditable
                  html={item.company}
                  disabled={isHeatmapVisible}
                  onChange={(e) => updateItem(idx, 'company', e.target.value)}
                  className={`text-md outline-none focus:bg-blue-50/50 rounded ${s.accent}`}
                />
              </div>
              <div className={`text-right text-sm shrink-0 ml-4 ${s.subheading} flex gap-1`}>
                <ContentEditable
                  html={item.startDate}
                  disabled={isHeatmapVisible}
                  onChange={(e) => updateItem(idx, 'startDate', e.target.value)}
                  className="outline-none focus:bg-blue-50/50 rounded min-w-[30px]"
                />
                <span>–</span>
                <ContentEditable
                  html={item.endDate}
                  disabled={isHeatmapVisible}
                  onChange={(e) => updateItem(idx, 'endDate', e.target.value)}
                  className="outline-none focus:bg-blue-50/50 rounded min-w-[30px]"
                />
              </div>
            </div>
            <div className={`relative group/desc ${suggestion && suggestion.idx === idx ? 'mb-24' : ''}`}>
              <div className="pr-20">
                {isHeatmapVisible ? (
                  <div
                    className={`w-full whitespace-pre-wrap ${s.body}`}
                    dangerouslySetInnerHTML={{
                      __html: highlightContent(item.description)
                    }}
                  />
                ) : (
                  <ContentEditable
                    innerRef={(el: HTMLElement) => {
                      if (el) descriptionRefs.current[idx] = el;
                    }}
                    html={item.description || ''}
                    onChange={(e) => {
                      updateItem(idx, 'description', e.target.value);
                    }}
                    className={`w-full outline-none focus:bg-blue-50/50 rounded whitespace-pre-wrap ${s.body}`}
                  />
                )}
              </div>

              <div className="absolute top-0 right-0 flex gap-2">
                {onAIRequest && !isHeatmapVisible && (
                  <AITrigger
                    onClick={() => onAIRequest(stripHtml(item.description), `items[${idx}].description`, 'Rewrite these bullet points to be results-oriented using strong action verbs.')}
                    label="Polish"
                  />
                )}
              </div>
              {suggestion && suggestion.idx === idx && !isHeatmapVisible && (
                <SuggestionBox
                  text={suggestion.text}
                  onAccept={() => acceptSuggestion(idx)}
                  onDismiss={() => setSuggestion(null)}
                />
              )}
            </div>

            {!isHeatmapVisible && (
              <button
                onClick={() => removeItem(idx)}
                className="absolute -right-6 top-0 text-red-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity print:hidden"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkillsBlock: React.FC<BlockProps> = ({ data, onChange, theme, styleConfig, isHeatmapVisible }) => {
  const d = data as SkillsData;
  const s = ThemeStyles[theme];
  const dyn = getDynamicStyles(styleConfig);

  const handleChange = (idx: number, val: string) => {
    const newItems = [...d.items];
    newItems[idx] = { ...newItems[idx], name: val };
    onChange({ ...d, items: newItems });
  }

  const addItem = () => {
    onChange({ ...d, items: [...d.items, { id: `s-${Date.now()}`, name: 'New Skill' }] })
  }

  const removeItem = (idx: number) => {
    const newItems = [...d.items];
    newItems.splice(idx, 1);
    onChange({ ...d, items: newItems });
  }

  return (
    <div className={`mb-6 ${dyn}`}>
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-1">
        <h3 className={`uppercase text-sm tracking-widest ${s.heading}`}>Skills</h3>
        {!isHeatmapVisible && <button onClick={addItem} className="text-gray-400 hover:text-blue-500 print:hidden"><Plus size={16} /></button>}
      </div>
      <div className="flex flex-wrap gap-2">
        {d.items.map((item, idx) => (
          <div key={item.id} className="relative group">
            <span className={`px-2 py-1 bg-gray-100 rounded text-sm ${s.body}`}>
              <ContentEditable
                html={item.name}
                disabled={isHeatmapVisible}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="outline-none min-w-[20px] inline-block"
              />
            </span>
            {!isHeatmapVisible && (
              <button
                onClick={() => removeItem(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 print:hidden"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export const EducationBlock: React.FC<BlockProps> = ({ data, onChange, theme, styleConfig, isHeatmapVisible }) => {
  const d = data as EducationData;
  const s = ThemeStyles[theme];
  const dyn = getDynamicStyles(styleConfig);

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...d.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...d, items: newItems });
  };

  return (
    <div className={`mb-6 ${dyn}`}>
      <h3 className={`uppercase text-sm tracking-widest mb-3 border-b border-gray-100 pb-1 ${s.heading}`}>Education</h3>
      <div className="flex flex-col gap-4">
        {d.items.map((item, idx) => (
          <div key={item.id}>
            <div className="flex justify-between">
              <ContentEditable
                html={item.school}
                disabled={isHeatmapVisible}
                onChange={(e) => updateItem(idx, 'school', e.target.value)}
                className={`font-bold ${s.heading} outline-none focus:bg-blue-50/50 rounded`}
              />
              <ContentEditable
                html={item.year}
                disabled={isHeatmapVisible}
                onChange={(e) => updateItem(idx, 'year', e.target.value)}
                className={`${s.subheading} outline-none focus:bg-blue-50/50 rounded`}
              />
            </div>
            <ContentEditable
              html={item.degree}
              disabled={isHeatmapVisible}
              onChange={(e) => updateItem(idx, 'degree', e.target.value)}
              className={`${s.body} outline-none focus:bg-blue-50/50 rounded`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}