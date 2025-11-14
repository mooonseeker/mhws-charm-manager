import type {
    ArmorType,
    CategorizedSkills,
    PreprocessedData,
    SkillWithLevel,
} from '@/types';

/**
 * v7.1 核心剪枝函数
 *
 * 基于预计算的各部位最大技能潜力，判断在当前已选装备和剩余可选部位的条件下，
 * 是否还有可能满足所有技能需求。
 *
 * @param currentSkills - 当前装备组合（不含珠子）提供的技能等级 Map
 * @param remainingArmorTypes - 剩余待选的防具部位列表
 * @param skillDeficits - 尚未被满足的技能需求
 * @param preprocessedData - 包含 `maxPotentialPerArmorType` 的预处理数据
 * @returns {boolean} - 如果确定无法满足需求，应进行剪枝，则返回 true
 */
export function shouldPrune(
    currentSkills: Map<string, number>,
    remainingArmorTypes: ArmorType[],
    skillDeficits: CategorizedSkills,
    preprocessedData: PreprocessedData,
): boolean {
    const skillsToEvaluate: SkillWithLevel[] = [
        ...skillDeficits.noAccessorySkills,
        ...skillDeficits.armorSkills,
    ];

    for (const targetSkill of skillsToEvaluate) {
        const { skillId, level: requiredLevel } = targetSkill;
        const currentLevel = currentSkills.get(skillId) || 0;

        // 如果当前技能等级已满足需求，则跳过此技能的潜力计算
        if (currentLevel >= requiredLevel) {
            continue;
        }

        let remainingPotential = 0;
        for (const armorType of remainingArmorTypes) {
            const potentialOnType = preprocessedData.maxPotentialPerArmorType.get(armorType);
            if (potentialOnType) {
                remainingPotential += potentialOnType.get(skillId) || 0;
            }
        }

        // 如果 当前等级 + 剩余所有部位的最大潜力 < 目标等级，则不可能满足，进行剪枝
        if (currentLevel + remainingPotential < requiredLevel) {
            return true; // Prune this branch
        }
    }

    return false; // Do not prune
}