import { useState } from 'react';
import { Pencil, Trash2, Star } from 'lucide-react';
import { useSkills } from '@/contexts';
import type { Skill, SkillType, SlotLevel } from '@/types';
import { SKILL_TYPE_LABELS } from '@/types/constants';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SkillListProps {
    onEdit: (skill: Skill) => void;
}

/**
 * 技能列表组件
 * 显示所有技能并支持筛选、排序、编辑和删除
 */
export function SkillList({ onEdit }: SkillListProps) {
    const { skills, deleteSkill } = useSkills();
    const [typeFilter, setTypeFilter] = useState<SkillType | 'all'>('all');
    const [keyOnlyFilter, setKeyOnlyFilter] = useState(false);

    // 获取装饰品等级图标
    const getDecorationIcon = (skillType: SkillType, decorationLevel: SlotLevel) => {
        switch (skillType) {
            case 'weapon':
                return `/weapon-slot-${decorationLevel}.png`;
            case 'armor':
                return `/armor-slot-${decorationLevel}.png`;
            case 'special':
                return `/special.png`;
            default:
                return `/special.png`;
        }
    };

    // 筛选技能
    const filteredSkills = skills.filter((skill) => {
        if (typeFilter !== 'all' && skill.type !== typeFilter) return false;
        if (keyOnlyFilter && !skill.isKey) return false;
        return true;
    });

    const handleDelete = (skill: Skill) => {
        if (confirm(`确定要删除技能"${skill.name}"吗？`)) {
            deleteSkill(skill.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* 筛选栏 - 响应式布局 */}
            <div className="bg-card p-4 sm:p-6 rounded-lg border shadow-sm space-y-4">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button
                        variant={typeFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter('all')}
                        className="text-xs sm:text-sm"
                    >
                        全部
                    </Button>
                    <Button
                        variant={typeFilter === 'weapon' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter('weapon')}
                        className="text-xs sm:text-sm"
                    >
                        武器
                    </Button>
                    <Button
                        variant={typeFilter === 'armor' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter('armor')}
                        className="text-xs sm:text-sm"
                    >
                        防具
                    </Button>
                    <Button
                        variant={typeFilter === 'special' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter('special')}
                        className="text-xs sm:text-sm"
                    >
                        特殊
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="key-only"
                            checked={keyOnlyFilter}
                            onChange={(e) => setKeyOnlyFilter(e.target.checked)}
                            className="rounded border-border"
                        />
                        <label htmlFor="key-only" className="cursor-pointer">
                            仅核心
                        </label>
                    </div>

                    <div className="text-muted-foreground ml-auto">
                        共 {filteredSkills.length} 个
                    </div>
                </div>
            </div>

            {/* 技能表格 - 始终显示六栏布局 */}
            <div className="bg-card rounded-lg border shadow-sm overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center min-w-[50px]">核心</TableHead>
                            <TableHead className="min-w-[120px]">技能名称</TableHead>
                            <TableHead className="min-w-[80px]">类型</TableHead>
                            <TableHead className="text-center min-w-[80px]">装饰品等级</TableHead>
                            <TableHead className="text-center min-w-[60px]">最大等级</TableHead>
                            <TableHead className="text-right min-w-[100px]">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSkills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    暂无技能数据
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSkills.map((skill) => (
                                <TableRow key={skill.id}>
                                    <TableCell className="text-center">
                                        {skill.isKey && (
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 inline" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {skill.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {SKILL_TYPE_LABELS[skill.type]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm">
                                        <div className="flex items-center justify-center gap-4">
                                            <img
                                                src={getDecorationIcon(skill.type, skill.decorationLevel)}
                                                alt={`${SKILL_TYPE_LABELS[skill.type]}装饰品等级${skill.decorationLevel}`}
                                                style={{ width: '2rem', height: '2rem' }}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{skill.maxLevel}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 sm:gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(skill)}
                                                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(skill)}
                                                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}