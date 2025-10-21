/**
 * MHWS护石管理器 - LocalStorage数据持久化工具
 * 
 * 提供技能和护石数据的本地存储功能
 */

import type { Skill, Charm } from '@/types';

/**
 * 存储键名常量
 */
const STORAGE_KEYS = {
    SKILLS: 'mhws-charm-manager-skills',
    CHARMS: 'mhws-charm-manager-charms',
    VERSION: 'mhws-charm-manager-version',
} as const;

/**
 * 当前数据版本号
 */
export const CURRENT_VERSION = '1.03.0';

/**
 * 保存技能列表到LocalStorage
 * 
 * @param skills - 要保存的技能列表
 * @throws {Error} 当存储失败时抛出错误
 * 
 * @example
 * ```typescript
 * try {
 *   saveSkills(skillList);
 *   console.log('技能数据已保存');
 * } catch (error) {
 *   console.error('保存失败:', error);
 * }
 * ```
 */
export function saveSkills(skills: Skill[]): void {
    try {
        localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
        localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    } catch (error) {
        console.error('Failed to save skills:', error);
        throw new Error('保存技能数据失败');
    }
}

/**
 * 从LocalStorage加载技能列表
 * 
 * @returns 技能列表，如果没有存储数据则返回null
 * 
 * @example
 * ```typescript
 * const skills = loadSkills();
 * if (skills) {
 *   console.log('加载了', skills.length, '个技能');
 * } else {
 *   console.log('没有存储的技能数据');
 * }
 * ```
 */
export function loadSkills(): Skill[] | null {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SKILLS);
        if (!data) return null;
        return JSON.parse(data) as Skill[];
    } catch (error) {
        console.error('Failed to load skills:', error);
        return null;
    }
}

/**
 * 保存护石列表到LocalStorage
 * 
 * @param charms - 要保存的护石列表
 * @throws {Error} 当存储失败时抛出错误
 * 
 * @example
 * ```typescript
 * try {
 *   saveCharms(charmList);
 *   console.log('护石数据已保存');
 * } catch (error) {
 *   console.error('保存失败:', error);
 * }
 * ```
 */
export function saveCharms(charms: Charm[]): void {
    try {
        localStorage.setItem(STORAGE_KEYS.CHARMS, JSON.stringify(charms));
        localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    } catch (error) {
        console.error('Failed to save charms:', error);
        throw new Error('保存护石数据失败');
    }
}

/**
 * 从LocalStorage加载护石列表
 * 
 * @returns 护石列表，如果没有存储数据则返回null
 * 
 * @example
 * ```typescript
 * const charms = loadCharms();
 * if (charms) {
 *   console.log('加载了', charms.length, '个护石');
 * } else {
 *   console.log('没有存储的护石数据');
 * }
 * ```
 */
export function loadCharms(): Charm[] | null {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CHARMS);
        if (!data) return null;
        return JSON.parse(data) as Charm[];
    } catch (error) {
        console.error('Failed to load charms:', error);
        return null;
    }
}

/**
 * 清除所有存储数据
 * 
 * 删除技能、护石和版本信息的所有本地存储数据
 * 
 * @example
 * ```typescript
 * if (confirm('确定要清除所有数据吗？')) {
 *   clearStorage();
 *   console.log('所有数据已清除');
 * }
 * ```
 */
export function clearStorage(): void {
    localStorage.removeItem(STORAGE_KEYS.SKILLS);
    localStorage.removeItem(STORAGE_KEYS.CHARMS);
    localStorage.removeItem(STORAGE_KEYS.VERSION);
}

/**
 * 获取存储的数据版本号
 * 
 * @returns 版本号字符串，如果没有存储版本信息则返回null
 * 
 * @example
 * ```typescript
 * const version = getStorageVersion();
 * console.log('当前存储版本:', version || '无');
 * ```
 */
export function getStorageVersion(): string | null {
    return localStorage.getItem(STORAGE_KEYS.VERSION);
}

/**
 * 检查是否存在本地存储数据
 * 
 * @returns 如果存在技能或护石数据则返回true，否则返回false
 * 
 * @example
 * ```typescript
 * if (hasStoredData()) {
 *   console.log('检测到本地存储数据');
 *   // 可以询问用户是否要加载
 * }
 * ```
 */
export function hasStoredData(): boolean {
    return (
        localStorage.getItem(STORAGE_KEYS.SKILLS) !== null ||
        localStorage.getItem(STORAGE_KEYS.CHARMS) !== null
    );
}