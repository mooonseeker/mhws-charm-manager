import type {
    Armor,
    ArmorType,
    FinalSet,
    PreprocessedData,
    SearchContext,
    SkillDeficit,
    SkillWithLevel,
} from '@/types';
import { cloneDeep } from 'lodash-es';

import { solveDecorations } from './decoration-solver';
import { shouldPrune } from './helpers';

const ARMOR_TYPES: ArmorType[] = ['helm', 'body', 'arm', 'waist', 'leg'];

/**
 * v7.1 防具组合回溯搜索主函数
 *
 * @param context - 包含武器和护石信息的初始搜索上下文
 * @param armors - 所有可用防具的列表
 * @param preprocessedData - 预处理数据
 * @returns {FinalSet[]} - 所有找到的完整配装方案
 */
export function findArmorCombinations(
    context: SearchContext,
    armors: Armor[],
    preprocessedData: PreprocessedData,
    finalResults: FinalSet[], // Directly mutate the final list
    limit: number,
): boolean { // Return false to signal search abortion
    console.log(`    [>>] Entering armor search (limit: ${limit}, current: ${finalResults.length})...`);

    // 将防具按部位分组以提高查询效率
    const armorsByType = new Map<ArmorType, Armor[]>();
    ARMOR_TYPES.forEach(type => {
        armorsByType.set(type, armors.filter(a => a.type === type));
    });

    const initialResultCount = finalResults.length;
    const shouldContinue = backtrack(0, context, finalResults, armorsByType, preprocessedData, limit);
    const foundCount = finalResults.length - initialResultCount;

    console.log(`    [<<] Exiting armor search. Found ${foundCount} new combinations.`);
    return shouldContinue;
}

/**
 * v7.1 递归回溯辅助函数
 *
 * @param armorTypeIndex - 当前处理的防具部位索引 (0-4: helm -> leg)
 * @param context - 当前的搜索状态
 * @param finalResults - 存储有效解决方案的数组 (global)
 * @param armorsByType - 按部位分组的防具池
 * @param preprocessedData - 预处理数据
 * @param limit - 解决方案数量上限
 * @returns {boolean} - 返回 false 表示已达到上限，应中止所有搜索
 */
function backtrack(
    armorTypeIndex: number,
    context: SearchContext,
    finalResults: FinalSet[],
    armorsByType: Map<ArmorType, Armor[]>,
    preprocessedData: PreprocessedData,
    limit: number,
): boolean {
    const remainingArmorTypes = ARMOR_TYPES.slice(armorTypeIndex);

    const indent = '    '.repeat(armorTypeIndex + 2);

    // 1. 剪枝检查
    if (shouldPrune(context.currentSkills, remainingArmorTypes, context.skillDeficits, preprocessedData)) {
        // console.log(`${indent}[-] Pruning branch at level ${armorTypeIndex}.`); // Log is very noisy
        return true; // Prune this branch, but continue searching siblings
    }

    // 2. 终止条件：5件防具都已选择
    if (armorTypeIndex === 5) {
        console.log(`${indent}[*] Reached level 5. All armor pieces selected. Attempting to solve...`);
        // a. 计算 armorSkills 的最终缺口
        const armorSkillDeficits: SkillDeficit[] = context.skillDeficits.armorSkills
            .map((s: SkillWithLevel) => ({
                skillId: s.skillId,
                missingLevel: s.level - (context.currentSkills.get(s.skillId) || 0),
            }))
            .filter(d => d.missingLevel > 0);

        // 如果没有 armorSkills 缺口，则该组合已满足所有技能，直接生成方案
        if (armorSkillDeficits.length === 0) {
            const finalSet: FinalSet = {
                equipment: cloneDeep(context.equipment),
                decorations: new Map(), // No decorations needed for armorSkills
                remainingSlots: [...context.availableSlots.armor, ...context.availableSlots.weapon],
                extraSkills: [], // Extra skill calculation can be added later
            };
            console.log(`${indent}  -> Success: No armor skill deficits. Solution found.`);
            finalResults.push(finalSet);
            if (finalResults.length >= limit) {
                console.log(`${indent}  -> Search limit reached!`);
                return false; // Stop searching
            }
            return true; // Continue searching
        }

        // b. 调用珠子求解器来填充 armorSkills
        console.log(`${indent}  -> Calling decoration solver for ${armorSkillDeficits.length} deficits...`);
        const decorationSolution = solveDecorations(
            armorSkillDeficits,
            { weapon: [], armor: context.availableSlots.armor }, // 只使用防具孔位
            preprocessedData.accessoriesBySkill,
            preprocessedData.skillDetails,
        );

        // c. 如果填充成功，则生成最终配装方案
        if (decorationSolution.isSuccess) {
            console.log(`${indent}  -> Success: Decoration solver found a solution.`);
            const finalSet: FinalSet = {
                equipment: cloneDeep(context.equipment),
                decorations: decorationSolution.placement,
                remainingSlots: [
                    ...decorationSolution.remainingSlots.armor,
                    ...decorationSolution.remainingSlots.weapon,
                    ...context.availableSlots.weapon
                ],
                extraSkills: [], // Extra skill calculation can be added later
            };
            finalResults.push(finalSet);
            if (finalResults.length >= limit) {
                console.log(`${indent}  -> Search limit reached!`);
                return false; // Stop searching
            }
        } else {
            console.log(`${indent}  -> Failure: Decoration solver could not find a solution.`);
        }
        // 如果失败，则此组合无效，直接返回
        return true; // Continue searching this branch's siblings
    }

    // 3. 递归遍历 (Optimized: No cloneDeep, manual state mutation and revert)
    const currentArmorType = ARMOR_TYPES[armorTypeIndex];
    const availableArmors = armorsByType.get(currentArmorType) || [];

    for (const armorPiece of availableArmors) {
        // --- 1. Mutate state forward ---
        // a. Update equipment
        context.equipment[currentArmorType] = { equipment: armorPiece, accessories: [] };

        // b. Update skills (and save previous state to revert)
        const oldSkillLevels = new Map<string, number | undefined>();
        for (const skill of armorPiece.skills) {
            const oldLevel = context.currentSkills.get(skill.skillId);
            oldSkillLevels.set(skill.skillId, oldLevel);
            context.currentSkills.set(skill.skillId, (oldLevel || 0) + skill.level);
        }

        // c. Update slots (and save previous state to revert)
        const slotsAddedCount = armorPiece.slots.length;
        context.availableSlots.armor.push(...armorPiece.slots);

        // --- 2. Recurse to the next level ---
        const shouldContinue = backtrack(
            armorTypeIndex + 1,
            context, // Pass mutated context
            finalResults,
            armorsByType,
            preprocessedData,
            limit,
        );

        // --- 3. Revert state (backtrack) ---
        // c. Revert slots
        context.availableSlots.armor.splice(context.availableSlots.armor.length - slotsAddedCount, slotsAddedCount);

        // b. Revert skills
        for (const skill of armorPiece.skills) {
            const oldLevel = oldSkillLevels.get(skill.skillId);
            if (oldLevel === undefined) {
                context.currentSkills.delete(skill.skillId); // It was a new skill
            } else {
                context.currentSkills.set(skill.skillId, oldLevel); // Restore old level
            }
        }

        // a. Revert equipment
        delete context.equipment[currentArmorType];

        // --- 4. Propagate stop signal if needed ---
        if (!shouldContinue) {
            return false;
        }
    }
    return true; // Continue searching siblings
}