import { useMemo, useState } from 'react';

import { EquipmentCard } from '@/components/equipments/EquipmentCard';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useWeapon } from '@/hooks';
import { cn } from '@/lib/utils';
import { groupWeaponsIntoRows } from '@/utils/weapon-grouper';

import type { Weapon, WeaponType } from '@/types';
import type { EquipmentCellType } from '@/types/set-builder';

export interface WeaponListProps {
    mode?: 'display' | 'selector';
    onWeaponSelect?: (weapon: Weapon) => void;
    selectingFor?: EquipmentCellType; // 新增
    currentWeapon?: Weapon | null;    // 新增
}

/**
 * WeaponList 组件
 *
 * 显示武器列表，支持按武器类型筛选和搜索，使用12列网格布局展示武器
 */
export function WeaponList({
    mode = 'display',
    onWeaponSelect,
    selectingFor,
    currentWeapon
}: WeaponListProps) {
    // 状态管理
    const [selectedWeaponType, setSelectedWeaponType] = useState<WeaponType>('rod');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // 获取武器数据
    const { weapons, loading, error } = useWeapon();

    // 数据处理：筛选、排序并分组为行
    const weaponRows = useMemo(() => {
        if (!weapons) return [];

        // 筛选：根据武器类型和搜索查询
        const filteredWeapons = weapons.filter(weapon =>
            weapon.type === selectedWeaponType &&
            (searchQuery === '' || weapon.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // 按sortId升序排序（已在groupWeaponsIntoRows中处理，但这里明确处理）
        filteredWeapons.sort((a, b) => a.sortId - b.sortId);

        // 调用groupWeaponsIntoRows分组为行
        return groupWeaponsIntoRows(filteredWeapons);
    }, [weapons, selectedWeaponType, searchQuery]);

    // 加载状态
    if (loading) {
        return <div className="flex justify-center items-center p-8">加载中...</div>;
    }

    // 错误状态
    if (error) {
        return <div className="flex justify-center items-center p-8 text-red-500">加载武器数据失败: {error.message}</div>;
    }

    // 武器类型选项（14个武器类型）
    const weaponTypes: WeaponType[] = [
        'hammer', 'lance', 'long-sword', 'short-sword', 'tachi', 'twin-sword',
        'charge-axe', 'gun-lance', 'rod', 'slash-axe', 'whistle',
        'bow', 'heavy-bowgun', 'light-bowgun'
    ];

    return (
        <div className="h-full flex flex-col gap-4">
            {/* 菜单栏 */}
            <div className="bg-card p-2 sm:p-4 rounded-lg border shadow-sm flex-shrink-0">
                <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-3">
                    {/* 武器类型切换 */}
                    <ToggleGroup
                        type="single"
                        value={selectedWeaponType}
                        onValueChange={(value) => value && setSelectedWeaponType(value as WeaponType)}
                        className="justify-start flex-wrap"
                    >
                        {weaponTypes.map((type) => (
                            <ToggleGroupItem key={type} value={type} className="text-xs">
                                <img
                                    src={`/weapon-type/${type}.png`}
                                    alt={type}
                                    className="w-6 h-6 mr-1"
                                />
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    {/* 搜索框 */}
                    <Input
                        type="text"
                        placeholder="搜索武器名称..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

            </div>

            {/* 武器表格 */}
            <div className="flex-1 min-h-0 bg-card rounded-lg border shadow-sm overflow-x-auto">
                <Table>
                    {/* 表头 */}
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: 12 }, (_, i) => (
                                <TableHead
                                    key={`header-${i}`}
                                    className={`text-center bg-primary text-primary-foreground ${i === 0 ? 'rounded-tl-lg' : i === 11 ? 'rounded-tr-lg' : ''
                                        }`}
                                >
                                    R{i + 1}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* 表体 */}
                    <TableBody>
                        {weaponRows.map((row, rowIndex) => {
                            // 创建包含12个单元格的数组
                            const cells = Array(12).fill(null);

                            // 将武器放置到对应的稀有度位置
                            row.forEach((weapon: Weapon) => {
                                cells[weapon.rarity - 1] = weapon;
                            });

                            return (
                                <TableRow key={`row-${rowIndex}`}>
                                    {cells.map((weapon, index) => {
                                        const isSelector = mode === 'selector';
                                        const isSelected = !!currentWeapon && currentWeapon?.id === weapon?.id;
                                        const isMatchingSlot = isSelector && selectingFor === 'weapon';

                                        return (
                                            <TableCell
                                                key={`cell-${rowIndex}-${index}`}
                                                className={cn(
                                                    'p-2',
                                                    isSelector && 'transition-colors rounded-lg',
                                                    isSelector && isMatchingSlot && 'cursor-pointer hover:bg-accent/50',
                                                    isSelector && !isMatchingSlot && 'cursor-not-allowed opacity-50'
                                                )}
                                                onClick={
                                                    isSelector && onWeaponSelect && isMatchingSlot && weapon
                                                        ? () => onWeaponSelect(weapon)
                                                        : undefined
                                                }
                                            >
                                                {weapon ? (
                                                    <EquipmentCard
                                                        item={weapon}
                                                        variant={mode === 'selector' ? 'compact' : 'full'}
                                                        isSelected={isSelected}
                                                    />
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}