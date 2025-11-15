import type { Accessory, DecorationSolution, Skill, SkillDeficit, Slot } from '@/types';

/**
 * 装饰品填充求解器
 * 使用贪心算法为技能缺口选择最优的装饰品组合
 * 现在支持区分武器和防具孔位
 *
 * 算法策略：
 * 1. 技能缺口排序：优先处理缺口大的技能，其次是可选装饰品少的技能
 * 2. 孔位分类：武器技能只能放入武器孔位，防具技能只能放入防具孔位
 * 3. 贪心选择：为每个技能缺口选择slotLevel最低、rarity最低的装饰品
 * 4. 孔位匹配：为装饰品寻找能容纳的最小等级孔位
 *
 * @param deficits - 技能缺口列表
 * @param availableSlots - 可用孔位对象，包含武器和防具孔位
 * @param accessoriesBySkill - 按技能分组的装饰品映射
 * @param skillDetails - 技能详情映射，用于获取技能类型
 * @returns 装饰品填充方案
 */
export function solveDecorations(
    deficits: SkillDeficit[],
    availableSlots: { weapon: Slot[], armor: Slot[] },
    accessoriesBySkill: Map<string, Accessory[]>,
    skillDetails: Map<string, Skill>
): DecorationSolution {
    // 复制并排序技能缺口：优先处理缺口大的技能，其次是可选装饰品少的技能
    const sortedDeficits = [...deficits].sort((a, b) => {
        const aAccessoryCount = accessoriesBySkill.get(a.skillId)?.length || 0;
        const bAccessoryCount = accessoriesBySkill.get(b.skillId)?.length || 0;

        // 首先按缺失等级降序排序（缺口大的优先）
        if (a.missingLevel !== b.missingLevel) {
            return b.missingLevel - a.missingLevel;
        }
        // 其次按可选装饰品数量升序排序（装饰品少的优先）
        return aAccessoryCount - bAccessoryCount;
    });

    // 复制可用孔位，分别按等级升序排序
    const remainingWeaponSlots = [...availableSlots.weapon].sort((a, b) => a.level - b.level);
    const remainingArmorSlots = [...availableSlots.armor].sort((a, b) => a.level - b.level);

    // 装饰品放置方案: key为装备ID, value为该装备上的装饰品列表
    const placement = new Map<string, Accessory[]>();

    let isSuccess = true;

    for (const deficit of sortedDeficits) {
        // 获取技能类型，决定使用哪种孔位和装饰品
        const skill = skillDetails.get(deficit.skillId);
        if (!skill) {
            // 如果找不到技能定义，跳过这个缺口
            continue;
        }

        // 根据技能类型选择孔位列表和装饰品类型
        const isWeaponSkill = skill.category === 'weapon';
        const targetSlots = isWeaponSkill ? remainingWeaponSlots : remainingArmorSlots;
        const accessoryType = isWeaponSkill ? 'weapon' : 'armor';

        // 获取能提供该技能的装饰品候选列表，并过滤出对应类型的装饰品
        const candidates = accessoriesBySkill.get(deficit.skillId) || [];
        const typeFilteredCandidates = candidates.filter(accessory => accessory.type === accessoryType);

        // 过滤出能满足当前缺口的装饰品（提供技能等级 >= 缺失等级）
        const validCandidates = typeFilteredCandidates.filter(accessory => {
            const skill = accessory.skills.find(s => s.skillId === deficit.skillId);
            return skill && skill.level >= deficit.missingLevel;
        });

        // 如果没有合适的装饰品，填充失败
        if (validCandidates.length === 0) {
            isSuccess = false;
            break;
        }

        // 选择最优装饰品：优先slotLevel最低，其次rarity最低
        const bestAccessory = validCandidates.sort((a, b) => {
            if (a.slotLevel !== b.slotLevel) {
                return a.slotLevel - b.slotLevel;
            }
            return a.rarity - b.rarity;
        })[0];

        // 在目标孔位中查找能容纳该装饰品的最小等级孔位
        const suitableSlotIndex = targetSlots.findIndex(slot =>
            slot.level >= bestAccessory.slotLevel
        );

        // 如果找不到合适的孔位，填充失败
        if (suitableSlotIndex === -1) {
            isSuccess = false;
            break;
        }

        // 放置装饰品
        const slot = targetSlots[suitableSlotIndex];
        const sourceId = slot.sourceId;

        // 如果孔位没有来源ID，则无法归属，这是一个错误
        if (!sourceId) {
            console.error('CRITICAL: slot is missing sourceId in solveDecorations', slot);
            isSuccess = false;
            break;
        }

        if (!placement.has(sourceId)) {
            placement.set(sourceId, []);
        }
        placement.get(sourceId)!.push(bestAccessory);

        // 移除已使用的孔位
        targetSlots.splice(suitableSlotIndex, 1);
    }

    const result = {
        isSuccess,
        placement,
        remainingSlots: {
            weapon: remainingWeaponSlots,
            armor: remainingArmorSlots,
        },
    };

    console.log('[Debug] solveDecorations result:', {
        isSuccess: result.isSuccess,
        placement: Object.fromEntries(result.placement.entries()),
    });

    return result;
}