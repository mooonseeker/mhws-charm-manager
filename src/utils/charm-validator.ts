/**
 * MHWS护石管理器 - 护石验证工具
 * 
 * 提供护石验证和比较功能，判断新护石是否值得添加
 */

import type { Charm, SkillWithLevel, Slot, CharmValidationResult, Skill, EquivalentSlots } from '@/types';
import { KEY_SKILL_VALUE_THRESHOLD } from '@/types/constants';

type SlotComparisonResult = 'superior' | 'inferior' | 'equal' | 'incomparable';

/**
 * 比较两组等效孔位
 * 
 * @param newSlots - 新护石的等效孔位
 * @param existingSlots - 现有护石的等效孔位
 * @returns 'superior', 'inferior', 'equal', 或 'incomparable'
 */
function compareEquivalentSlots(
    newSlots: EquivalentSlots,
    existingSlots: EquivalentSlots
): SlotComparisonResult {
    let isSuperior = false;
    let isInferior = false;

    const keys = Object.keys(newSlots) as (keyof EquivalentSlots)[];

    for (const key of keys) {
        if (newSlots[key] > existingSlots[key]) {
            isSuperior = true;
        } else if (newSlots[key] < existingSlots[key]) {
            isInferior = true;
        }
    }

    if (isSuperior && !isInferior) {
        return 'superior';
    }
    if (isInferior && !isSuperior) {
        return 'inferior';
    }
    if (!isSuperior && !isInferior) {
        return 'equal';
    }
    return 'incomparable';
}

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
/**
 * 验证护石是否应该添加（重构版）
 *
 * @param newCharm - 新护石（需包含计算好的`equivalentSlots`和`keySkillValue`）
 * @param existingCharms - 现有护石列表
 * @param skillsData - 完整的技能数据
 * @returns 详细的验证结果
 */
export function validateCharm(
    newCharm: Omit<Charm, 'id' | 'createdAt'>,
    existingCharms: Charm[],
    skillsData: Skill[]
): CharmValidationResult {
    // Phase 0: 快速通道，如果没有现有护石则直接接受
    if (existingCharms.length === 0) {
        return { isValid: true, status: 'ACCEPTED_AS_FIRST' };
    }

    // Phase 1: 准备阶段 & 快速通道检查
    const stats = existingCharms.reduce(
        (acc, charm) => {
            acc.maxKeySkillValue = Math.max(acc.maxKeySkillValue, charm.keySkillValue);
            acc.totalKeySkillValue += charm.keySkillValue;

            acc.maxEqSlots.weaponSlot1 = Math.max(acc.maxEqSlots.weaponSlot1, charm.equivalentSlots.weaponSlot1);
            acc.maxEqSlots.weaponSlot2 = Math.max(acc.maxEqSlots.weaponSlot2, charm.equivalentSlots.weaponSlot2);
            acc.maxEqSlots.weaponSlot3 = Math.max(acc.maxEqSlots.weaponSlot3, charm.equivalentSlots.weaponSlot3);
            acc.maxEqSlots.armorSlot1 = Math.max(acc.maxEqSlots.armorSlot1, charm.equivalentSlots.armorSlot1);
            acc.maxEqSlots.armorSlot2 = Math.max(acc.maxEqSlots.armorSlot2, charm.equivalentSlots.armorSlot2);
            acc.maxEqSlots.armorSlot3 = Math.max(acc.maxEqSlots.armorSlot3, charm.equivalentSlots.armorSlot3);

            return acc;
        },
        {
            maxKeySkillValue: 0,
            totalKeySkillValue: 0,
            maxEqSlots: { weaponSlot1: 0, weaponSlot2: 0, weaponSlot3: 0, armorSlot1: 0, armorSlot2: 0, armorSlot3: 0 },
        }
    );
    const avgKeySkillValue = stats.totalKeySkillValue / existingCharms.length;

    // 1.1: 快速通道 - 核心价值
    if (newCharm.keySkillValue > stats.maxKeySkillValue) {
        return { isValid: true, status: 'ACCEPTED_BY_MAX_VALUE' };
    }
    // 1.2: 快速通道 - 等效孔位
    const newEqSlots = newCharm.equivalentSlots;
    if (
        newEqSlots.weaponSlot1 > stats.maxEqSlots.weaponSlot1 ||
        newEqSlots.weaponSlot2 > stats.maxEqSlots.weaponSlot2 ||
        newEqSlots.weaponSlot3 > stats.maxEqSlots.weaponSlot3 ||
        newEqSlots.armorSlot1 > stats.maxEqSlots.armorSlot1 ||
        newEqSlots.armorSlot2 > stats.maxEqSlots.armorSlot2 ||
        newEqSlots.armorSlot3 > stats.maxEqSlots.armorSlot3
    ) {
        return { isValid: true, status: 'ACCEPTED_BY_MAX_SLOTS' };
    }

    // Phase 2: 精确对比检查 (Skill-Centric Comparison)
    // 2.1: 确定锚点技能
    const newCharmSkillsWithData = newCharm.skills.map(s => ({
        ...s,
        skillData: skillsData.find(sd => sd.id === s.skillId),
    }));
    const coreSkills = newCharmSkillsWithData.filter(s => s.skillData?.isKey);
    let anchorSkills: typeof newCharmSkillsWithData = [];

    if (coreSkills.length > 0) {
        anchorSkills = coreSkills;
    } else if (newCharmSkillsWithData.length > 0) {
        const maxLevel = Math.max(...newCharmSkillsWithData.map(s => s.level));
        anchorSkills = newCharmSkillsWithData.filter(s => s.level === maxLevel);
    }

    // 处理无技能护石的特殊情况
    if (anchorSkills.length === 0) {
        const existingNoSkillCharms = existingCharms.filter(c => c.skills.length === 0);
        for (const existing of existingNoSkillCharms) {
            const slotComparison = compareEquivalentSlots(newCharm.equivalentSlots, existing.equivalentSlots);
            // 如果比任何一个现有的无技能护石要差或相等，则拒绝
            if (slotComparison === 'inferior' || slotComparison === 'equal') {
                return { isValid: false, status: 'REJECTED_AS_INFERIOR', betterCharm: existing };
            }
        }
        return { isValid: true, status: 'ACCEPTED' };
    }

    const outclassedCharms: Charm[] = [];

    // 2.2: 遍历锚点技能
    for (const anchorSkill of anchorSkills) {
        const relevantCharms = existingCharms.filter(c =>
            c.skills.some(s => s.skillId === anchorSkill.skillId)
        );

        if (relevantCharms.length === 0) {
            return { isValid: true, status: 'ACCEPTED_AS_UNIQUE_SKILL' };
        }

        for (const relevantCharm of relevantCharms) {
            const existingSkill = relevantCharm.skills.find(s => s.skillId === anchorSkill.skillId)!;
            const slotComparison = compareEquivalentSlots(newCharm.equivalentSlots, relevantCharm.equivalentSlots);

            const skillLevelSuperior = anchorSkill.level > existingSkill.level;
            const skillLevelInferior = anchorSkill.level < existingSkill.level;
            const skillLevelEqual = anchorSkill.level === existingSkill.level;

            const slotsSuperior = slotComparison === 'superior';
            const slotsInferior = slotComparison === 'inferior';
            const slotsEqual = slotComparison === 'equal';

            // 检查"绝对劣势"
            if ((skillLevelInferior || skillLevelEqual) && (slotsInferior || slotsEqual)) {
                if (skillLevelInferior || slotsInferior) { // 至少一项严格更差
                    return { isValid: false, status: 'REJECTED_AS_INFERIOR', betterCharm: relevantCharm };
                }
            }

            // 检查"绝对优势"
            if ((skillLevelSuperior || skillLevelEqual) && (slotsSuperior || slotsEqual)) {
                if (skillLevelSuperior || slotsSuperior) { // 至少一项严格更优
                    if (!outclassedCharms.find(c => c.id === relevantCharm.id)) {
                        outclassedCharms.push(relevantCharm);
                    }
                }
            }
        }
    }

    // Phase 3: 最终裁定和警告
    const warnings: string[] = [];
    if (newCharm.keySkillValue < avgKeySkillValue - KEY_SKILL_VALUE_THRESHOLD) {
        warnings.push(`该护石的核心技能价值(${newCharm.keySkillValue.toFixed(1)})明显低于平均值(${avgKeySkillValue.toFixed(1)})`);
    }

    return {
        isValid: true,
        status: 'ACCEPTED',
        warnings: warnings.length > 0 ? warnings : undefined,
        outclassedCharms: outclassedCharms.length > 0 ? outclassedCharms : undefined,
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