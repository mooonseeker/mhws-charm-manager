import { ChevronDown, ChevronUp, Filter, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useCharms, useSkills } from '@/contexts';
import { CHARMS_PER_PAGE } from '@/types/constants';
import { sortCharms } from '@/utils';

import type { Charm, CharmSortField, SortDirection } from '@/types';

interface CharmListProps {
    onEdit?: (charm: Charm) => void;
}

/**
 * 护石列表组件
 * 
 * 显示护石列表，支持：
 * - 默认按核心技能价值降序、稀有度降序排序
 * - 筛选（按稀有度、技能、核心技能阈值）
 * - 排序字段切换
 * - 编辑和删除操作
 */
export function CharmList({ onEdit }: CharmListProps) {
    const { charms, deleteCharm } = useCharms();
    const { skills } = useSkills();

    // 筛选状态
    const [rarityRange, setRarityRange] = useState<[number, number]>([1, 12]);
    const [minKeySkillValue, setMinKeySkillValue] = useState<number | null>(null);
    const [filterSkillId, setFilterSkillId] = useState<string>('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // 排序状态
    const [sortField, setSortField] = useState<CharmSortField>('keySkillValue');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // 分页和搜索状态
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // 计算动态稀有度范围
    const rarityBounds = useMemo(() => {
        if (charms.length === 0) return { min: 1, max: 12 };
        const rarities = charms.map(c => c.rarity);
        return {
            min: Math.min(...rarities),
            max: Math.max(...rarities)
        };
    }, [charms]);

    // 筛选护石
    const searchedCharms = useMemo(() => {
        let filtered = [...charms];

        // 按稀有度筛选
        if (rarityRange) {
            filtered = filtered.filter((c) => c.rarity >= rarityRange[0] && c.rarity <= rarityRange[1]);
        }

        // 按核心技能价值筛选
        if (minKeySkillValue !== null) {
            filtered = filtered.filter((c) => c.keySkillValue >= minKeySkillValue);
        }

        // 按技能筛选
        if (filterSkillId && filterSkillId !== 'all') {
            filtered = filtered.filter((c) =>
                c.skills.some((s) => s.skillId === filterSkillId)
            );
        }

        // 按搜索关键词筛选
        if (searchQuery) {
            // 检查是否为精确匹配（以等号开头）
            const isExactMatch = searchQuery.startsWith('=');
            const keyword = isExactMatch ? searchQuery.slice(1) : searchQuery;

            filtered = filtered.filter((c) =>
                c.skills.some((s) => {
                    const skill = skills.find((sk) => sk.id === s.skillId);
                    const skillName = skill?.name || '未知技能';
                    return isExactMatch
                        ? skillName.toLowerCase() === keyword.toLowerCase()
                        : skillName.toLowerCase().includes(keyword.toLowerCase());
                })
            );
        }

        return filtered;
    }, [charms, rarityRange, minKeySkillValue, filterSkillId, searchQuery, skills]);

    // 排序和分页护石
    const paginatedCharms = useMemo(() => {
        // 排序
        const sorted = sortCharms(searchedCharms, sortField, sortDirection);

        // 分页
        return sorted.slice(
            (currentPage - 1) * CHARMS_PER_PAGE,
            currentPage * CHARMS_PER_PAGE
        );
    }, [searchedCharms, sortField, sortDirection, currentPage]);

    // 计算总页数
    const totalPages = Math.ceil(searchedCharms.length / CHARMS_PER_PAGE);

    // 切换排序字段
    const handleSortFieldChange = (field: CharmSortField) => {
        if (field === sortField) {
            // 切换方向
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // 新字段，默认降序
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // 当稀有度边界变化时，同步滑块状态
    useEffect(() => {
        setRarityRange([rarityBounds.min, rarityBounds.max]);
    }, [rarityBounds]);

    // 当筛选条件变化时，重置到第一页
    useEffect(() => {
        setCurrentPage(1);
    }, [rarityRange, minKeySkillValue, filterSkillId, searchQuery]);

    // 删除护石
    const handleDelete = (id: string) => {
        if (confirm('确定要删除这个护石吗？')) {
            deleteCharm(id);
        }
    };

    // 获取技能名称
    const getSkillName = (skillId: string) => {
        const skill = skills.find((s) => s.id === skillId);
        return skill?.name || '未知技能';
    };

    // 获取技能是否为核心技能
    const isKeySkill = (skillId: string) => {
        const skill = skills.find((s) => s.id === skillId);
        return skill?.isKey || false;
    };

    // 获取装饰品等级图标
    const getDecorationIcon = (slotType: 'weapon' | 'armor', level: number) => {
        return `/${slotType}-slot-${level}.png`;
    };

    // 渲染排序图标
    const SortIcon = ({ field }: { field: CharmSortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4 inline ml-1" />
        ) : (
            <ChevronDown className="h-4 w-4 inline ml-1" />
        );
    };

    return (
        <div className="space-y-6">
            {/* 菜单栏 */}
            <div className="bg-card p-4 sm:p-6 rounded-lg border shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button
                            variant="default"
                            size="sm"
                            className="text-xs sm:text-sm"
                            onClick={() => {
                                setRarityRange([rarityBounds.min, rarityBounds.max]);
                                setMinKeySkillValue(null);
                                setFilterSkillId('all');
                                setSearchQuery('');
                            }}
                        >
                            全部
                        </Button>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Rare</Badge>
                            <Slider
                                value={rarityRange}
                                onValueChange={(value) => setRarityRange(value as [number, number])}
                                min={rarityBounds.min}
                                max={rarityBounds.max}
                                step={1}
                                className="w-48 -mt-5"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 justify-end">
                        <div className="text-muted-foreground text-sm">
                            共 {searchedCharms.length} 个护石
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

            {/* 可折叠筛选器 */}
            {isFilterVisible && (
                <div className="p-4 sm:p-6 bg-muted rounded-lg space-y-4">
                    <h3 className="font-medium text-base sm:text-lg">筛选条件</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">最小核心技能价值</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="0+"
                                value={minKeySkillValue ?? ''}
                                onChange={(e) => setMinKeySkillValue(e.target.value ? parseInt(e.target.value) : null)}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">包含技能</Label>
                            <Select value={filterSkillId} onValueChange={setFilterSkillId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="全部技能" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部技能</SelectItem>
                                    {skills.map((skill) => (
                                        <SelectItem key={skill.id} value={skill.id}>
                                            {skill.name} {skill.isKey && '⭐'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {(rarityRange[0] !== rarityBounds.min || rarityRange[1] !== rarityBounds.max || minKeySkillValue || (filterSkillId && filterSkillId !== 'all')) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setRarityRange([rarityBounds.min, rarityBounds.max]);
                                setMinKeySkillValue(null);
                                setFilterSkillId('all');
                            }}
                        >
                            清除筛选
                        </Button>
                    )}
                </div>
            )}

            {/* 护石列表 */}
            <div className="rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer text-center bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleSortFieldChange('rarity')}
                            >
                                <span className="hidden sm:inline">稀有度</span>
                                <span className="sm:hidden">R</span>
                                {' '}<SortIcon field="rarity" />
                            </TableHead>
                            <TableHead className="text-center bg-primary text-primary-foreground">技能</TableHead>
                            <TableHead className="hidden md:table-cell text-center bg-primary text-primary-foreground">孔位</TableHead>
                            <TableHead
                                className="cursor-pointer text-center bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleSortFieldChange('keySkillValue')}
                            >
                                <span className="hidden sm:inline">核心价值</span>
                                <span className="sm:hidden">价值</span>
                                {' '}<SortIcon field="keySkillValue" />
                            </TableHead>
                            <TableHead className="hidden lg:table-cell text-center bg-primary text-primary-foreground">等效孔位</TableHead>
                            <TableHead
                                className="hidden lg:table-cell cursor-pointer text-center bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleSortFieldChange('createdAt')}
                            >
                                创建时间 <SortIcon field="createdAt" />
                            </TableHead>
                            <TableHead className="text-right bg-primary text-primary-foreground">
                                <div className="flex items-center justify-end gap-1">
                                    操作
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setIsFilterVisible((prev) => !prev)}
                                    >
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedCharms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    {charms.length === 0 ? '暂无护石' : '没有符合条件的护石'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedCharms.map((charm) => (
                                <TableRow key={charm.id}>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-xs" style={{
                                            color: charm.rarity === 12 ? 'black' : `var(--rarity-${charm.rarity})`,
                                            borderColor: charm.rarity === 12 ? 'var(--border)' : `var(--rarity-${charm.rarity})`,
                                            background: charm.rarity === 12 ? `var(--rarity-${charm.rarity})` : 'transparent'
                                        }}>
                                            R{charm.rarity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="space-y-1 sm:space-y-2">
                                            {charm.skills.map((skillWithLevel) => (
                                                <div key={skillWithLevel.skillId} className="text-xs sm:text-sm">
                                                    {getSkillName(skillWithLevel.skillId)} Lv.{skillWithLevel.level}
                                                    {isKeySkill(skillWithLevel.skillId) && ' ⭐'}
                                                </div>
                                            ))}
                                            {/* 小屏幕显示孔位信息 */}
                                            {charm.slots.length > 0 && (
                                                <div className="text-xs text-muted-foreground md:hidden mt-1">
                                                    孔位: {charm.slots.map((slot, index) => (
                                                        <span key={index}>
                                                            {slot.type === 'weapon' ? '武' : '防'}{slot.level}
                                                            {index < charm.slots.length - 1 && ', '}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-center">
                                        <div className="flex justify-center gap-2">
                                            {Array.from({ length: 3 }, (_, index) => {
                                                const slot = charm.slots[index];
                                                return slot ? (
                                                    <img
                                                        key={index}
                                                        src={getDecorationIcon(slot.type, slot.level)}
                                                        alt={`${slot.type === 'weapon' ? 'WeaponSlot' : 'ArmorSlot'} ${slot.level}级`}
                                                        style={{ width: '2rem', height: '2rem' }}
                                                    />
                                                ) : (
                                                    <span key={index} className="text-muted-foreground text-sm" style={{ width: '2rem', height: '2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        —
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-medium text-primary text-sm sm:text-base">{charm.keySkillValue}</span>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-center">
                                        <div className="text-sm flex flex-col md:flex-row gap-2 md:gap-4 justify-center">
                                            <div className="flex items-center gap-1">
                                                <img src="/weapon.png" alt="WeaponSlot" style={{ width: '1.5rem', height: '1.5rem' }} />
                                                {charm.equivalentSlots.weaponSlot3}/{charm.equivalentSlots.weaponSlot2}/{charm.equivalentSlots.weaponSlot1}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <img src="/armor.png" alt="ArmorSlot" style={{ width: '1.5rem', height: '1.5rem' }} />
                                                {charm.equivalentSlots.armorSlot3}/{charm.equivalentSlots.armorSlot2}/{charm.equivalentSlots.armorSlot1}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground text-center">
                                        {new Date(charm.createdAt).toLocaleDateString('zh-CN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 sm:gap-2 justify-end">
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(charm)}
                                                    className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(charm.id)}
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