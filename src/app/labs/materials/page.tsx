'use client';

// ==================================
// Labs Materials Page
// ==================================

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, Beaker, BookOpen, FileText, FolderOpen } from 'lucide-react';
import BottomNav from '@/components/navigation/BottomNav';

// Static categories for now (can be made dynamic later)
const categories = [
    {
        id: 'chemistry',
        name: 'Chemistry Lab',
        icon: Beaker,
        color: 'green',
        description: 'Lab manuals, experiment procedures, and viva questions',
        folders: [
            { id: '1', name: 'Experiment 1 - Titration', fileCount: 3 },
            { id: '2', name: 'Experiment 2 - Salt Analysis', fileCount: 2 },
            { id: '3', name: 'Experiment 3 - Electrochemistry', fileCount: 4 },
        ]
    },
    {
        id: 'non-technical',
        name: 'Non-Technical',
        icon: BookOpen,
        color: 'blue',
        description: 'English, Environmental Science, and other practicals',
        folders: [
            { id: '1', name: 'English Communication Lab', fileCount: 5 },
            { id: '2', name: 'Environmental Studies', fileCount: 3 },
        ]
    }
];

export default function MaterialsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const activeCategory = categories.find(c => c.id === selectedCategory);

    return (
        <main className="min-h-screen pt-24 md:pt-28 pb-24 px-5 md:px-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/labs"
                        className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Back to Labs
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="gradient-text">Lab Materials</span>
                    </h1>
                    <p className="text-gray-400">Chemistry, Non-technical, and other practical documents</p>
                </div>

                {!selectedCategory ? (
                    // Category Selection
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`card p-6 text-left group hover:border-${cat.color}-500/50 transition-all`}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-${cat.color}-500/10 text-${cat.color}-400 flex items-center justify-center mb-4`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                                    <p className="text-gray-400 text-sm mb-4">{cat.description}</p>
                                    <span className="text-sm text-gray-500">
                                        {cat.folders.length} experiments
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    // Folder List
                    <div>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft size={18} className="mr-2" /> Back to Categories
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            {activeCategory && (
                                <>
                                    <activeCategory.icon size={24} className={`text-${activeCategory.color}-400`} />
                                    <h2 className="text-2xl font-bold">{activeCategory.name}</h2>
                                </>
                            )}
                        </div>

                        <div className="space-y-3">
                            {activeCategory?.folders.map((folder) => (
                                <div
                                    key={folder.id}
                                    className="card p-4 flex items-center justify-between hover:border-primary-500/50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                                            <FolderOpen size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{folder.name}</h3>
                                            <p className="text-xs text-gray-500">{folder.fileCount} files</p>
                                        </div>
                                    </div>
                                    <FileText size={18} className="text-gray-500" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-dark-100/50 border border-dark-border text-center">
                            <p className="text-gray-400 text-sm">
                                📁 More experiments will be added soon. Contact admin to request materials.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}
