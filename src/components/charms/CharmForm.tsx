import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useSkills } from '@/contexts';
import { useCharmOperations } from '@/hooks';
import type { SkillWithLevel, Slot, SlotType, SlotLevel } from '@/types';
import { calculateCharmEquivalentSlots, calculateKeySkillValue } from '@/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SkillSelector } from './SkillSelector';
import { CharmValidation } from './CharmValidation';
import { Badge } from '@/components/ui/badge';

interface CharmFormProps {
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
export function CharmForm({ onSuccess, onCancel }: CharmFormProps) {
    const { skills: allSkills } = useSkills();
    const { createCharm, validateNewCharm } = useCharmOperations();

    const [rarity, setRarity] = useState(10);
    const [selectedSkills, setSelectedSkills] = useState<SkillWithLevel[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);

    // 实时计算等效孔位和核心技能价值
    const { equivalentSlots, keySkillValue } = useMemo(() => {
        const eq = calculateCharmEquivalentSlots(selectedSkills, slots, allSkills);
        const kv = calculateKeySkillValue(eq);
        return { equivalentSlots: eq, keySkillValue: kv };
    }, [selectedSkills, slots, allSkills]);

    // 实时验证
    const validation = useMemo(() => {
        if (selectedSkills.length === 0) return null;
        return validateNewCharm({ rarity, skills: selectedSkills, slots });
    }, [rarity, selectedSkills, slots, validateNewCharm]);

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

        createCharm({ rarity, skills: selectedSkills, slots });

        // 重置表单
        setRarity(10);
        setSelectedSkills([]);
        setSlots([]);

        onSuccess?.();
    };

    return (
        <div className="space-y-6">
            {/* 稀有度选择 */}
            <div className="space-y-2">
                <Label>稀有度</Label>
                <Select value={rarity.toString()} onValueChange={(v) => setRarity(parseInt(v))}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((r) => (
                            <SelectItem key={r} value={r.toString()}>
                                稀有度 {r}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 技能选择 */}
            <div className="space-y-2">
                <Label>技能 ({selectedSkills.length}/3)</Label>

                {/* 已选技能列表 */}
                {selectedSkills.length > 0 && (
                    <div className="space-y-2 mb-3">
                        {selectedSkills.map((skillWithLevel) => {
                            const skill = allSkills.find((s) => s.id === skillWithLevel.skillId);
                            if (!skill) return null;

                            return (
                                <div
                                    key={skillWithLevel.skillId}
                                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-md"
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
                    </div>
                )}

                {/* 技能选择器 */}
                {selectedSkills.length < 3 && (
                    <SkillSelector
                        onSelect={handleAddSkill}
                        excludeSkillIds={selectedSkills.map((s) => s.skillId)}
                    />
                )}
            </div>

            {/* 孔位选择 */}
            <div className="space-y-2">
                <Label>孔位 ({slots.length}/3)</Label>

                {/* 已选孔位列表 */}
                {slots.length > 0 && (
                    <div className="space-y-2 mb-3">
                        {slots.map((slot, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-slate-50 rounded-md"
                            >
                                <Select
                                    value={slot.type}
                                    onValueChange={(v) => handleUpdateSlot(index, v as SlotType, slot.level)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weapon">武器孔位</SelectItem>
                                        <SelectItem value="armor">防具孔位</SelectItem>
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
                    </div>
                )}

                {/* 添加孔位按钮 */}
                {slots.length < 3 && (
                    <Button variant="outline" onClick={handleAddSlot} className="w-full">
                        添加孔位
                    </Button>
                )}
            </div>

            {/* 等效孔位统计 */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <h3 className="font-medium text-sm">等效孔位统计</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>武器孔位1级: {equivalentSlots.weaponSlot1}</div>
                    <div>防具孔位1级: {equivalentSlots.armorSlot1}</div>
                    <div>武器孔位2级: {equivalentSlots.weaponSlot2}</div>
                    <div>防具孔位2级: {equivalentSlots.armorSlot2}</div>
                    <div>武器孔位3级: {equivalentSlots.weaponSlot3}</div>
                    <div>防具孔位3级: {equivalentSlots.armorSlot3}</div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                    <div className="font-medium">
                        核心技能价值: <span className="text-blue-600">{keySkillValue}</span>
                    </div>
                </div>
            </div>

            {/* 验证提示 */}
            <CharmValidation validation={validation} />

            {/* 操作按钮 */}
            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>
                        取消
                    </Button>
                )}
                <Button onClick={handleSubmit} disabled={selectedSkills.length === 0}>
                    添加护石
                </Button>
            </div>
        </div>
    );
}