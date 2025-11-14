import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSkills } from '@/contexts';
import { useSetBuilder } from '@/contexts/SetBuilderContext';
import { cn } from '@/lib/utils';

export function SkillRequirements() {
    const { requiredSkills, updateRequiredSkillLevel } = useSetBuilder();
    const { getSkillById } = useSkills();

    const handleLevelChange = (skillId: string, currentLevel: number, change: number) => {
        const newLevel = currentLevel + change;
        updateRequiredSkillLevel(skillId, newLevel);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>技能需求</CardTitle>
            </CardHeader>
            <CardContent>
                {requiredSkills.length === 0 ? (
                    <p className="text-muted-foreground text-sm">请通过上方的工具栏添加技能需求。</p>
                ) : (
                    <ul className="space-y-2">
                        {requiredSkills.map(skill => {
                            const skillInfo = getSkillById(skill.skillId);
                            if (!skillInfo) return null;

                            return (
                                <li key={skill.skillId} className="flex justify-between items-center h-8">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <img
                                            src={`/skill-type/${skillInfo.type}.png`}
                                            alt={skillInfo.name}
                                            className="w-5 h-5"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                        <span className={cn(
                                            "truncate text-sm",
                                            skillInfo.isKey ? "font-bold" : "font-medium"
                                        )}>
                                            {skillInfo.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleLevelChange(skill.skillId, skill.level, -1)}>-</Button>
                                        <span className="w-8 text-center">Lv {skill.level}</span>
                                        <Button size="sm" variant="outline" onClick={() => handleLevelChange(skill.skillId, skill.level, 1)}>+</Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
