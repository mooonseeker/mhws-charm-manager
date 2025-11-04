import { useMemo } from 'react';

import { ErrorMessage, Loading } from '@/components/common';
import { EquipmentCard } from '@/components/equipments';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useArmor } from '@/contexts/ArmorContext';

import type { Armor, SkillWithLevel } from '@/types';

/**
 * 按系列分组的防具数据结构
 */
interface GroupedArmor {
    series: string;
    helm?: Armor;
    body?: Armor;
    arm?: Armor;
    waist?: Armor;
    leg?: Armor;
    fullSetSkills: SkillWithLevel[];
}

/**
 * ArmorList 组件
 *
 * 显示按系列分组的防具列表表格
 */
export function ArmorList() {
    const { armor, loading, error } = useArmor();

    /**
     * 将防具数组按系列分组，并计算全套技能
     */
    const groupedArmor = useMemo((): GroupedArmor[] => {
        const groups = new Map<string, GroupedArmor>();

        armor.forEach((piece: Armor) => {
            if (!groups.has(piece.series)) {
                groups.set(piece.series, {
                    series: piece.series,
                    fullSetSkills: []
                });
            }

            const group = groups.get(piece.series)!;

            // 根据防具类型分配到对应字段
            switch (piece.type) {
                case 'helm':
                    group.helm = piece;
                    break;
                case 'body':
                    group.body = piece;
                    break;
                case 'arm':
                    group.arm = piece;
                    break;
                case 'waist':
                    group.waist = piece;
                    break;
                case 'leg':
                    group.leg = piece;
                    break;
            }
        });

        // 计算每个系列的全套技能
        groups.forEach(group => {
            const allSkills = [
                ...(group.helm?.skills || []),
                ...(group.body?.skills || []),
                ...(group.arm?.skills || []),
                ...(group.waist?.skills || []),
                ...(group.leg?.skills || [])
            ];

            const skillMap = new Map<string, number>();

            allSkills.forEach(skill => {
                const currentLevel = skillMap.get(skill.skillId) || 0;
                skillMap.set(skill.skillId, currentLevel + skill.level);
            });

            group.fullSetSkills = Array.from(skillMap.entries()).map(([skillId, level]) => ({
                skillId,
                level
            }));
        });

        return Array.from(groups.values());
    }, [armor]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    /**
     * 渲染防具部件列
     */
    const renderArmorPiece = (piece?: Armor) => {
        if (!piece) {
            return <TableCell>-</TableCell>;
        }

        return (
            <TableCell>
                <EquipmentCard item={piece} />
            </TableCell>
        );
    };

    /**
     * 渲染全套技能列
     */
    const renderFullSetSkills = (skills: SkillWithLevel[]) => {
        if (skills.length === 0) {
            return <TableCell>-</TableCell>;
        }

        return (
            <TableCell>
                <div className="space-y-1">
                    {skills.map(skill => (
                        <Badge key={skill.skillId} variant="secondary" className="text-xs">
                            {skill.skillId} Lv.{skill.level}
                        </Badge>
                    ))}
                </div>
            </TableCell>
        );
    };

    return (
        <div className="armor-list">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>防具系列</TableHead>
                        <TableHead>头盔</TableHead>
                        <TableHead>胸甲</TableHead>
                        <TableHead>臂甲</TableHead>
                        <TableHead>腰甲</TableHead>
                        <TableHead>腿甲</TableHead>
                        <TableHead>全套技能</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupedArmor.map(group => (
                        <TableRow key={group.series}>
                            <TableCell>
                                <Badge variant="outline">{group.series}</Badge>
                            </TableCell>
                            {renderArmorPiece(group.helm)}
                            {renderArmorPiece(group.body)}
                            {renderArmorPiece(group.arm)}
                            {renderArmorPiece(group.waist)}
                            {renderArmorPiece(group.leg)}
                            {renderFullSetSkills(group.fullSetSkills)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}