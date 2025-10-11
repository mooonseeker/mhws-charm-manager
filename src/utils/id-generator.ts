/**
 * MHWS护石管理器 - ID生成工具
 * 
 * 提供唯一ID生成功能
 */

/**
 * 生成唯一ID
 * 
 * 使用时间戳和随机字符串组合生成唯一ID
 * 
 * @param prefix - ID前缀（可选），用于区分不同类型的实体
 * @returns 唯一ID字符串
 * 
 * @example
 * generateId() // 返回: "1634567890123-abc123d"
 * generateId('charm') // 返回: "charm-1634567890123-abc123d"
 * generateId('skill') // 返回: "skill-1634567890123-xyz789e"
 */
export function generateId(prefix: string = ''): string {
    // 获取当前时间戳（毫秒级）
    const timestamp = Date.now();

    // 生成随机字符串（7位，使用36进制）
    const random = Math.random().toString(36).substring(2, 9);

    // 组合ID：如果有前缀则使用前缀，否则直接返回时间戳-随机字符串
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * 批量生成唯一ID
 * 
 * 生成指定数量的唯一ID数组
 * 
 * @param count - 需要生成的ID数量
 * @param prefix - ID前缀（可选）
 * @returns 唯一ID数组
 * 
 * @example
 * generateIds(3) // 返回: ["1634567890123-abc123d", "1634567890124-def456g", "1634567890125-ghi789j"]
 * generateIds(2, 'charm') // 返回: ["charm-1634567890123-abc123d", "charm-1634567890124-def456g"]
 */
export function generateIds(count: number, prefix: string = ''): string[] {
    const ids: string[] = [];

    for (let i = 0; i < count; i++) {
        ids.push(generateId(prefix));

        // 添加微小延迟，确保时间戳不同
        // 注意：在实际使用中，如果需要同时生成大量ID，
        // 可以考虑在随机部分增加序号来保证唯一性
    }

    return ids;
}

/**
 * 验证ID格式是否正确
 * 
 * 检查ID是否符合生成器生成的格式
 * 
 * @param id - 待验证的ID
 * @param prefix - 期望的前缀（可选）
 * @returns true表示格式正确
 * 
 * @example
 * validateIdFormat("1634567890123-abc123d") // 返回: true
 * validateIdFormat("charm-1634567890123-abc123d", "charm") // 返回: true
 * validateIdFormat("invalid-id") // 返回: false
 */
export function validateIdFormat(id: string, prefix?: string): boolean {
    if (!id || typeof id !== 'string') {
        return false;
    }

    // 如果指定了前缀，检查ID是否以该前缀开头
    if (prefix) {
        if (!id.startsWith(`${prefix}-`)) {
            return false;
        }
        // 移除前缀继续验证
        id = id.substring(prefix.length + 1);
    }

    // 验证格式：timestamp-random
    // timestamp: 13位数字（毫秒级时间戳）
    // random: 7位36进制字符
    const parts = id.split('-');

    if (parts.length !== 2) {
        return false;
    }

    const [timestamp, random] = parts;

    // 验证时间戳：应该是13位数字
    if (!/^\d{13}$/.test(timestamp)) {
        return false;
    }

    // 验证随机字符串：应该是7位36进制字符（0-9, a-z）
    if (!/^[0-9a-z]{7}$/.test(random)) {
        return false;
    }

    return true;
}