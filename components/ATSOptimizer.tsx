import React, { useState } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { analyzeATS } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target, CheckCircle, AlertTriangle, RefreshCw, Briefcase, Zap, ChevronRight } from 'lucide-react';

export const ATSOptimizer = () => {
    const { atsAnalysis, setATSAnalysis, getResumeText, jobDescription, setJobDescription, toggleHeatmap, isHeatmapVisible } = useResumeStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showJDInput, setShowJDInput] = useState(false);

    const handleAnalyze = async () => {
        if (!jobDescription || !jobDescription.trim()) {
            setShowJDInput(true);
            return;
        }

        setIsAnalyzing(true);
        const text = getResumeText();
        const result = await analyzeATS(text, jobDescription);
        if (result) {
            setATSAnalysis(result);
        }
        setIsAnalyzing(false);
    };

    const score = atsAnalysis?.score || 0;
    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score }
    ];

    const getColor = (s: number) => {
        if (s >= 80) return '#22c55e'; // green
        if (s >= 50) return '#eab308'; // yellow
        return '#ef4444'; // red
    };

    return (
        <div className="w-80 bg-white border-l border-gray-200 h-screen fixed right-0 top-0 overflow-y-auto flex flex-col print:hidden z-20 shadow-lg">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Target className="text-blue-600" size={20} />
                    ATS Optimizer
                </h2>
                <p className="text-xs text-gray-500 mt-1">Real-time resume scoring & feedback</p>
            </div>

            <div className="p-6">
                {/* Heatmap Toggle */}
                <div className="flex items-center justify-between mb-6 p-3 bg-gray-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Zap size={16} className={isHeatmapVisible ? 'text-blue-600' : 'text-gray-400'} />
                        Heatmap Overlay
                    </span>
                    <button
                        onClick={toggleHeatmap}
                        className={`w-10 h-5 rounded-full transition-colors relative ${isHeatmapVisible ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${isHeatmapVisible ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>

                {/* Score Visualization */}
                <div className="flex flex-col items-center justify-center mb-6 relative">
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={55}
                                    startAngle={180}
                                    endAngle={0}
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="score" fill={getColor(score)} />
                                    <Cell key="rest" fill="#f3f4f6" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute top-16 text-center">
                        <span className="text-3xl font-bold block" style={{ color: getColor(score) }}>{score}</span>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Score</span>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !jobDescription?.trim()}
                        className="mt-2 text-sm bg-gray-900 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        title={!jobDescription?.trim() ? 'Please add a target job description first' : ''}
                    >
                        {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                        {atsAnalysis ? 'Re-Analyze' : 'Analyze Now'}
                    </button>
                    {!jobDescription?.trim() && (
                        <p className="text-xs text-amber-600 mt-2 text-center">
                            Add a job description to enable analysis
                        </p>
                    )}
                </div>

                {/* Job Description Target */}
                <div className="mb-6 border rounded-xl p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setShowJDInput(!showJDInput)}>
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Briefcase size={16} /> Target Job
                        </h3>
                        <ChevronRight size={16} className={`text-gray-400 transition-transform ${showJDInput ? 'rotate-90' : ''}`} />
                    </div>

                    {(showJDInput || jobDescription) && (
                        <div className="mt-2">
                            <textarea
                                className="w-full text-xs p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none resize-y min-h-[80px] bg-white text-gray-900 placeholder-gray-400"
                                placeholder="Paste Job Description here to get tailored keywords..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            {!jobDescription?.trim() && (
                                <div className="text-[10px] text-amber-600 mt-1 font-medium">
                                    * Job description is required for analysis
                                </div>
                            )}
                            {jobDescription?.trim() && !atsAnalysis && (
                                <div className="text-[10px] text-blue-600 mt-1 font-medium">
                                    * Click Analyze to match keywords
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Feedback List */}
                {atsAnalysis ? (
                    <div className="space-y-6">
                        {atsAnalysis.criticalIssues?.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Critical Fixes
                                </h4>
                                <ul className="space-y-2">
                                    {atsAnalysis.criticalIssues.map((issue, idx) => (
                                        <li key={idx} className="text-xs text-gray-700 bg-red-50 p-2 rounded border border-red-100">
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {atsAnalysis.missingKeywords?.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Target size={12} /> Missing Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {atsAnalysis.missingKeywords.map((kw, idx) => (
                                        <span key={idx} className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-100">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {atsAnalysis.positiveFeedback?.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <CheckCircle size={12} /> Good Job
                                </h4>
                                <ul className="space-y-2">
                                    {atsAnalysis.positiveFeedback.map((fb, idx) => (
                                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">•</span> {fb}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-10">
                        <p className="text-sm">Run analysis to see how your resume stacks up against ATS bots.</p>
                    </div>
                )}
            </div>
        </div>
    );
};