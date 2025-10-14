/**
 * MHWS护石管理器 - 护石验证工具
 * 
 * 提供护石验证和比较功能，判断新护石是否值得添加
 */

import type { Charm, SkillWithLevel, Slot, CharmValidationResult, Skill } from '@/types';
import { KEY_SKILL_VALUE_THRESHOLD } from '@/types/constants';

import { calculateCharmEquivalentSlots, calculateKeySkillValue } from './charm-calculator';

/**
 * 比较两个护石的技能
 * 
 * 检查newSkills的技能是否完全被existingSkills包含且等级更低或相等
 * 
 * 规则：
 * - newSkills中的每个技能都必须在existingSkills中存在
 * - 且对应技能的等级必须小于或等于existingSkills中的等级
 * 
 * @param newSkills - 新护石的技能列表
 * @param existingSkills - 现有护石的技能列表
 * @returns true表示新护石的技能落后于现有护石
 * 
 * @example
 * const newSkills = [{ skillId: 'skill1', level: 2 }];
 * const existingSkills = [{ skillId: 'skill1', level: 3 }];
 * areSkillsInferior(newSkills, existingSkills) // 返回 true
 * 
 * @example
 * const newSkills = [{ skillId: 'skill1', level: 2 }];
 * const existingSkills = [{ skillId: 'skill2', level: 3 }];
 * areSkillsInferior(newSkills, existingSkills) // 返回 false (不同技能)
 */
function areSkillsInferior(
    newSkills: SkillWithLevel[],
    existingSkills: SkillWithLevel[]
): boolean {
    // 如果新护石没有技能，则认为落后
    if (newSkills.length === 0) {
        return true;
    }

    // 如果现有护石没有技能，则新护石不落后
    if (existingSkills.length === 0) {
        return false;
    }

    // 检查新护石的每个技能
    for (const newSkill of newSkills) {
        // 在现有护石中查找相同的技能
        const existingSkill = existingSkills.find(
            s => s.skillId === newSkill.skillId
        );

        // 如果新护石有现有护石没有的技能，则不落后
        if (!existingSkill) {
            return false;
        }

        // 如果新护石的技能等级高于现有护石，则不落后
        if (newSkill.level > existingSkill.level) {
            return false;
        }
    }

    // 所有技能都被包含且等级更低或相等，则落后
    return true;
}

/**
 * 比较两个护石的孔位
 * 
 * 检查newSlots的孔位是否更少或等级更低
 * 
 * 规则：
 * - 按类型和等级统计孔位数量
 * - 新护石的每个类型等级的孔位数都必须小于或等于现有护石
 * 
 * @param newSlots - 新护石的孔位列表
 * @param existingSlots - 现有护石的孔位列表
 * @returns true表示新护石的孔位更少或等级更低
 * 
 * @example
 * const newSlots = [{ type: 'weapon', level: 1 }];
 * const existingSlots = [{ type: 'weapon', level: 2 }];
 * areSlotsInferiorOrEqual(newSlots, existingSlots) // 返回 true
 */
function areSlotsInferiorOrEqual(
    newSlots: Slot[],
    existingSlots: Slot[]
): boolean {
    // 统计新护石的孔位
    const newSlotCounts = {
        weapon1: 0,
        weapon2: 0,
        weapon3: 0,
        armor1: 0,
        armor2: 0,
        armor3: 0,
    };

    for (const slot of newSlots) {
        const key = `${slot.type}${slot.level}` as keyof typeof newSlotCounts;
        newSlotCounts[key]++;
    }

    // 统计现有护石的孔位
    const existingSlotCounts = {
        weapon1: 0,
        weapon2: 0,
        weapon3: 0,
        armor1: 0,
        armor2: 0,
        armor3: 0,
    };

    for (const slot of existingSlots) {
        const key = `${slot.type}${slot.level}` as keyof typeof existingSlotCounts;
        existingSlotCounts[key]++;
    }

    // 检查每个类型等级的孔位数是否都小于或等于现有护石
    for (const key in newSlotCounts) {
        const slotKey = key as keyof typeof newSlotCounts;
        if (newSlotCounts[slotKey] > existingSlotCounts[slotKey]) {
            // 新护石在某个类型等级上的孔位更多，则不落后
            return false;
        }
    }

    return true;
}

/**
 * 验证护石是否应该添加
 * 
 * 根据 origin.md 第43-47行的规则进行验证：
 * 1. 检查是否落后于现有护石（技能和孔位都不如现有护石）
 * 2. 检查核心技能价值是否低于平均值2个及以上
 * 
 * @param newCharm - 新护石（不包含id、createdAt、equivalentSlots、keySkillValue）
 * @param existingCharms - 现有护石列表
 * @param skillsData - 完整的技能数据（用于计算等效孔位）
 * @returns 验证结果，包含是否通过验证、警告信息等
 * 
 * @example
 * const newCharm = {
 *   rarity: 10,
 *   skills: [{ skillId: 'skill1', level: 2 }],
 *   slots: [{ type: 'weapon', level: 1 }]
 * };
 * const result = validateCharm(newCharm, existingCharms, skillsData);
 * if (!result.isValid) {
 *   console.log(result.warnings); // 显示警告信息
 * }
 */
export function validateCharm(
    newCharm: Omit<Charm, 'id' | 'createdAt' | 'equivalentSlots' | 'keySkillValue'>,
    existingCharms: Charm[],
    skillsData: Skill[]
): CharmValidationResult {
    const warnings: string[] = [];
    let isInferior = false;
    let isBelowAverage = false;

    // 1. 检查是否落后于现有护石
    for (const existing of existingCharms) {
        // 检查技能是否落后
        const skillsInferior = areSkillsInferior(newCharm.skills, existing.skills);

        // 检查孔位是否更少或等级更低
        const slotsInferiorOrEqual = areSlotsInferiorOrEqual(newCharm.slots, existing.slots);

        // 如果技能和孔位都落后，则判定为不建议添加
        if (skillsInferior && slotsInferiorOrEqual) {
            isInferior = true;
            warnings.push(
                `该护石的技能和孔位均不如已有护石（稀有度${existing.rarity}）`
            );
            break; // 找到一个就足够了，不需要继续检查
        }
    }

    // 2. 计算新护石的核心技能价值
    const newEquivalentSlots = calculateCharmEquivalentSlots(
        newCharm.skills,
        newCharm.slots,
        skillsData
    );
    const newKeySkillValue = calculateKeySkillValue(newEquivalentSlots);

    // 3. 比较与平均值的差距
    if (existingCharms.length > 0) {
        // 计算现有护石的平均核心技能价值
        const totalKeySkillValue = existingCharms.reduce(
            (sum, charm) => sum + charm.keySkillValue,
            0
        );
        const avgKeySkillValue = totalKeySkillValue / existingCharms.length;

        // 如果新护石比平均值小2个及以上
        if (newKeySkillValue < avgKeySkillValue - KEY_SKILL_VALUE_THRESHOLD) {
            isBelowAverage = true;
            warnings.push(
                `该护石的核心技能价值(${newKeySkillValue})明显低于平均值(${avgKeySkillValue.toFixed(1)})`
            );
        }
    }

    // 返回验证结果
    // isValid: 如果落后则不建议添加（false），否则可以添加（true）
    return {
        isValid: !isInferior,
        warnings,
        isInferior,
        isBelowAverage,
    };
}

/**
 * 检查技能是否完全相同
 * 
 * 辅助函数，用于判断两个护石的技能列表是否完全相同（包括等级）
 * 
 * @param skills1 - 第一个技能列表
 * @param skills2 - 第二个技能列表
 * @returns true表示技能完全相同
 */
export function areSkillsIdentical(
    skills1: SkillWithLevel[],
    skills2: SkillWithLevel[]
): boolean {
    if (skills1.length !== skills2.length) {
        return false;
    }

    // 对每个技能进行比较
    for (const skill1 of skills1) {
        const skill2 = skills2.find(s => s.skillId === skill1.skillId);
        if (!skill2 || skill2.level !== skill1.level) {
            return false;
        }
    }

    return true;
}

/**
 * 检查孔位是否完全相同
 * 
 * 辅助函数，用于判断两个护石的孔位列表是否完全相同
 * 
 * @param slots1 - 第一个孔位列表
 * @param slots2 - 第二个孔位列表
 * @returns true表示孔位完全相同
 */
export function areSlotsIdentical(
    slots1: Slot[],
    slots2: Slot[]
): boolean {
    if (slots1.length !== slots2.length) {
        return false;
    }

    // 统计孔位
    const counts1 = { weapon1: 0, weapon2: 0, weapon3: 0, armor1: 0, armor2: 0, armor3: 0 };
    const counts2 = { weapon1: 0, weapon2: 0, weapon3: 0, armor1: 0, armor2: 0, armor3: 0 };

    for (const slot of slots1) {
        const key = `${slot.type}${slot.level}` as keyof typeof counts1;
        counts1[key]++;
    }

    for (const slot of slots2) {
        const key = `${slot.type}${slot.level}` as keyof typeof counts2;
        counts2[key]++;
    }

    // 比较每个类型等级的数量
    for (const key in counts1) {
        if (counts1[key as keyof typeof counts1] !== counts2[key as keyof typeof counts2]) {
            return false;
        }
    }

    return true;
}