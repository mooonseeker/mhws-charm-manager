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
import { SKILL_CATEGORY_LABELS, SKILLS_PER_PAGE } from '@/types/constants';

import type { Skill, SkillCategory, SlotLevel } from '@/types';

interface SkillListProps {
    onEdit: (skill: Skill) => void;
    isLocked?: boolean;
}

/**
 * 技能列表组件
 * 显示所有技能并支持筛选、排序、编辑和删除
 */

export function SkillList({ onEdit, isLocked }: SkillListProps) {
    const { skills, deleteSkill } = useSkills();
    const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');
    const [keyOnlyFilter, setKeyOnlyFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // 获取装饰品等级图标
    const getAccessoryIcon = (skillCategory: SkillCategory, accessoryLevel: SlotLevel) => {
        switch (skillCategory) {
            case 'weapon':
                return `/slot/weapon-slot-${accessoryLevel}.png`;
            case 'armor':
                return `/slot/armor-slot-${accessoryLevel}.png`;
            case 'series':
            case 'group':
            default:
                return `/special.png`;
        }
    };

    // 筛选技能
    const filteredSkills = skills.filter((skill) => {
        if (categoryFilter !== 'all' && skill.category !== categoryFilter) return false;
        if (keyOnlyFilter && !skill.isKey) return false;
        if (searchQuery) {
            // 检查是否为精确匹配（以等号开头）
            const isExactMatch = searchQuery.startsWith('=');
            const keyword = isExactMatch ? searchQuery.slice(1) : searchQuery;

            const matches = isExactMatch
                ? skill.name.toLowerCase() === keyword.toLowerCase()
                : skill.name.toLowerCase().includes(keyword.toLowerCase());

            if (!matches) return false;
        }
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
    }, [categoryFilter, keyOnlyFilter, searchQuery]);

    const handleDelete = (skill: Skill) => {
        if (confirm(`确定要删除技能"${skill.name}"吗？`)) {
            deleteSkill(skill.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* 菜单栏 */}
            <div className="bg-card p-4 sm:p-6 rounded-lg border shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button
                            variant={categoryFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter('all')}
                            className="text-xs sm:text-sm"
                        >
                            全部
                        </Button>
                        <Button
                            variant={categoryFilter === 'weapon' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter('weapon')}
                            className="text-xs sm:text-sm"
                        >
                            武器
                        </Button>
                        <Button
                            variant={categoryFilter === 'armor' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter('armor')}
                            className="text-xs sm:text-sm"
                        >
                            防具
                        </Button>
                        <Button
                            variant={categoryFilter === 'series' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter('series')}
                            className="text-xs sm:text-sm"
                        >
                            套装
                        </Button>
                        <Button
                            variant={categoryFilter === 'group' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter('group')}
                            className="text-xs sm:text-sm"
                        >
                            组合
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
                            <TableHead className="text-center min-w-[80px] bg-primary text-primary-foreground">分类</TableHead>
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
                                    <TableCell className="text-left font-medium">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`/skill-type/${skill.type}.png`}
                                                alt={`${skill.type} icon`}
                                                style={{ width: '1.5rem', height: '1.5rem' }}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            {skill.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-center text-xs">
                                            {SKILL_CATEGORY_LABELS[skill.category]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm">
                                        <div className="flex items-center justify-center gap-4">
                                            {skill.accessoryLevel !== -1 ? (
                                                <img
                                                    src={getAccessoryIcon(skill.category, skill.accessoryLevel)}
                                                    alt={`${SKILL_CATEGORY_LABELS[skill.category]}装饰品等级${skill.accessoryLevel}`}
                                                    style={{ width: '1.5rem', height: '1.5rem' }}
                                                />
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
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
                                                disabled={isLocked}
                                                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(skill)}
                                                disabled={isLocked}
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