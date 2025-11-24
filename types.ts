export type BlockType = 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'projects';

export interface ResumeBlock {
  id: string;
  type: BlockType;
  title: string; // Display title like "Work Experience"
  isVisible: boolean;
  data: any; // Flexible data structure depending on block type
}

export interface HeaderData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface SummaryData {
  content: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ExperienceData {
  items: ExperienceItem[];
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface EducationData {
  items: EducationItem[];
}

export interface SkillItem {
  id: string;
  name: string;
  level?: string;
}

export interface SkillsData {
  items: SkillItem[];
}

export type Theme = 'modern' | 'minimal' | 'serif' | 'classic';

export interface ATSAnalysisResult {
  score: number;
  criticalIssues: string[];
  missingKeywords: string[];
  positiveFeedback: string[];
}

export interface ResumeState {
  blocks: ResumeBlock[];
  theme: Theme;
  activeBlockId: string | null;
  lastAddedBlockId: string | null;
  atsAnalysis: ATSAnalysisResult | null;
  jobDescription: string;
  
  addBlock: (type: BlockType) => void;
  removeBlock: (id: string) => void;
  updateBlockData: (id: string, data: any) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  setActiveBlock: (id: string | null) => void;
  setTheme: (theme: Theme) => void;
  setATSAnalysis: (analysis: ATSAnalysisResult) => void;
  setJobDescription: (jd: string) => void;
  getResumeText: () => string;
}