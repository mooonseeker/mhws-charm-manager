import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useAccessories } from '@/contexts';
import { useSkills } from '@/contexts/SkillContext';

import type { Accessory } from '@/types';

interface AccessoryListProps {
    onEdit: (accessory: Accessory) => void;
    isLocked?: boolean;
}

/**
 * 装饰品列表组件
 * 显示所有装饰品并支持筛选、排序、编辑和删除
 */

export function AccessoryList({ onEdit, isLocked }: AccessoryListProps) {
    const { accessories, deleteAccessory } = useAccessories();
    const { skills } = useSkills();
    const [typeFilter, setTypeFilter] = useState<'all' | 'weapon' | 'armor'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const ACCESSORIES_PER_PAGE = 10;

    // 获取技能名称
    const getSkillName = (skillId: string) => {
        const skill = skills.find(s => s.id === skillId);
        return skill ? skill.name : skillId;
    };

    // 筛选装饰品
    const filteredAccessories = accessories.filter((accessory) => {
        if (typeFilter !== 'all' && accessory.type !== typeFilter) return false;
        if (searchQuery) {
            const keyword = searchQuery.toLowerCase();
            return accessory.name.toLowerCase().includes(keyword) ||
                accessory.description.toLowerCase().includes(keyword) ||
                accessory.skills.some(skill => getSkillName(skill.skillId).toLowerCase().includes(keyword));
        }
        return true;
    });

    // 分页计算
    const totalPages = Math.ceil(filteredAccessories.length / ACCESSORIES_PER_PAGE);
    const paginatedAccessories = filteredAccessories.slice(
        (currentPage - 1) * ACCESSORIES_PER_PAGE,
        currentPage * ACCESSORIES_PER_PAGE
    );

    // 当筛选条件变化时，重置到第一页
    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, searchQuery]);

    const handleDelete = (accessory: Accessory) => {
        if (confirm(`确定要删除装饰品"${accessory.name}"吗？`)) {
            deleteAccessory(accessory.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* 菜单栏 */}
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
                    </div>

                    <div className="flex items-center gap-4 justify-end">
                        <div className="text-muted-foreground text-sm">
                            共 {filteredAccessories.length} 个装饰品
                        </div>
                        <Input
                            type="text"
                            placeholder="搜索装饰品名称或技能..."
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

            {/* 装饰品表格 */}
            <div className="bg-card rounded-lg border shadow-sm overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center min-w-[150px] bg-primary text-primary-foreground">装饰品名称</TableHead>
                            <TableHead className="text-center min-w-[80px] bg-primary text-primary-foreground">类型</TableHead>
                            <TableHead className="text-center min-w-[60px] bg-primary text-primary-foreground">稀有度</TableHead>
                            <TableHead className="text-center min-w-[80px] bg-primary text-primary-foreground">孔位等级</TableHead>
                            <TableHead className="text-center min-w-[200px] bg-primary text-primary-foreground">技能</TableHead>
                            <TableHead className="text-right min-w-[80px] bg-primary text-primary-foreground">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAccessories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    暂无装饰品数据
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedAccessories.map((accessory) => (
                                <TableRow key={accessory.id}>
                                    <TableCell className="text-center font-medium">
                                        {accessory.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-center text-xs">
                                            {accessory.type === 'weapon' ? '武器' : '防具'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        ★{accessory.rarity}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {accessory.slotLevel}
                                    </TableCell>
                                    <TableCell className="text-center text-sm">
                                        <div className="flex flex-col gap-1">
                                            {accessory.skills.map((skill, index) => (
                                                <div key={index} className="text-xs">
                                                    {getSkillName(skill.skillId)} Lv.{skill.level}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 sm:gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(accessory)}
                                                disabled={isLocked}
                                                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(accessory)}
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