"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"

interface Update {
    id: string
    content: string
    date: string
}

interface UpdatesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    updates: Update[]
    onAddUpdate: (content: string) => void
    onDeleteUpdate: (id: string) => void
}

export function UpdatesDialog({
    open,
    onOpenChange,
    updates,
    onAddUpdate,
    onDeleteUpdate
}: UpdatesDialogProps) {
    const [newUpdate, setNewUpdate] = useState("")

    const handleSubmit = () => {
        if (newUpdate.trim()) {
            onAddUpdate(newUpdate)
            setNewUpdate("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Program Updates</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">


                    {/* Updates List */}
                    <div className="space-y-3">
                        {updates.map((update) => (
                            <div
                                key={update.id}
                                className="p-4 rounded-[0.3rem] border group"
                            >
                                <div className="flex items-start justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(update.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDeleteUpdate(update.id)}
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                                <p className="text-sm">{update.content}</p>
                            </div>
                        ))}
                    </div>
                    {/* New Update Form */}
                    <div className="space-y-2 flex flex-col items-center gap-2">
                        <Textarea
                            placeholder="Write a new update..."
                            value={newUpdate}
                            onChange={(e) => setNewUpdate(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <Button
                            onClick={handleSubmit}
                            size="sm"
                            className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Post Update
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 