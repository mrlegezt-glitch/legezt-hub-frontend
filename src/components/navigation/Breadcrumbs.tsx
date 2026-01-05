'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={clsx("flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap no-scrollbar", className)}>
            <Link href="/" className="hover:text-primary-500 transition-colors flex items-center gap-1">
                <Home size={16} />
                <span className="sr-only">Home</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight size={14} className="mx-2 text-gray-400 flex-shrink-0" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-primary-500 transition-colors truncate max-w-[150px]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}

export default Breadcrumbs;
