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
 * [可复用] 为单个技能需求，通过回溯法查找所有满足条件的防具组合（微型骨架）
 */
function findSkillCombos(
    skillId: string,
    requiredLevel: number,
    armorProviders: Armor[],
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

            if (currentCombo[armorType]) continue;

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
 * [核心] 将两组骨架进行合并
 */
function mergeScaffolds(groupA: EquipmentSet[], groupB: EquipmentSet[]): EquipmentSet[] {
    if (groupA.length === 0) return groupB;
    if (groupB.length === 0) return groupA;

    const merged: EquipmentSet[] = [];
    for (const scaffoldA of groupA) {
        for (const scaffoldB of groupB) {
            const newScaffold = cloneDeep(scaffoldA);
            let hasConflict = false;
            for (const armorType of ARMOR_TYPES) {
                if (scaffoldB[armorType]) {
                    if (newScaffold[armorType]) {
                        hasConflict = true;
                        break;
                    }
                    newScaffold[armorType] = scaffoldB[armorType];
                }
            }
            if (!hasConflict) {
                merged.push(newScaffold);
            }
        }
    }
    return merged;
}

export function generateArmorScaffolds(
    context: SearchContext,
    preprocessedData: PreprocessedData,
): EquipmentSet[] {
    const { seriesSkills, groupSkills } = context.skillDeficits;
    const skillsToProcess = [...seriesSkills, ...groupSkills];

    if (skillsToProcess.length === 0) {
        return [{}];
    }

    let finalScaffolds: EquipmentSet[] = [];

    // 为每个技能需求生成一批“微型骨架”
    const scaffoldsPerSkill: EquipmentSet[][] = [];
    for (const skill of skillsToProcess) {
        const armorProviders = preprocessedData.skillProviderMap.get(skill.skillId)?.armors || [];
        if (armorProviders.length === 0) return [];

        const skillScaffolds = findSkillCombos(skill.skillId, skill.level, armorProviders);
        if (skillScaffolds.length === 0) return [];

        scaffoldsPerSkill.push(skillScaffolds);
    }

    // 从第一组微型骨架开始，迭代合并后续所有组
    finalScaffolds = scaffoldsPerSkill[0];
    for (let i = 1; i < scaffoldsPerSkill.length; i++) {
        finalScaffolds = mergeScaffolds(finalScaffolds, scaffoldsPerSkill[i]);
        if (finalScaffolds.length === 0) return []; // 如果中途合并不出结果，说明需求冲突
    }

    return finalScaffolds;
}