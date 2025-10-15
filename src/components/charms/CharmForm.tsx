import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useSkills } from '@/contexts';
import { useCharmOperations } from '@/hooks';
import { calculateCharmEquivalentSlots, calculateKeySkillValue } from '@/utils';

import { CharmValidation } from './CharmValidation';
import { SkillSelector } from './SkillSelector';

import type { SkillWithLevel, Slot, SlotType, SlotLevel, Charm } from '@/types';

interface CharmFormProps {
    charmToEdit?: Charm | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}
/**
 * 护石表单组件
 * 
 * 提供添加护石的完整表单，包括：
 * - 稀有度选择
 * - 技能选择（支持搜索）
 * - 孔位选择
 * - 实时等效孔位和核心技能价值显示
 * - 智能验证提示
 */
export function CharmForm({ charmToEdit, onSuccess, onCancel }: CharmFormProps) {
    const { skills: allSkills } = useSkills();
    const { createCharm, validateNewCharm, updateAndRecalculateCharm } = useCharmOperations();

    const [rarity, setRarity] = useState(10);
    const [selectedSkills, setSelectedSkills] = useState<SkillWithLevel[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);

    // 编辑模式：用传入的护石数据初始化表单
    useEffect(() => {
        if (charmToEdit) {
            setRarity(charmToEdit.rarity);
            setSelectedSkills(charmToEdit.skills);
            setSlots(charmToEdit.slots);
        } else {
            // 添加模式：重置表单
            setRarity(10);
            setSelectedSkills([]);
            setSlots([]);
        }
    }, [charmToEdit]);

    // 实时计算等效孔位和核心技能价值
    const { equivalentSlots, keySkillValue } = useMemo(() => {
        const eq = calculateCharmEquivalentSlots(selectedSkills, slots, allSkills);
        const kv = calculateKeySkillValue(eq);
        return { equivalentSlots: eq, keySkillValue: kv };
    }, [selectedSkills, slots, allSkills]);

    // 实时验证
    const validation = useMemo(() => {
        if (selectedSkills.length === 0) return null;
        return validateNewCharm({
            rarity,
            skills: selectedSkills,
            slots,
            equivalentSlots,
            keySkillValue,
        });
    }, [rarity, selectedSkills, slots, equivalentSlots, keySkillValue, validateNewCharm]);

    // 添加技能
    const handleAddSkill = (skill: SkillWithLevel) => {
        if (selectedSkills.length >= 3) return;

        const newSkills = [...selectedSkills, skill];

        // 按核心技能优先、等级优先排序
        newSkills.sort((a, b) => {
            const skillA = allSkills.find((s) => s.id === a.skillId);
            const skillB = allSkills.find((s) => s.id === b.skillId);

            if (!skillA || !skillB) return 0;

            // 核心技能优先
            if (skillA.isKey !== skillB.isKey) {
                return skillA.isKey ? -1 : 1;
            }

            // 等级优先
            return b.level - a.level;
        });

        setSelectedSkills(newSkills);
    };

    // 删除技能
    const handleRemoveSkill = (skillId: string) => {
        setSelectedSkills(selectedSkills.filter((s) => s.skillId !== skillId));
    };

    // 添加孔位
    const handleAddSlot = () => {
        if (slots.length >= 3) return;
        setSlots([...slots, { type: 'weapon', level: 1 }]);
    };

    // 更新孔位
    const handleUpdateSlot = (index: number, type: SlotType, level: SlotLevel) => {
        const newSlots = [...slots];
        newSlots[index] = { type, level };
        setSlots(newSlots);
    };

    // 删除孔位
    const handleRemoveSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    // 提交表单
    const handleSubmit = () => {
        if (selectedSkills.length === 0) {
            alert('请至少选择一个技能');
            return;
        }

        if (charmToEdit) {
            // 编辑模式：更新现有护石
            updateAndRecalculateCharm(charmToEdit.id, {
                rarity,
                skills: selectedSkills,
                slots,
            });
        } else {
            // 添加模式：创建新护石
            createCharm({ rarity, skills: selectedSkills, slots });

            // 重置表单
            setRarity(10);
            setSelectedSkills([]);
            setSlots([]);
        }

        onSuccess?.();
    };

    return (
        <div className="space-y-8">
            {/* 稀有度选择 */}
            <div className="flex items-center gap-2">
                <Label className="text-base font-medium w-16 shrink-0">稀有度</Label>
                <Badge variant="outline" className="text-sm font-medium w-12 justify-center mr-4" style={{
                    color: rarity === 12 ? 'black' : `var(--rarity-${rarity})`,
                    borderColor: rarity === 12 ? 'var(--border)' : `var(--rarity-${rarity})`,
                    background: rarity === 12 ? `var(--rarity-${rarity})` : 'transparent'
                }}>
                    R{rarity}
                </Badge>
                <div className="flex-1 min-w-0">
                    <Slider
                        value={[rarity]}
                        onValueChange={(values) => setRarity(values[0])}
                        min={1}
                        max={12}
                        step={1}
                    />
                </div>
            </div>

            {/* 技能和孔位并排布局 */}
            <div className="grid grid-cols-2 gap-6">
                {/* 技能选择 */}
                <div className="flex flex-col gap-3">
                    <Label className="text-base font-medium space-y-3">技能 ({selectedSkills.length}/3)</Label>

                    {selectedSkills.slice(0, 3).map((skillWithLevel, index) => {
                        const skill = allSkills.find((s) => s.id === skillWithLevel.skillId);
                        if (!skill) return (
                            <div key={`empty-skill-${index}`} className="h-10"></div>
                        );

                        return (
                            <div
                                key={skillWithLevel.skillId}
                                className="flex items-center gap-2 p-2 bg-muted rounded-md h-10"
                            >
                                <span className="flex-1">
                                    {skill.name} Lv.{skillWithLevel.level}
                                    {skill.isKey && ' ⭐'}
                                </span>
                                <Badge variant="outline">
                                    {skill.type === 'weapon' ? '武器' : skill.type === 'armor' ? '防具' : '特殊'}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSkill(skillWithLevel.skillId)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    })}
                    {/* 填充空槽位 */}
                    {[...Array(Math.max(0, 3 - selectedSkills.length))].map((_, index) => (
                        <div key={`empty-skill-${selectedSkills.length + index}`} className="h-10 bg-muted rounded-md"></div>
                    ))}

                    {/* 技能选择器 */}
                    <SkillSelector
                        onSelect={handleAddSkill}
                        excludeSkillIds={selectedSkills.map((s) => s.skillId)}
                    />
                </div>

                {/* 孔位选择 */}
                <div className="flex flex-col gap-3">
                    <Label className="text-base font-medium space-y-3">孔位 ({slots.length}/3)</Label>

                    {slots.slice(0, 3).map((slot, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted rounded-md h-10"
                        >
                            <Select
                                value={slot.type}
                                onValueChange={(v) => handleUpdateSlot(index, v as SlotType, slot.level)}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weapon">武器孔</SelectItem>
                                    <SelectItem value="armor">防具孔</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={slot.level.toString()}
                                onValueChange={(v) => handleUpdateSlot(index, slot.type, parseInt(v) as SlotLevel)}
                            >
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1级</SelectItem>
                                    <SelectItem value="2">2级</SelectItem>
                                    <SelectItem value="3">3级</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSlot(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {/* 填充空槽位 */}
                    {[...Array(Math.max(0, 3 - slots.length))].map((_, index) => (
                        <div key={`empty-slot-${slots.length + index}`} className="h-10 bg-muted rounded-md"></div>
                    ))}

                    {/* 添加孔位按钮 */}
                    <Button variant="outline" onClick={handleAddSlot} className="w-full">
                        添加孔位
                    </Button>
                </div>
            </div>

            {/* 护石价值评估 */}
            <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg">
                <div className="font-medium">
                    核心技能价值: <span className="text-primary">{keySkillValue}</span>
                </div>
                <div className="text-sm flex gap-2 md:gap-4">
                    <div className="flex items-center gap-1">
                        <img src="/weapon.png" alt="WeaponSlot" style={{ width: '1.5rem', height: '1.5rem' }} />
                        {equivalentSlots.weaponSlot3}/{equivalentSlots.weaponSlot2}/{equivalentSlots.weaponSlot1}
                    </div>
                    <div className="flex items-center gap-1">
                        <img src="/armor.png" alt="ArmorSlot" style={{ width: '1.5rem', height: '1.5rem' }} />
                        {equivalentSlots.armorSlot3}/{equivalentSlots.armorSlot2}/{equivalentSlots.armorSlot1}
                    </div>
                </div>
            </div>

            {/* 验证提示 */}
            <CharmValidation validation={validation} />

            {/* 操作按钮 */}
            <div className="flex gap-3 justify-end pt-4 border-t">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>
                        取消
                    </Button>
                )}
                <Button onClick={handleSubmit} disabled={selectedSkills.length === 0}>
                    {charmToEdit ? '更新护石' : '添加护石'}
                </Button>
            </div>
        </div>
    );
}