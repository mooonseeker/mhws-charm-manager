/**
 * MHWS护石管理器 - 装饰品Context
 *
 * 使用Context API + useReducer管理装饰品的全局状态
 */

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useReducer } from 'react';

import type { Accessory } from '@/types';

/**
 * 装饰品状态类型
 */
interface AccessoryState {
    /** 装饰品列表 */
    accessories: Accessory[];
    /** 加载状态 */
    loading: boolean;
    /** 错误信息 */
    error: string | null;
}

/**
 * 装饰品Action类型
 */
type AccessoryAction =
    | { type: 'SET_ACCESSORIES'; payload: Accessory[] }
    | { type: 'ADD_ACCESSORY'; payload: Accessory }
    | { type: 'UPDATE_ACCESSORY'; payload: Accessory }
    | { type: 'DELETE_ACCESSORY'; payload: string }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

/**
 * 装饰品Context类型
 */
interface AccessoryContextType extends AccessoryState {
    /** 添加装饰品 */
    addAccessory: (accessory: Accessory) => void;
    /** 更新装饰品 */
    updateAccessory: (accessory: Accessory) => void;
    /** 删除装饰品 */
    deleteAccessory: (id: string) => void;
    /** 根据ID获取装饰品 */
    getAccessoryById: (id: string) => Accessory | undefined;
}

/**
 * 装饰品Reducer
 *
 * 处理所有装饰品相关的状态变更
 */
function accessoryReducer(state: AccessoryState, action: AccessoryAction): AccessoryState {
    switch (action.type) {
        case 'SET_ACCESSORIES':
            return { ...state, accessories: action.payload, loading: false };
        case 'ADD_ACCESSORY':
            return { ...state, accessories: [...state.accessories, action.payload] };
        case 'UPDATE_ACCESSORY':
            return {
                ...state,
                accessories: state.accessories.map(a => a.id === action.payload.id ? action.payload : a),
            };
        case 'DELETE_ACCESSORY':
            return {
                ...state,
                accessories: state.accessories.filter(a => a.id !== action.payload),
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}

/**
 * 装饰品Context
 */
const AccessoryContext = createContext<AccessoryContextType | undefined>(undefined);

/**
 * 装饰品Provider组件
 *
 * 提供装饰品全局状态管理，包括：
 * - 从CSV文件加载初始数据
 * - 管理装饰品的状态
 * - 提供增删改查操作
 *
 * @param children - 子组件
 */
export function AccessoryProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(accessoryReducer, {
        accessories: [],
        loading: true,
        error: null,
    });

    // 初始化：从CSV加载
    useEffect(() => {
        try {
            // 从CSV加载装饰品数据
            import('@/data/accessories.csv?raw').then((module) => {
                const csvText = module.default;
                const accessories = parseAccessoriesCSV(csvText);
                dispatch({ type: 'SET_ACCESSORIES', payload: accessories });
            }).catch((error) => {
                console.error('加载装饰品数据失败:', error);
                dispatch({ type: 'SET_ERROR', payload: '加载装饰品数据失败' });
                dispatch({ type: 'SET_ACCESSORIES', payload: [] });
            });
        } catch (error) {
            console.error('加载装饰品数据失败:', error);
            dispatch({ type: 'SET_ERROR', payload: '加载装饰品数据失败' });
            dispatch({ type: 'SET_ACCESSORIES', payload: [] });
        }
    }, []);

    /**
     * 解析CSV数据为Accessory数组
     */
    function parseAccessoriesCSV(csvText: string): Accessory[] {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));

        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, ''));
            const obj: Record<string, string> = {};

            headers.forEach((header, index) => {
                obj[header] = values[index];
            });

            // 解析skills字段（格式如：[HunterSkill_000,1,NONE,0]）
            const skillsStr = obj.skills;
            let skills: { skillId: string; level: number }[] = [];
            if (skillsStr && skillsStr !== '[]') {
                const skillMatches = skillsStr.match(/\[([^\]]+)\]/);
                if (skillMatches) {
                    const skillParts = skillMatches[1].split(',');
                    skills = [{
                        skillId: skillParts[0],
                        level: parseInt(skillParts[1])
                    }];

                    // 检查是否有第二个技能
                    if (skillParts.length > 2 && skillParts[2] !== 'NONE') {
                        skills.push({
                            skillId: skillParts[2],
                            level: parseInt(skillParts[3])
                        });
                    }
                }
            }

            return {
                id: obj.id,
                name: obj.name,
                type: obj.type,
                description: obj.description,
                sortID: parseInt(obj.sortID),
                skills,
                rarity: parseInt(obj.rarity),
                slotLevel: parseInt(obj.slotLevel),
                color: obj.color
            } as Accessory;
        });
    }

    /**
     * 添加装饰品
     *
     * @param accessory - 装饰品数据
     */
    const addAccessory = (accessory: Accessory) => {
        // 检查ID是否重复
        if (state.accessories.some(a => a.id === accessory.id)) {
            throw new Error(`装饰品ID "${accessory.id}" 已存在。`);
        }
        dispatch({ type: 'ADD_ACCESSORY', payload: accessory });
    };

    /**
     * 更新装饰品
     *
     * @param accessory - 完整的装饰品数据
     */
    const updateAccessory = (accessory: Accessory) => {
        dispatch({ type: 'UPDATE_ACCESSORY', payload: accessory });
    };

    /**
     * 删除装饰品
     *
     * @param id - 装饰品ID
     */
    const deleteAccessory = (id: string) => {
        dispatch({ type: 'DELETE_ACCESSORY', payload: id });
    };

    /**
     * 根据ID获取装饰品
     *
     * @param id - 装饰品ID
     * @returns 装饰品对象，如果不存在则返回undefined
     */
    const getAccessoryById = (id: string) => {
        return state.accessories.find(a => a.id === id);
    };

    const value: AccessoryContextType = {
        ...state,
        addAccessory,
        updateAccessory,
        deleteAccessory,
        getAccessoryById,
    };

    return <AccessoryContext.Provider value={value}>{children}</AccessoryContext.Provider>;
}

/**
 * 使用装饰品Context的Hook
 *
 * @returns 装饰品Context
 * @throws {Error} 如果在AccessoryProvider外部使用
 *
 * @example
 * ```tsx
 * function AccessoryList() {
 *   const { accessories, loading, addAccessory } = useAccessories();
 *
 *   if (loading) return <div>加载中...</div>;
 *
 *   return (
 *     <div>
 *       {accessories.map(accessory => <div key={accessory.id}>{accessory.name}</div>)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAccessories() {
    const context = useContext(AccessoryContext);
    if (!context) {
        throw new Error('useAccessories must be used within AccessoryProvider');
    }
    return context;
}