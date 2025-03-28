import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface InviteMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
    const [email, setEmail] = useState("")
    const [designation, setDesignation] = useState("")

    const handleInvite = () => {
        // Handle invite logic here
        console.log("Inviting:", { email, designation })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                            id="designation"
                            type="text"
                            placeholder="Enter designation (e.g. Software Engineer)"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={handleInvite} 
                        className="w-full rounded-[0.35rem]"
                        disabled={!email || !designation}
                    >
                        Send Invitation
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 