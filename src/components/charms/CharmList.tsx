import { useState, useMemo } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCharms } from '@/contexts';
import { useSkills } from '@/contexts';
import type { Charm, CharmSortField, SortDirection } from '@/types';
import { sortCharms, sortCharmsDefault } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    const [minRarity, setMinRarity] = useState<number | null>(null);
    const [maxRarity, setMaxRarity] = useState<number | null>(null);
    const [minKeySkillValue, setMinKeySkillValue] = useState<number | null>(null);
    const [filterSkillId, setFilterSkillId] = useState<string>('');

    // 排序状态
    const [sortField, setSortField] = useState<CharmSortField>('keySkillValue');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // 筛选和排序护石
    const displayedCharms = useMemo(() => {
        let filtered = [...charms];

        // 按稀有度筛选
        if (minRarity !== null) {
            filtered = filtered.filter((c) => c.rarity >= minRarity);
        }
        if (maxRarity !== null) {
            filtered = filtered.filter((c) => c.rarity <= maxRarity);
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

        // 排序
        if (sortField === 'keySkillValue' && sortDirection === 'desc' && !minRarity && !maxRarity && !minKeySkillValue && !filterSkillId) {
            // 使用默认排序
            return sortCharmsDefault(filtered);
        } else {
            return sortCharms(filtered, sortField, sortDirection);
        }
    }, [charms, minRarity, maxRarity, minKeySkillValue, filterSkillId, sortField, sortDirection]);

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
            {/* 筛选器 - 响应式布局 */}
            <div className="p-4 sm:p-6 bg-muted rounded-lg space-y-4">
                <h3 className="font-medium text-base sm:text-lg">筛选条件</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">最小稀有度</Label>
                        <Input
                            type="number"
                            min={1}
                            max={12}
                            placeholder="1-12"
                            value={minRarity ?? ''}
                            onChange={(e) => setMinRarity(e.target.value ? parseInt(e.target.value) : null)}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">最大稀有度</Label>
                        <Input
                            type="number"
                            min={1}
                            max={12}
                            placeholder="1-12"
                            value={maxRarity ?? ''}
                            onChange={(e) => setMaxRarity(e.target.value ? parseInt(e.target.value) : null)}
                        />
                    </div>
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
                {(minRarity || maxRarity || minKeySkillValue || (filterSkillId && filterSkillId !== 'all')) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setMinRarity(null);
                            setMaxRarity(null);
                            setMinKeySkillValue(null);
                            setFilterSkillId('all');
                        }}
                    >
                        清除筛选
                    </Button>
                )}
            </div>

            {/* 护石列表 - 响应式表格 */}
            <div className="rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => handleSortFieldChange('rarity')}
                            >
                                <span className="hidden sm:inline">稀有度</span>
                                <span className="sm:hidden">R</span>
                                {' '}<SortIcon field="rarity" />
                            </TableHead>
                            <TableHead>技能</TableHead>
                            <TableHead className="hidden md:table-cell">孔位</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => handleSortFieldChange('keySkillValue')}
                            >
                                <span className="hidden sm:inline">核心价值</span>
                                <span className="sm:hidden">价值</span>
                                {' '}<SortIcon field="keySkillValue" />
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">等效孔位</TableHead>
                            <TableHead
                                className="hidden lg:table-cell cursor-pointer hover:bg-muted"
                                onClick={() => handleSortFieldChange('createdAt')}
                            >
                                创建时间 <SortIcon field="createdAt" />
                            </TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedCharms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    {charms.length === 0 ? '暂无护石' : '没有符合条件的护石'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayedCharms.map((charm) => (
                                <TableRow key={charm.id}>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            <span className="hidden sm:inline">稀有度 </span>
                                            {charm.rarity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
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
                                    <TableCell className="hidden md:table-cell">
                                        {charm.slots.length === 0 ? (
                                            <span className="text-muted-foreground text-sm">无</span>
                                        ) : (
                                            <div className="space-y-1">
                                                {charm.slots.map((slot, index) => (
                                                    <div key={index} className="text-xs">
                                                        {slot.type === 'weapon' ? '武器' : '防具'} {slot.level}级
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-primary text-sm sm:text-base">{charm.keySkillValue}</span>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <div className="text-xs space-y-1">
                                            <div>武: {charm.equivalentSlots.weaponSlot1}/{charm.equivalentSlots.weaponSlot2}/{charm.equivalentSlots.weaponSlot3}</div>
                                            <div>防: {charm.equivalentSlots.armorSlot1}/{charm.equivalentSlots.armorSlot2}/{charm.equivalentSlots.armorSlot3}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                        {new Date(charm.createdAt).toLocaleDateString('zh-CN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 sm:gap-2 justify-end">
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(charm)}
                                                    className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(charm.id)}
                                                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 统计信息 */}
            <div className="text-sm text-muted-foreground font-medium">
                显示 {displayedCharms.length} / {charms.length} 个护石
            </div>
        </div>
    );
}