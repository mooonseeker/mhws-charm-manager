import { Pencil, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useSkills } from '@/contexts';
import { SKILL_TYPE_LABELS, SKILLS_PER_PAGE } from '@/types/constants';

import type { Skill, SkillType, SlotLevel } from '@/types';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

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
        if (searchQuery && !skill.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // 分页计算
    const totalPages = Math.ceil(filteredSkills.length / SKILLS_PER_PAGE);
    const paginatedSkills = filteredSkills.slice(
        (currentPage - 1) * SKILLS_PER_PAGE,
        currentPage * SKILLS_PER_PAGE
    );

    // 当筛选条件变化时，重置到第一页
    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, keyOnlyFilter, searchQuery]);

    const handleDelete = (skill: Skill) => {
        if (confirm(`确定要删除技能"${skill.name}"吗？`)) {
            deleteSkill(skill.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* 筛选栏 */}
            <div className="bg-card p-4 sm:p-6 rounded-lg border shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                        <div className="w-2"></div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="key-only"
                                checked={keyOnlyFilter}
                                onCheckedChange={(checked) => setKeyOnlyFilter(checked === true)}
                            />
                            <label htmlFor="key-only" className="cursor-pointer text-xs sm:text-sm">
                                仅核心技能
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 justify-end">
                        <div className="text-muted-foreground text-sm">
                            共 {filteredSkills.length} 个技能
                        </div>
                        <Input
                            type="text"
                            placeholder="搜索技能名称..."
                            className="h-9 max-w-40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

            {/* 技能表格 */}
            <div className="bg-card rounded-lg border shadow-sm overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center min-w-[50px] bg-primary text-primary-foreground">核心</TableHead>
                            <TableHead className="text-center min-w-[120px] bg-primary text-primary-foreground">技能名称</TableHead>
                            <TableHead className="text-center min-w-[80px] bg-primary text-primary-foreground">类型</TableHead>
                            <TableHead className="text-center min-w-[80px] bg-primary text-primary-foreground">装饰品等级</TableHead>
                            <TableHead className="text-center min-w-[60px] bg-primary text-primary-foreground">最大等级</TableHead>
                            <TableHead className="text-right min-w-[80px] bg-primary text-primary-foreground">操作</TableHead>
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
                            paginatedSkills.map((skill) => (
                                <TableRow key={skill.id}>
                                    <TableCell className="text-center">
                                        {skill.isKey && (
                                            <Star className="h-4 w-4 fill-warning text-warning-foreground inline" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {skill.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-center text-xs">
                                            {SKILL_TYPE_LABELS[skill.type]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm">
                                        <div className="flex items-center justify-center gap-4">
                                            {skill.type === 'special' ? (
                                                <span className="text-muted-foreground">—</span>
                                            ) : (
                                                <img
                                                    src={getDecorationIcon(skill.type, skill.decorationLevel)}
                                                    alt={`${SKILL_TYPE_LABELS[skill.type]}装饰品等级${skill.decorationLevel}`}
                                                    style={{ width: '2rem', height: '2rem' }}
                                                />
                                            )}
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
                                                <Trash2 className="h-4 w-4 text-destructive" />
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