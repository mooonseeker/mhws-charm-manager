import * as React from 'react';

import { cn } from '@/lib/utils';
import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    hideTicks?: boolean;
    ticks?: Array<number | string>;
}

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({ className, hideTicks = false, ticks, ...props }, ref) => {
    // Generate default ticks if not provided
    const defaultTicks = React.useMemo(() => {
        if (ticks) return ticks;
        if (!props.min || !props.max || !props.step) return [];

        const min = props.min;
        const max = props.max;
        const step = props.step;
        const tickCount = Math.floor((max - min) / step) + 1;

        return Array.from({ length: tickCount }, (_, i) => min + i * step);
    }, [ticks, props.min, props.max, props.step]);

    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn(
                "relative flex w-full touch-none select-none items-center",
                className
            )}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
                <SliderPrimitive.Range className="absolute h-full bg-primary" />
            </SliderPrimitive.Track>
            {/*
          Radix Slider automatically renders one thumb for each value in the array.
          We map over the values to ensure we render the correct number of thumbs
          and apply the same styling to all of them.
        */}
            {(props.value || props.defaultValue || [0]).map((_, index) => (
                <SliderPrimitive.Thumb
                    key={index}
                    className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                />
            ))}
            {!hideTicks && defaultTicks.length > 0 && (
                <div className="absolute inset-x-0 top-full mt-2 pointer-events-none">
                    {defaultTicks.map((tick, index) => {
                        // Calculate position considering thumb width (1.25rem = 20px)
                        // Effective distribution width: 100% - 1.25rem, with 0.625rem margins on both sides
                        const position = defaultTicks.length > 1
                            ? `calc(0.625rem + (100% - 1.25rem) * ${index / (defaultTicks.length - 1)})`
                            : 'calc(0.625rem)';

                        return (
                            <div
                                key={index}
                                className="absolute flex flex-col items-center"
                                style={{
                                    left: position,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                <span className="h-2 w-px bg-border mb-1" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap pointer-events-auto">
                                    {tick}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </SliderPrimitive.Root>
    );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };