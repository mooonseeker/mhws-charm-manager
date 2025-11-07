import { useMemo, useState } from 'react';

import { EquipmentCard } from '@/components/equipments/EquipmentCard';
import { Input } from '@/components/ui/input';
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
        <div className="weapon-list space-y-4">
            {/* 菜单栏 */}
            <div className="bg-card p-4 sm:p-6 rounded-lg border shadow-sm">
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
            <div className="weapon-grid bg-card rounded-lg border shadow-sm overflow-x-auto">
                <div
                    className="grid gap-2 p-4 min-w-max"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, minmax(120px, 1fr))',
                    }}
                >
                    {/* 表头：R1 到 R12 */}
                    {Array.from({ length: 12 }, (_, i) => (
                        <div key={`header-${i}`} className="text-center font-bold text-sm p-2">
                            R{i + 1}
                        </div>
                    ))}

                    {/* 武器卡片 */}
                    {weaponRows.map((row, rowIndex) =>
                        row.map((weapon: Weapon) => {
                            const isSelector = mode === 'selector';
                            const isSelected = !!currentWeapon && currentWeapon.id === weapon.id;
                            const isMatchingSlot = isSelector && selectingFor === 'weapon';

                            return (
                                <div
                                    key={weapon.id}
                                    style={{
                                        gridRowStart: rowIndex + 2, // +2 因为表头占用了第1行
                                        gridColumnStart: weapon.rarity,
                                    }}
                                    className={cn(
                                        'weapon-card-container',
                                        isSelector && 'transition-colors rounded-lg',
                                        isSelector && isMatchingSlot && 'cursor-pointer hover:bg-accent/50',
                                        isSelector && !isMatchingSlot && 'cursor-not-allowed opacity-50'
                                    )}
                                    onClick={
                                        isSelector && onWeaponSelect && isMatchingSlot
                                            ? () => onWeaponSelect(weapon)
                                            : undefined
                                    }
                                >
                                    <EquipmentCard
                                        item={weapon}
                                        variant={mode === 'selector' ? 'compact' : 'full'}
                                        isSelected={isSelected}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}