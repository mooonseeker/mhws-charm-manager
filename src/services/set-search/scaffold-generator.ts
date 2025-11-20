import { cloneDeep } from 'lodash-es';

import type {
    Armor,
    ArmorType,
    EquipmentSet,
    PreprocessedData,
    SearchContext,
} from '@/types';

const ARMOR_TYPES: ArmorType[] = ['helm', 'body', 'arm', 'waist', 'leg'];

/**
 * [可复用] 为单个技能需求，通过回溯法查找所有满足条件的防具组合（微型骨架），并避开已占用的部位
 */
function findSkillCombosWithConstraints(
    skillId: string,
    requiredLevel: number,
    armorProviders: Armor[],
    occupiedTypes: Set<ArmorType>
): EquipmentSet[] {
    const solutions: EquipmentSet[] = [];
    const backtrack = (targetLevel: number, startIndex: number, currentCombo: EquipmentSet) => {
        if (targetLevel <= 0) {
            solutions.push(cloneDeep(currentCombo));
            return;
        }
        if (startIndex >= armorProviders.length) return;

        for (let i = startIndex; i < armorProviders.length; i++) {
            const armor = armorProviders[i];
            const armorType = armor.type;

            // 1. 检查当前组合是否已占用该部位
            if (currentCombo[armorType]) continue;
            // 2. 检查外部约束是否已占用该部位
            if (occupiedTypes.has(armorType)) continue;

            const skillOnArmor = armor.skills.find(s => s.skillId === skillId);
            if (!skillOnArmor) continue;

            currentCombo[armorType] = { equipment: armor, accessories: [] };
            backtrack(targetLevel - skillOnArmor.level, i + 1, currentCombo);
            delete currentCombo[armorType];
        }
    };
    backtrack(requiredLevel, 0, {});
    return solutions;
}

/**
 * [核心] 通过一体化回溯生成防具骨架
 * 策略：按“最约束优先”排序技能，逐个递归求解，并传递已占用的部位作为约束。
 */
export function generateArmorScaffolds(
    context: SearchContext,
    preprocessedData: PreprocessedData,
): EquipmentSet[] {
    const { seriesSkills, groupSkills } = context.skillDeficits;
    const skillsToProcess = [...seriesSkills, ...groupSkills];

    if (skillsToProcess.length === 0) {
        return [{}]; // 无需骨架，返回一个空骨架
    }

    // 1. 排序技能：最难满足的（提供者最少的）优先处理，以提前剪枝
    skillsToProcess.sort((a, b) => {
        const providersA = preprocessedData.skillProviderMap.get(a.skillId)?.armors.length || 0;
        const providersB = preprocessedData.skillProviderMap.get(b.skillId)?.armors.length || 0;
        return providersA - providersB;
    });

    const finalScaffolds: EquipmentSet[] = [];

    // 2. 定义并启动递归函数
    function findCombinedScaffoldsRecursive(
        skillIndex: number,
        currentScaffold: EquipmentSet,
        occupiedTypes: Set<ArmorType>
    ) {
        // Base Case: 所有技能都已成功处理
        if (skillIndex >= skillsToProcess.length) {
            finalScaffolds.push(cloneDeep(currentScaffold));
            return;
        }

        const currentSkill = skillsToProcess[skillIndex];
        const armorProviders = preprocessedData.skillProviderMap.get(currentSkill.skillId)?.armors || [];

        // 如果当前技能没有防具提供者，则无法满足，剪枝
        if (armorProviders.length === 0) return;

        // 3. 基于当前约束，为当前技能寻找所有可能的“增量骨架”
        const incrementalScaffolds = findSkillCombosWithConstraints(
            currentSkill.skillId,
            currentSkill.level,
            armorProviders,
            occupiedTypes
        );

        // 如果找不到增量骨架，则此分支无法满足所有技能，剪枝
        if (incrementalScaffolds.length === 0) return;

        // 4. 遍历找到的每个增量骨架，并进行递归
        for (const increment of incrementalScaffolds) {
            // a. 合并骨架 (这里的合并是安全的，因为 findSkillCombosWithConstraints 已经排除了冲突)
            const nextScaffold = { ...currentScaffold };
            const nextOccupiedTypes = new Set(occupiedTypes);

            for (const armorType of ARMOR_TYPES) {
                if (increment[armorType]) {
                    nextScaffold[armorType] = increment[armorType];
                    nextOccupiedTypes.add(armorType);
                }
            }

            // b. 递归处理下一个技能
            findCombinedScaffoldsRecursive(skillIndex + 1, nextScaffold, nextOccupiedTypes);
        }
    }

    // 启动递归
    findCombinedScaffoldsRecursive(0, {}, new Set());

    return finalScaffolds;
}