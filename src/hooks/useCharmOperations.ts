/**
 * MHWS护石管理器 - 护石操作Hook
 * 
 * 封装护石的创建、验证等复杂操作
 */

import { useCallback } from 'react';
import { useCharms } from '@/contexts';
import { useSkills } from '@/contexts';
import type { SkillWithLevel, Slot, Charm } from '@/types';
import {
    calculateCharmEquivalentSlots,
    calculateKeySkillValue,
    validateCharm,
    generateId,
} from '@/utils';

/**
 * 护石操作Hook
 * 
 * 提供护石创建和验证的便捷方法，自动处理：
 * - 等效孔位计算
 * - 核心技能价值计算
 * - ID生成
 * - 护石验证
 * 
 * @returns 护石操作方法集合
 * 
 * @example
 * ```tsx
 * function CharmForm() {
 *   const { createCharm, validateNewCharm } = useCharmOperations();
 *   
 *   const handleSubmit = (data) => {
 *     // 先验证
 *     const validation = validateNewCharm(data);
 *     if (!validation.isValid) {
 *       alert(validation.warnings.join('\n'));
 *       return;
 *     }
 *     
 *     // 创建护石
 *     const newCharm = createCharm(data);
 *     console.log('护石已创建:', newCharm);
 *   };
 * }
 * ```
 */
export function useCharmOperations() {
    const { charms, addCharm } = useCharms();
    const { skills } = useSkills();

    /**
     * 创建并添加护石
     * 
     * 自动计算等效孔位和核心技能价值，生成ID和时间戳
     * 
     * @param data - 护石基础数据（稀有度、技能、孔位）
     * @returns 创建的完整护石对象
     * 
     * @example
     * ```tsx
     * const charm = createCharm({
     *   rarity: 10,
     *   skills: [{ skillId: 'skill-001', level: 2 }],
     *   slots: [{ type: 'weapon', level: 1 }]
     * });
     * ```
     */
    const createCharm = useCallback(
        (data: {
            rarity: number;
            skills: SkillWithLevel[];
            slots: Slot[];
        }): Charm => {
            // 计算等效孔位
            const equivalentSlots = calculateCharmEquivalentSlots(
                data.skills,
                data.slots,
                skills
            );

            // 计算核心技能价值
            const keySkillValue = calculateKeySkillValue(equivalentSlots);

            // 创建护石对象
            const newCharm: Charm = {
                id: generateId('charm'),
                rarity: data.rarity,
                skills: data.skills,
                slots: data.slots,
                equivalentSlots,
                keySkillValue,
                createdAt: new Date().toISOString(),
            };

            // 添加到状态
            addCharm(newCharm);

            return newCharm;
        },
        [skills, addCharm]
    );

    /**
     * 验证护石
     * 
     * 检查护石是否应该添加，包括：
     * - 是否落后于现有护石
     * - 核心技能价值是否低于平均值
     * 
     * @param data - 护石基础数据（稀有度、技能、孔位）
     * @returns 验证结果，包含是否通过、警告信息等
     * 
     * @example
     * ```tsx
     * const result = validateNewCharm({
     *   rarity: 8,
     *   skills: [{ skillId: 'skill-001', level: 1 }],
     *   slots: []
     * });
     * 
     * if (!result.isValid) {
     *   console.warn('护石验证失败:', result.warnings);
     * }
     * 
     * if (result.isBelowAverage) {
     *   console.warn('核心技能价值低于平均值');
     * }
     * ```
     */
    const validateNewCharm = useCallback(
        (data: {
            rarity: number;
            skills: SkillWithLevel[];
            slots: Slot[];
        }) => {
            return validateCharm(data, charms, skills);
        },
        [charms, skills]
    );

    return {
        createCharm,
        validateNewCharm,
    };
}