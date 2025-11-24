import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { HeaderBlock, SummaryBlock, ExperienceBlock, SkillsBlock, EducationBlock } from './BlockComponents';
import { AIModal } from './AIModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

const BlockRenderer = ({ block, onAIRequest }: { block: any, onAIRequest: any }) => {
    const { updateBlockData, theme, removeBlock } = useResumeStore();
    
    // DnD Hooks
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as 'relative',
        zIndex: isDragging ? 100 : 1,
    };

    const renderBlockContent = () => {
        const props = {
            data: block.data,
            onChange: (data: any) => updateBlockData(block.id, data),
            isEditing: true,
            theme: theme,
            onAIRequest: (text: string, fieldPath: string, instruction: string) => onAIRequest(block.id, fieldPath, text, instruction)
        };

        switch(block.type) {
            case 'header': return <HeaderBlock {...props} />;
            case 'summary': return <SummaryBlock {...props} />;
            case 'experience': return <ExperienceBlock {...props} />;
            case 'skills': return <SkillsBlock {...props} />;
            case 'education': return <EducationBlock {...props} />;
            default: return null;
        }
    };

    return (
        <div id={block.id} ref={setNodeRef} style={style} className="group relative mb-2 hover:bg-gray-50/30 rounded-lg -mx-4 px-4 py-2 transition-colors">
            {/* Drag Handle & Controls - Only show on hover and not printing */}
            <div className="absolute -left-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 print:hidden cursor-grab active:cursor-grabbing" {...listeners} {...attributes}>
                <div className="p-1 text-gray-400 hover:text-gray-600">
                    <GripVertical size={20} />
                </div>
            </div>
             <div className="absolute -right-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 print:hidden">
                <button onClick={() => removeBlock(block.id)} className="p-1 text-red-300 hover:text-red-600">
                    <X size={20} />
                </button>
            </div>

            {renderBlockContent()}
        </div>
    );
};

export const ResumeEditor: React.FC = () => {
    const { blocks, reorderBlocks, updateBlockData, lastAddedBlockId } = useResumeStore();
    const [aiState, setAiState] = useState<{ isOpen: boolean, blockId: string, fieldPath: string, text: string, instruction: string }>({
        isOpen: false, blockId: '', fieldPath: '', text: '', instruction: ''
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (lastAddedBlockId) {
            const element = document.getElementById(lastAddedBlockId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a temporary highlight
                element.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
                setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
                }, 1000);
            }
        }
    }, [lastAddedBlockId]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            reorderBlocks(active.id as string, over?.id as string);
        }
    };

    const handleAIRequest = (blockId: string, fieldPath: string, text: string, instruction: string) => {
        setAiState({ isOpen: true, blockId, fieldPath, text, instruction });
    };

    const handleAIApply = (newText: string) => {
        // Find block and update generic path (simplified for demo: assuming flat data or simple nesting)
        // For production, use lodash.set or similar for deep updates.
        // Here we handle the specific cases used in BlockComponents:
        
        const block = blocks.find(b => b.id === aiState.blockId);
        if (!block) return;

        let newData = { ...block.data };

        if (aiState.fieldPath === 'content') {
            newData.content = newText;
        } else if (aiState.fieldPath.startsWith('items[')) {
            // Very simple parser for items[0].description
            const matches = aiState.fieldPath.match(/items\[(\d+)\]\.(\w+)/);
            if (matches) {
                const index = parseInt(matches[1]);
                const field = matches[2];
                if (newData.items && newData.items[index]) {
                    newData.items[index] = { ...newData.items[index], [field]: newText };
                }
            }
        }
        
        updateBlockData(aiState.blockId, newData);
    };

    return (
        <div className="flex justify-center p-8 print:p-0 min-h-screen">
            <div className="a4-page p-12 print:p-0 relative">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {blocks.map(block => (
                            <BlockRenderer key={block.id} block={block} onAIRequest={handleAIRequest} />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <AIModal 
                isOpen={aiState.isOpen}
                onClose={() => setAiState({ ...aiState, isOpen: false })}
                originalText={aiState.text}
                onApply={handleAIApply}
                contextInstruction={aiState.instruction}
            />
        </div>
    );
};