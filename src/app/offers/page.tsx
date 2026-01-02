'use client';

// ==================================
// Offers (Courses) Page
// ==================================

import { useState, useEffect } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/navigation/BottomNav';
import { courseApi } from '@/lib/api';

interface Course {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    price: number;
    isPaid: boolean;
    enrollmentCount: number;
}

export default function OffersPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const params = filter === 'all' ? {} : { isPaid: filter === 'paid' };
                const response = await courseApi.list(params);
                setCourses(response.data.data);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [filter]);

    return (
        <main className="min-h-screen pb-24 md:pb-12">
            {/* Mobile Header (Replaced by Global MobileHeader) */}


            <div className="max-w-lg md:max-w-7xl mx-auto px-5 md:px-6 md:pt-8">
                {/* Desktop Title */}
                <div className="hidden md:block mb-8">
                    <h1 className="text-3xl font-bold">Courses & Premium Offers</h1>
                    <p className="text-gray-400 mt-1">Boost your skills with exclusive content</p>
                </div>

                {/* Filter Tabs */}
                <section className="py-4">
                    <div className="flex gap-2">
                        {(['all', 'free', 'paid'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${filter === f
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-600/25'
                                    : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Course Cards */}
                <section className="mt-2">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="skeleton h-48 md:h-64 rounded-2xl" />
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-12 md:py-24 bg-dark-100/30 rounded-3xl border border-dashed border-dark-border">
                            <Star size={48} className="mx-auto text-dark-border mb-4" />
                            <p className="text-gray-400">No courses found matching your filter</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {courses.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`/offers/${course.id}`}
                                    className="card-hover overflow-hidden flex flex-col h-full bg-dark-100/50"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-600 relative">
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-4xl">📚</span>
                                            </div>
                                        )}

                                        {/* Price Badge */}
                                        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-lg ${course.isPaid
                                            ? 'bg-yellow-500/90 text-black'
                                            : 'bg-green-500/90 text-white'
                                            }`}>
                                            {course.isPaid ? `₹${course.price}` : 'FREE'}
                                        </div>
                                    </div>

                                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                                        <h3 className="font-medium text-sm md:text-base line-clamp-2 md:line-clamp-2">{course.title}</h3>
                                        <div className="flex items-center gap-2 mt-auto pt-3 text-xs md:text-sm text-gray-400">
                                            <Star size={14} className="text-yellow-500" fill="currentColor" />
                                            <span>{course.enrollmentCount} enrolled</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <BottomNav />
        </main>
    );
}
