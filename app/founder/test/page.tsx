"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProfileDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: {
        name: string;
        email: string;
        role: string;
        joined: string;
    };
}

const ProfileDetailsModal = ({ isOpen, onClose, profile }: ProfileDetailsModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Profile Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Role:</strong> {profile.role}</p>
                    <p><strong>Joined:</strong> {new Date(profile.joined).toLocaleDateString()}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const TestPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const profile = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Founder',
        joined: '2021-01-01'
    };

    return (
        <div>
            <div
                onMouseEnter={() => setIsModalOpen(true)}
                onMouseLeave={() => setIsModalOpen(false)}
            >
                <Button>Show Profile Details</Button>
            </div>
            <ProfileDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={profile}
            />
        </div>
    );
};

export default TestPage;
