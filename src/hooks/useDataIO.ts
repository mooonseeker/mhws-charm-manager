/**
 * MHWS护石管理器 - 通用数据IO Hook
 *
 * 该Hook旨在为所有类型的数据（技能、装饰品、护石等）提供一个统一的、
 * 集中化管理的接口，从而简化数据操作、导入、导出和验证等功能。
 */
import { useAccessories, useCharms, useSkills } from '@/contexts';

import type { Accessory, Charm, Skill } from '@/types';

/**
 * 支持的数据库ID类型
 *
 * - `skills`: 技能
 * - `accessories`: 装饰品
 * - `charms`: 护石
 * - `armor`: 防具 (未来扩展)
 * - `weapons`: 武器 (未来扩展)
 */
export type DataId = 'skills' | 'accessories' | 'charms' | 'armor' | 'weapons';

/**
 * 各种数据类型的联合类型
 */
export type DataItem = Skill | Accessory | Charm;

/**
 * 通用数据IO Hook
 *
 * @returns 返回一组用于管理不同数据库的函数和状态
 */
export function useDataIO() {
    const { skills, resetSkills, importSkills } = useSkills();
    const { accessories, resetAccessories, importAccessories } = useAccessories();
    const { charms, resetCharms, importCharms } = useCharms();

    /**
     * 根据数据ID获取对应的数据列表
     * @param id - 数据ID
     * @returns 对应的数据数组
     */
    const getData = (id: DataId): DataItem[] => {
        switch (id) {
            case 'skills':
                return skills;
            case 'accessories':
                return accessories;
            case 'charms':
                return charms;
            default:
                return [];
        }
    };

    /**
     * 根据数据ID重置对应的数据
     * @param id -数据ID
     */
    const resetData = (id: DataId) => {
        switch (id) {
            case 'skills':
                resetSkills();
                break;
            case 'accessories':
                resetAccessories();
                break;
            case 'charms':
                resetCharms();
                break;
            default:
                console.warn(`Unsupported data ID for reset: ${id}`);
        }
    };

    /**
     * 根据数据ID导入对应的数据
     * @param id - 数据ID
     * @param data - 要导入的数据数组
     */
    const importData = (id: DataId, data: DataItem[]) => {
        switch (id) {
            case 'skills':
                importSkills(data as Skill[]);
                break;
            case 'accessories':
                importAccessories(data as Accessory[]);
                break;
            case 'charms':
                importCharms(data as Charm[]);
                break;
            default:
                console.warn(`Unsupported data ID for import: ${id}`);
        }
    };

    /**
     * 根据数据ID动态加载并返回初始数据库内容
     * @param id - 数据ID
     * @returns 初始数据
     * @throws 如果找不到或加载失败，则抛出错误
     */
    const getInitialData = async (id: DataId): Promise<{
        skills?: Skill[];
        accessories?: Accessory[];
        charms?: Charm[];
    }> => {
        try {
            // 注意：Vite的动态导入需要相对明确的路径
            const module = await import(`../data/initial-${id}.json`);
            return module.default;
        } catch (error) {
            console.error(`Failed to load initial data for ${id}:`, error);
            throw new Error(`无法加载初始数据: ${id}`);
        }
    };

    return {
        getData,
        resetData,
        importData,
        getInitialData,
    };
}