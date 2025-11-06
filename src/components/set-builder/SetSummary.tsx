import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSkills } from '@/contexts';

import type { EquipmentSet } from '@/types/set-builder';
import type { SkillWithLevel, Accessory } from '@/types';

export interface SetSummaryProps {
    equipmentSet: EquipmentSet;
}

export function SetSummary({ equipmentSet }: SetSummaryProps) {
    const { skills: allSkillsData } = useSkills();

    const aggregatedSkills = useMemo(() => {
        const skillMap = new Map<string, { level: number; name: string; maxLevel: number }>();

        // 遍历所有装备部件
        Object.values(equipmentSet).forEach((slottedPiece) => {
            if (slottedPiece) {
                // 累加装备自带的技能
                slottedPiece.equipment.skills.forEach((skill: SkillWithLevel) => {
                    const current = skillMap.get(skill.skillId);
                    if (current) {
                        current.level += skill.level;
                    } else {
                        const skillData = allSkillsData.find(s => s.id === skill.skillId);
                        skillMap.set(skill.skillId, {
                            level: skill.level,
                            name: skillData?.name || '未知技能',
                            maxLevel: skillData?.maxLevel || 1
                        });
                    }
                });
                // 累加装饰品技能
                slottedPiece.accessories.forEach((acc: Accessory | null) => {
                    if (acc) {
                        acc.skills.forEach((skill: SkillWithLevel) => {
                            const current = skillMap.get(skill.skillId);
                            if (current) {
                                current.level += skill.level;
                            } else {
                                const skillData = allSkillsData.find(s => s.id === skill.skillId);
                                skillMap.set(skill.skillId, {
                                    level: skill.level,
                                    name: skillData?.name || '未知技能',
                                    maxLevel: skillData?.maxLevel || 1
                                });
                            }
                        });
                    }
                });
            }
        });

        return Array.from(skillMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [equipmentSet, allSkillsData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>套装技能汇总</CardTitle>
            </CardHeader>
            <CardContent>
                {aggregatedSkills.length === 0 ? (
                    <p className="text-muted-foreground">尚未选择任何带有技能的装备。</p>
                ) : (
                    <ul className="space-y-2">
                        {aggregatedSkills.map((skill) => (
                            <li key={skill.name} className="flex justify-between items-center">
                                <span className="font-medium">{skill.name}</span>
                                <span className="text-sm">
                                    Lv. <span className={skill.level >= skill.maxLevel ? 'text-primary font-bold' : ''}>{skill.level}</span> / {skill.maxLevel}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}