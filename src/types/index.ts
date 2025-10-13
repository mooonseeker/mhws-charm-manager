/**
 * MHWS护石管理器 - 核心类型定义
 * 
 * 本文件包含应用的所有核心TypeScript类型和接口定义
 */

/**
 * 技能类型枚举
 * - weapon: 武器技能
 * - armor: 防具技能  
 * - special: 特殊技能
 */
export type SkillType = 'weapon' | 'armor' | 'special';

/**
 * 孔位类型
 * - weapon: 武器孔位
 * - armor: 防具孔位
 */
export type SlotType = 'weapon' | 'armor';

/**
 * 孔位等级（1-3级，-1表示特殊技能无装饰品）
 */
export type SlotLevel = -1 | 1 | 2 | 3;

/**
 * 技能完整定义
 * 
 * @property id - 技能唯一ID
 * @property name - 技能名称
 * @property type - 技能类型（武器/防具/特殊）
 * @property maxLevel - 技能最大等级（1-7不等）
 * @property decorationLevel - 装饰品等级（1-3）
 * @property isKey - 是否为核心技能
 */
export interface Skill {
    id: string;
    name: string;
    type: SkillType;
    maxLevel: number;
    decorationLevel: SlotLevel;
    isKey: boolean;
}

/**
 * 带等级的技能引用
 * 
 * @property skillId - 技能ID（引用Skill.id）
 * @property level - 当前等级（1-maxLevel）
 */
export interface SkillWithLevel {
    skillId: string;
    level: number;
}

/**
 * 孔位定义
 * 
 * @property type - 孔位类型（武器/防具）
 * @property level - 孔位等级（1-3）
 */
export interface Slot {
    type: SlotType;
    level: SlotLevel;
}

/**
 * 等效孔位统计
 * 
 * 用于统计护石技能和孔位转换后的等效孔位数量
 * 
 * @property weaponSlot1 - 1级武器孔位数量
 * @property weaponSlot2 - 2级武器孔位数量
 * @property weaponSlot3 - 3级武器孔位数量
 * @property armorSlot1 - 1级防具孔位数量
 * @property armorSlot2 - 2级防具孔位数量
 * @property armorSlot3 - 3级防具孔位数量
 */
export interface EquivalentSlots {
    weaponSlot1: number;
    weaponSlot2: number;
    weaponSlot3: number;
    armorSlot1: number;
    armorSlot2: number;
    armorSlot3: number;
}

/**
 * 护石完整定义
 * 
 * @property id - 护石唯一ID
 * @property rarity - 稀有度（1-12）
 * @property skills - 技能列表（1-3个）
 * @property slots - 孔位列表（0-3个）
 * @property equivalentSlots - 等效孔位（根据技能和孔位计算得出）
 * @property keySkillValue - 核心技能价值（根据等效孔位计算得出）
 * @property createdAt - 创建时间（ISO 8601格式）
 */
export interface Charm {
    id: string;
    rarity: number;
    skills: SkillWithLevel[];
    slots: Slot[];
    equivalentSlots: EquivalentSlots;
    keySkillValue: number;
    createdAt: string;
}

/**
 * 护石验证结果
 * 
 * @property isValid - 是否通过验证
 * @property warnings - 警告消息列表
 * @property isInferior - （可选）是否落后于现有护石
 * @property isBelowAverage - （可选）是否低于平均水平
 */
export interface CharmValidationResult {
    isValid: boolean;
    warnings: string[];
    isInferior?: boolean;
    isBelowAverage?: boolean;
}

/**
 * 护石排序字段
 * 
 * - keySkillValue: 核心技能价值
 * - rarity: 稀有度
 * - createdAt: 创建时间
 * - weaponSlot1/2/3: 武器孔位1/2/3级数量
 * - armorSlot1/2/3: 防具孔位1/2/3级数量
 */
export type CharmSortField =
    | 'keySkillValue'
    | 'rarity'
    | 'createdAt'
    | 'weaponSlot1'
    | 'weaponSlot2'
    | 'weaponSlot3'
    | 'armorSlot1'
    | 'armorSlot2'
    | 'armorSlot3';

/**
 * 排序方向
 * - asc: 升序
 * - desc: 降序
 */
export type SortDirection = 'asc' | 'desc';