import { create } from 'zustand';
import { ResumeState, BlockType, ResumeBlock } from '../types';
import { arrayMove } from '@dnd-kit/sortable';

const initialBlocks: ResumeBlock[] = [
  {
    id: 'header-1',
    type: 'header',
    title: 'Header',
    isVisible: true,
    data: {
      fullName: 'Alex Johnson',
      title: 'Senior Product Designer',
      email: 'alex.j@example.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexj',
      website: 'alex.design'
    }
  },
  {
    id: 'summary-1',
    type: 'summary',
    title: 'Professional Summary',
    isVisible: true,
    data: {
      content: 'Creative and detail-oriented Product Designer with over 6 years of experience in building user-centric digital products. Proven track record of improving user engagement and streamlining complex workflows. Adept at collaborating with cross-functional teams to deliver high-quality solutions.'
    }
  },
  {
    id: 'exp-1',
    type: 'experience',
    title: 'Work Experience',
    isVisible: true,
    data: {
      items: [
        {
          id: 'job-1',
          role: 'Senior Product Designer',
          company: 'TechFlow Inc.',
          startDate: '2021',
          endDate: 'Present',
          description: '• Led the redesign of the core SaaS platform, resulting in a 25% increase in user retention.\n• Mentored junior designers and established a comprehensive design system used across 4 product lines.\n• Collaborated closely with engineering and product management to define product roadmap and strategy.'
        },
        {
          id: 'job-2',
          role: 'UI/UX Designer',
          company: 'Creative Pulse',
          startDate: '2018',
          endDate: '2021',
          description: '• Designed responsive websites and mobile apps for diverse clients in fintech and healthcare.\n• Conducted user research and usability testing to inform design decisions.\n• Created interactive prototypes to visualize complex user flows.'
        }
      ]
    }
  },
  {
    id: 'skills-1',
    type: 'skills',
    title: 'Skills',
    isVisible: true,
    data: {
      items: [
        { id: 's1', name: 'Figma' },
        { id: 's2', name: 'React' },
        { id: 's3', name: 'User Research' },
        { id: 's4', name: 'Prototyping' },
        { id: 's5', name: 'HTML/CSS' },
        { id: 's6', name: 'Agile' }
      ]
    }
  },
  {
    id: 'edu-1',
    type: 'education',
    title: 'Education',
    isVisible: true,
    data: {
      items: [
        {
          id: 'edu-1',
          degree: 'B.S. Interaction Design',
          school: 'University of California, Arts',
          year: '2018'
        }
      ]
    }
  }
];

export const useResumeStore = create<ResumeState>((set, get) => ({
  blocks: initialBlocks,
  theme: 'modern',
  activeBlockId: null,
  lastAddedBlockId: null,
  atsAnalysis: null,
  jobDescription: '',

  addBlock: (type: BlockType) => set((state) => {
    const newBlock: ResumeBlock = {
      id: `${type}-${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      isVisible: true,
      data: getDefaultDataForType(type)
    };
    return { 
      blocks: [...state.blocks, newBlock],
      lastAddedBlockId: newBlock.id
    };
  }),

  removeBlock: (id: string) => set((state) => ({
    blocks: state.blocks.filter(b => b.id !== id)
  })),

  updateBlockData: (id: string, data: any) => set((state) => ({
    blocks: state.blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...data } } : b)
  })),

  reorderBlocks: (activeId: string, overId: string) => set((state) => {
    const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
    const newIndex = state.blocks.findIndex((b) => b.id === overId);
    return { blocks: arrayMove(state.blocks, oldIndex, newIndex) };
  }),

  setActiveBlock: (id: string | null) => set({ activeBlockId: id }),
  setTheme: (theme) => set({ theme }),
  
  setATSAnalysis: (analysis) => set({ atsAnalysis: analysis }),
  setJobDescription: (jd) => set({ jobDescription: jd }),

  getResumeText: () => {
    const state = get();
    return state.blocks.map(b => JSON.stringify(b.data)).join(' ');
  }
}));

function getDefaultDataForType(type: BlockType): any {
  switch (type) {
    case 'header': return { fullName: 'Name', title: 'Title', email: 'email@example.com', phone: '', location: '' };
    case 'summary': return { content: 'Add your professional summary here.' };
    case 'experience': return { items: [{ id: `job-${Date.now()}`, role: 'Role', company: 'Company', startDate: 'Start', endDate: 'End', description: 'Description' }] };
    case 'education': return { items: [{ id: `edu-${Date.now()}`, degree: 'Degree', school: 'School', year: 'Year' }] };
    case 'skills': return { items: [{ id: `skill-${Date.now()}`, name: 'Skill' }] };
    default: return {};
  }
}