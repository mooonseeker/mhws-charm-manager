import type {
    ArmorType,
    CategorizedSkills,
    EquipmentSet,
    PreprocessedData,
    SkillWithLevel,
} from '@/types';

/**
 * v7.2 核心潜力剪枝函数
 *
 * 基于预计算的各部位最大技能潜力，判断在当前已选装备和剩余待选部位的条件下，
 * 是否还有可能满足 `noAccessorySkills` 和 `armorSkills` 技能需求。
 *
 * @param currentSkills - 当前装备组合（含骨架自带，不含珠子）提供的技能等级 Map
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

/**
 * v7.2-Final Corrected: 验证最终组合是否满足套装(Series)和组合(Group)技能需求
 * 统一逻辑：两类技能都通过累加各部件上的技能等级来满足。
 *
 * @param equipment - 包含5件防具的最终装备组合
 * @param skillDeficits - 需要满足的技能需求
 * @returns {boolean} - 如果满足所有 series/group 技能需求，返回 true
 */
export function validateBaseSkills(
    equipment: EquipmentSet,
    skillDeficits: CategorizedSkills,
): boolean {
    const ARMOR_TYPES: ArmorType[] = ['helm', 'body', 'arm', 'waist', 'leg'];
    const skillsToValidate = [...skillDeficits.seriesSkills, ...skillDeficits.groupSkills];

    for (const targetSkill of skillsToValidate) {
        const { skillId, level: requiredLevel } = targetSkill;

        let currentLevel = 0;
        ARMOR_TYPES.forEach(type => {
            const armorPiece = equipment[type]?.equipment;
            if (armorPiece) {
                const skillOnPiece = armorPiece.skills.find(s => s.skillId === skillId);
                if (skillOnPiece) {
                    currentLevel += skillOnPiece.level;
                }
            }
        });

        // 验证武器和护石上的技能贡献
        const weapon = equipment.weapon?.equipment;
        if (weapon) {
            const skillOnWeapon = weapon.skills.find(s => s.skillId === skillId);
            if (skillOnWeapon) {
                currentLevel += skillOnWeapon.level;
            }
        }
        const charm = equipment.charm?.equipment;
        if (charm) {
            const skillOnCharm = charm.skills.find(s => s.skillId === skillId);
            if (skillOnCharm) {
                currentLevel += skillOnCharm.level;
            }
        }

        if (currentLevel < requiredLevel) {
            return false; // 技能等级不足
        }
    }

    // 所有 series 和 group 技能需求都得到满足
    return true;
}