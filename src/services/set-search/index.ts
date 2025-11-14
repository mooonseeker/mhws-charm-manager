/**
 * @fileoverview Entry point for the set-search algorithm service.
 * This file orchestrates the entire process of finding optimal equipment sets.
 */

import type { Accessory, Armor, ArmorType, Charm, FinalSet, Skill, SkillWithLevel, Weapon } from '@/types';
import type { SearchContext, SkillDeficit } from '@/types/set-builder';
import { cloneDeep } from 'lodash-es';

import { findArmorCombinations } from './armor-search';
import { solveDecorations } from './decoration-solver';
import { preprocess } from './preprocess';
import { evaluateAndSortResults } from './result-evaluator';
import { categorizeTargetSkills } from './utils';

const SEARCH_LIMIT = 20; // Stop search if more than this many results are found

// Define allData based on imported types
interface AllGameData {
    armors: Armor[];
    weapons: Weapon[];
    accessories: Accessory[];
    skills: Skill[];
    charms: Charm[];
}

/**
 * Main orchestration function to find optimal equipment sets based on v7.1 plan.
 *
 * This new strategy anchors the search on a fixed weapon and iterates through charms.
 * It integrates weapon-skill solving early to allow for aggressive pruning, leading
 * to a more efficient search process.
 *
 * @param requiredSkills - An array of skills the user requires.
 * @param fixedWeapon - The specific weapon to build the set around.
 * @param allData - All game data including armors, weapons, accessories, skills, and charms.
 * @returns A promise that resolves to an array of final, sorted sets.
 */
export const findOptimalSets = async (
    requiredSkills: SkillWithLevel[],
    fixedWeapon: Weapon,
    allData: AllGameData,
): Promise<FinalSet[]> => {
    console.log('[+] Starting findOptimalSets v7.1...');
    const startTime = performance.now();

    // 1. 数据预处理
    console.log('[+] Step 1: Preprocessing data...');
    const preprocessedData = preprocess(
        allData.armors,
        allData.weapons,
        allData.charms as Charm[],
        allData.accessories,
        allData.skills
    );
    console.log(`[+] Step 1: Preprocessing complete (${(performance.now() - startTime).toFixed(2)}ms).`);

    // 2. 分类目标技能
    console.log('[+] Step 2: Categorizing target skills...');
    const categorizedSkills = categorizeTargetSkills(requiredSkills, preprocessedData.skillDetails);
    console.log('[+] Step 2: Skill categorization complete.');

    // 准备按类型分组的防具，供后续的回溯搜索使用
    const armorTypes: ArmorType[] = ['helm', 'body', 'arm', 'waist', 'leg'];
    const armorsByType = new Map<ArmorType, Armor[]>();
    armorTypes.forEach(type => {
        armorsByType.set(type, allData.armors.filter((a: Armor) => a.type === type));
    });

    const finalResults: FinalSet[] = [];
    const totalCharms = allData.charms.length;
    let limitReached = false;

    // 如果没有护石数据，可以继续搜索（仅使用武器）
    if (!allData.charms || allData.charms.length === 0) {
        console.warn("No charms available for search. The search will proceed without charms.");
        // 如果需要，可以在这里添加一个只使用武器的逻辑分支
    }

    // 3. 主搜索循环: 遍历所有护石 (charms)
    for (const [index, charm] of allData.charms.entries()) {
        const charmStartTime = performance.now();
        console.log(`[+] Step 3: Main loop - Processing charm ${index + 1}/${totalCharms} (ID: ${charm.id})`);
        // 3a. 创建初始 SearchContext
        const currentSkills = new Map<string, number>();
        fixedWeapon.skills.forEach((skill: SkillWithLevel) => {
            currentSkills.set(skill.skillId, (currentSkills.get(skill.skillId) || 0) + skill.level);
        });
        charm.skills.forEach((skill: SkillWithLevel) => {
            currentSkills.set(skill.skillId, (currentSkills.get(skill.skillId) || 0) + skill.level);
        });

        const context: SearchContext = {
            equipment: {
                weapon: { equipment: fixedWeapon, accessories: [] },
                charm: { equipment: charm as Charm, accessories: [] },
            },
            currentSkills,
            availableSlots: {
                weapon: [...fixedWeapon.slots],
                armor: [...charm.slots], // 护石的孔位是通用的"armor"孔位
            },
            skillDeficits: cloneDeep(categorizedSkills), // 深拷贝以防循环间的状态污染
        };

        // 3b. 求解 Weapon-Skills
        const weaponSkillDeficits: SkillDeficit[] = context.skillDeficits.weaponSkills
            .map(targetSkill => ({
                skillId: targetSkill.skillId,
                missingLevel: targetSkill.level - (context.currentSkills.get(targetSkill.skillId) || 0),
            }))
            .filter(deficit => deficit.missingLevel > 0);

        if (weaponSkillDeficits.length > 0) {
            const solution = solveDecorations(
                weaponSkillDeficits,
                context.availableSlots,
                preprocessedData.accessoriesBySkill,
                preprocessedData.skillDetails
            );

            // 如果填充失败，则此 (武器+护石) 组合无法满足武器技能需求，直接剪枝
            if (!solution.isSuccess) {
                console.log(`  -> Pruned: Failed to solve weapon skills for this charm.`);
                continue;
            }

            // 3c. 更新 SearchContext
            // 珠子求解器现在直接返回分类好的孔位
            context.availableSlots = solution.remainingSlots;

            // 更新已满足的技能列表和技能缺口
            context.skillDeficits.weaponSkills = [];
            for (const [, accessories] of solution.placement) {
                for (const accessory of accessories) {
                    accessory.skills.forEach(skill => {
                        const current = context.currentSkills.get(skill.skillId) || 0;
                        context.currentSkills.set(skill.skillId, current + skill.level);
                    });
                }
            }
        }

        // 3d. 调用防具回溯搜索
        console.log(`  -> Delegating to armor search for charm ${charm.id}...`);
        const shouldContinue = findArmorCombinations(
            context,
            allData.armors,
            preprocessedData,
            finalResults,
            SEARCH_LIMIT,
        );

        console.log(`  -> Charm ${charm.id} processing finished in ${(performance.now() - charmStartTime).toFixed(2)}ms.`);

        if (!shouldContinue) {
            console.log(`[!] Search limit of ${SEARCH_LIMIT} reached. Aborting search.`);
            limitReached = true;
            break; // Exit the charm loop
        }
    }

    // 4. 排序并返回最终结果
    if (limitReached) {
        console.warn(
            `[!] The search was stopped because the number of combinations found reached the limit of ${SEARCH_LIMIT}. The results may be incomplete. Please add more specific skill requirements to narrow down the search.`
        );
    }
    console.log(`[+] Step 4: Found a total of ${finalResults.length} raw sets. Evaluating and sorting...`);
    // evaluateAndSortResults 将在后续任务中适配，目前可能功能不全
    const sortedSets = evaluateAndSortResults(finalResults);

    const endTime = performance.now();
    console.log(`[+] Full search completed in ${(endTime - startTime).toFixed(2)}ms.`);
    return sortedSets.slice(0, SEARCH_LIMIT);
};
