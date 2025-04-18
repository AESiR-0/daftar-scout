import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AgeRangeProps {
    minAge: string
    maxAge: string
    onMinChange: (value: string) => void
    onMaxChange: (value: string) => void
    selected?: string | string[] | undefined
}

export function AgeRange({ minAge, maxAge, onMinChange, onMaxChange }: AgeRangeProps) {
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    type="number"
                    placeholder="Min"
                    value={minAge}
                    onChange={(e) => onMinChange(e.target.value)}
                    className="h-9"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                    type="number"
                    placeholder="Max"
                    value={maxAge}
                    onChange={(e) => onMaxChange(e.target.value)}
                    className="h-9"
                />
            </div>
        </div>
    )
} 