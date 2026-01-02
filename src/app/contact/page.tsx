'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, Globe, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Message sent! We'll get back to you shortly.");
        setFormData({ name: '', email: '', message: '' });
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Have a question, suggestion, or just want to say hi? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info Card */}
                    <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card bg-gradient-to-br from-dark-200 to-dark-100 p-8 border border-dark-border relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-opacity opacity-50 group-hover:opacity-80"></div>

                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <MessageSquare className="text-primary-500" />
                                Contact Details
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center text-primary-400 shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 mb-1">Email Us</p>
                                        <a href="mailto:support@legezt.app" className="text-lg font-semibold text-white hover:text-primary-400 transition-colors">
                                            support@legezt.app
                                        </a>
                                        <p className="text-xs text-gray-500 mt-1">For general inquiries & support</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center text-purple-400 shrink-0">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 mb-1">Socials</p>
                                        <div className="flex gap-4 mt-2">
                                            <a href="#" className="p-2 bg-dark-200 rounded-lg hover:bg-primary-500 hover:text-white transition-all">Instagram</a>
                                            <a href="#" className="p-2 bg-dark-200 rounded-lg hover:bg-blue-500 hover:text-white transition-all">Twitter</a>
                                            <a href="#" className="p-2 bg-dark-200 rounded-lg hover:bg-blue-700 hover:text-white transition-all">LinkedIn</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-dark-300 flex items-center justify-center text-pink-400 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 mb-1">Location</p>
                                        <p className="text-white font-medium">Hyderabad, India</p>
                                        <p className="text-xs text-gray-500 mt-1">Operating Remotely</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Teaser */}
                        <div className="card p-6 border border-dark-border flex items-center justify-between group hover:border-primary-500/30 transition-colors cursor-pointer">
                            <div>
                                <h4 className="font-bold text-white mb-1">Check our FAQ</h4>
                                <p className="text-sm text-gray-400">Find quick answers to common questions</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <form onSubmit={handleSubmit} className="card p-8 border-dark-border space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"></div>

                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Send a Message</h3>
                                <p className="text-gray-400 text-sm">Fill out the form below and we'll reply within 24 hours.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input bg-dark-300/50 focus:bg-dark-300 transition-colors"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="input bg-dark-300/50 focus:bg-dark-300 transition-colors"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="input bg-dark-300/50 focus:bg-dark-300 transition-colors resize-none"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Send Message
                                        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
