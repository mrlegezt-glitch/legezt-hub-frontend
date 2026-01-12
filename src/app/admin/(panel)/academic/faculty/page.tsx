'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, User, Trash, Edit } from 'lucide-react';

export default function FacultyPage() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [email, setEmail] = useState('');
    const [collegeId, setCollegeId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/academic/faculty', { name, designation, email, collegeId });
            toast.success('Faculty added successfully');
            setName('');
            setDesignation('');
            setEmail('');
        } catch (error) {
            toast.error('Failed to add faculty');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-6">Faculty Management</h1>

            <div className="bg-dark-200 p-6 rounded-2xl border border-dark-border">
                <h2 className="text-xl font-bold text-white mb-4">Add New Faculty</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Designation (e.g. Asst. Professor)"
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={designation}
                            onChange={e => setDesignation(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="College ID (UUID)"
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={collegeId}
                            onChange={e => setCollegeId(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                        Add Faculty
                    </button>
                </form>
            </div>
        </div>
    );
}
