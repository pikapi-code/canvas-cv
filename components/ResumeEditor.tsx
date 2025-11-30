import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { HeaderBlock, SummaryBlock, ExperienceBlock, SkillsBlock, EducationBlock } from './BlockComponents';
import { AIModal } from './AIModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

const BlockContent = ({ block, theme, styleConfig, onAIRequest, isOverlay = false, isHeatmapVisible, atsAnalysis, isAISuggestionsEnabled }: any) => {
    const { updateBlockData } = useResumeStore();

    const props = {
        data: block.data,
        onChange: (data: any) => updateBlockData(block.id, data),
        isEditing: !isHeatmapVisible, // Disable editing in heatmap mode
        theme: theme,
        styleConfig: styleConfig,
        onAIRequest: (text: string, fieldPath: string, instruction: string) => onAIRequest(block.id, fieldPath, text, instruction),
        isHeatmapVisible,
        atsAnalysis,
        isAISuggestionsEnabled
    };

    switch (block.type) {
        case 'header': return <HeaderBlock {...props} />;
        case 'summary': return <SummaryBlock {...props} />;
        case 'experience': return <ExperienceBlock {...props} />;
        case 'skills': return <SkillsBlock {...props} />;
        case 'education': return <EducationBlock {...props} />;
        default: return null;
    }
};

interface SortableBlockProps {
    block: any;
    onAIRequest: (blockId: string, fieldPath: string, text: string, instruction: string) => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({ block, onAIRequest }) => {
    const { theme, styleConfig, removeBlock, isHeatmapVisible, atsAnalysis, isAISuggestionsEnabled } = useResumeStore();

    // DnD Hooks
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        position: 'relative' as 'relative',
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div id={block.id} ref={setNodeRef} style={style} className={`group relative mb-2 rounded-lg -mx-4 px-4 py-2 transition-colors ${isDragging ? 'bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-gray-50/30'}`}>
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

            <BlockContent
                block={block}
                theme={theme}
                styleConfig={styleConfig}
                onAIRequest={onAIRequest}
                isHeatmapVisible={isHeatmapVisible}
                atsAnalysis={atsAnalysis}
                isAISuggestionsEnabled={isAISuggestionsEnabled}
            />
        </div>
    );
};

export const ResumeEditor: React.FC = () => {
    const { blocks, reorderBlocks, updateBlockData, lastAddedBlockId, styleConfig, theme, isHeatmapVisible, atsAnalysis, isAISuggestionsEnabled } = useResumeStore();
    const [aiState, setAiState] = useState<{ isOpen: boolean, blockId: string, fieldPath: string, text: string, instruction: string }>({
        isOpen: false, blockId: '', fieldPath: '', text: '', instruction: ''
    });
    const [activeId, setActiveId] = useState<string | null>(null);

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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (active.id !== over?.id) {
            reorderBlocks(active.id as string, over?.id as string);
        }
    };

    const handleAIRequest = (blockId: string, fieldPath: string, text: string, instruction: string) => {
        setAiState({ isOpen: true, blockId, fieldPath, text, instruction });
    };

    const handleAIApply = (newText: string) => {
        const block = blocks.find(b => b.id === aiState.blockId);
        if (!block) return;

        let newData = { ...block.data };

        if (aiState.fieldPath === 'content') {
            newData.content = newText;
        } else if (aiState.fieldPath.startsWith('items[')) {
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

    const getPagePadding = () => {
        switch (styleConfig.pageMargin) {
            case 'compact': return 'p-8';
            case 'spacious': return 'p-16';
            default: return 'p-12';
        }
    };

    const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null;

    return (
        <div className="flex justify-center p-8 print:p-0 min-h-screen">
            <div className={`a4-page ${getPagePadding()} print:p-0 relative transition-all duration-300`}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {blocks.map(block => (
                            <SortableBlock key={block.id} block={block} onAIRequest={handleAIRequest} />
                        ))}
                    </SortableContext>

                    <DragOverlay>
                        {activeBlock ? (
                            <div className="bg-white shadow-2xl rounded-lg p-4 opacity-90 scale-105 border-2 border-blue-400 cursor-grabbing">
                                <BlockContent
                                    block={activeBlock}
                                    theme={theme}
                                    styleConfig={styleConfig}
                                    onAIRequest={handleAIRequest}
                                    isOverlay={true}
                                    isHeatmapVisible={isHeatmapVisible}
                                    atsAnalysis={atsAnalysis}
                                    isAISuggestionsEnabled={isAISuggestionsEnabled}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <AIModal
                isOpen={aiState.isOpen}
                onClose={() => setAiState({ ...aiState, isOpen: false })}
                originalText={aiState.text}
                onApply={handleAIApply}
                contextInstruction={aiState.instruction}
            />
        </div >
    );
};