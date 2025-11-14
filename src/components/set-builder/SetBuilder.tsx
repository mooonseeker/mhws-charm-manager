import { Hand, Search } from 'lucide-react';

import { AccessorySelector, EquipmentCell, EquipmentSelector } from '@/components/equipments';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSetBuilder } from '@/contexts/SetBuilderContext';

import { AutoModeToolbar } from './AutoModeToolbar';
import SearchResultsModal from './SearchResultsModal';
import { SetSummary } from './SetSummary';
import { SkillRequirements } from './SkillRequirements';

import type { Slot } from '@/types';
import type { EquipmentCellType } from '@/types/set-builder';
const cellTypes: EquipmentCellType[] = ['weapon', 'helm', 'body', 'arm', 'waist', 'leg', 'charm'];

export function SetBuilder() {
    const {
        mode,
        setMode,
        currentEquipmentSet,
        selectionContext,
        handleEqSlotClick,
        handleSlotClick,
        handleEqSelect,
        handleAccessorySelect,
    } = useSetBuilder();

    return (
        <div className="h-full flex flex-col gap-6">
            <SearchResultsModal />
            <div className="flex items-center flex-shrink-0 gap-4">
                <h1 className="text-2xl font-bold">配装器</h1>
                <ToggleGroup
                    type="single"
                    value={mode}
                    onValueChange={(v) => v && setMode(v as 'manual' | 'auto')}
                    size="sm"
                    className="border border-border rounded-md p-1"
                >
                    <ToggleGroupItem
                        value="manual"
                        aria-label="手动模式"
                    >
                        <Hand className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="auto"
                        aria-label="自动模式（开发中）"
                    >
                        <Search className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                {mode === 'auto' && <AutoModeToolbar />}
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-9/20 h-full flex flex-col justify-between items-start gap-2">
                    {cellTypes.map(type => (
                        <EquipmentCell
                            key={type}
                            type={type}
                            isSelected={
                                selectionContext?.type === 'equipment' &&
                                selectionContext.equipmentType === type
                            }
                            slottedEquipment={currentEquipmentSet[type as keyof typeof currentEquipmentSet]}
                            onEquipmentClick={() => handleEqSlotClick(type)}
                            onSlotClick={(slotIndex: number, slot: Slot) => handleSlotClick(type, slotIndex, slot)}
                        />
                    ))}
                </div>

                <div className="w-full lg:w-11/20 h-full overflow-y-auto">
                    {mode === 'manual' ? (
                        selectionContext ? (
                            selectionContext.type === 'equipment' ? (
                                <EquipmentSelector
                                    selectingFor={selectionContext.equipmentType}
                                    currentEquipment={currentEquipmentSet[selectionContext.equipmentType as keyof typeof currentEquipmentSet]?.equipment}
                                    onSelect={handleEqSelect}
                                />
                            ) : (
                                <AccessorySelector
                                    slot={selectionContext.slot}
                                    onAccessorySelect={handleAccessorySelect}
                                />
                            )
                        ) : (
                            <SetSummary equipmentSet={currentEquipmentSet} />
                        )
                    ) : (
                        Object.keys(currentEquipmentSet).length > 0 ? (
                            <SetSummary equipmentSet={currentEquipmentSet} />
                        ) : (
                            <SkillRequirements />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
