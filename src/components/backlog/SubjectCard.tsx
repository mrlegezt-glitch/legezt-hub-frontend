import { BookOpen, Calendar, Layers } from 'lucide-react';

interface SubjectCardProps {
    id: string;
    name: string;
    code: string;
    semester?: {
        displayName: string;
        year?: {
            displayName: string;
        }
    };
    _count?: {
        pdfs: number;
    };
    onClick: () => void;
}

export default function SubjectCard({ name, code, semester, _count, onClick }: SubjectCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative bg-dark-200 border border-dark-border rounded-xl p-5 hover:border-primary-500/50 hover:bg-dark-300 transition-all cursor-pointer overflow-hidden"
        >
            {/* Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-dark-100 rounded-lg border border-dark-border group-hover:border-primary-500/30 transition-colors">
                        <BookOpen size={24} className="text-primary-400" />
                    </div>
                    <span className="text-xs font-mono font-medium text-gray-500 bg-dark-100 px-2 py-1 rounded border border-dark-border group-hover:text-primary-400 group-hover:border-primary-500/30 transition-colors">
                        {code}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-400 transition-colors line-clamp-2">
                        {name}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-y-2 gap-x-3 mt-3">
                        {semester?.year && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-dark-100/50 px-2 py-1 rounded">
                                <Calendar size={12} />
                                <span>{semester.year.displayName}</span>
                            </div>
                        )}
                        {semester && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-dark-100/50 px-2 py-1 rounded">
                                <Layers size={12} />
                                <span>{semester.displayName}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-dark-border/50 flex items-center justify-between text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    <span>
                        {_count?.pdfs || 0} Resources
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform text-primary-400 font-medium">
                        View Material →
                    </span>
                </div>
            </div>
        </div>
    );
}
