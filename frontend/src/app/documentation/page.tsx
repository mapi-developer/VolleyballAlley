// src/app/documentation/page.tsx
"use client";

import React, { useState } from 'react';
import { Search, BookOpen, Server, User, Settings, Globe, ChevronDown } from 'lucide-react';

// Import Modular Sections
import { OverviewSection } from './_sections/OverviewSection';
import { ArchitectureSection } from './_sections/ArchitectureSection';
import { ProfileSection } from './_sections/ProfileSection';
import { OrganizerSection } from './_sections/OrganizerSection';
import { BrowseSection } from './_sections/BrowseSection';

export default function DocumentationPage() {
    const [activeSection, setActiveSection] = useState('overview');
    const [expandedMenus, setExpandedMenus] = useState({
        profile: true,
        organizer: false
    });

    const toggleMenu = (menu: 'profile' | 'organizer') => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    // Helper to switch view states and execute a smooth native anchor scroll jump transition
    const handleAnchorClick = (sectionId: string, elementId: string) => {
        setActiveSection(sectionId);
        setTimeout(() => {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    };

    const getNavLinkClass = (sectionId: string, isNested = false) => {
        const baseClass = isNested 
            ? "w-full text-left pl-10 pr-3 py-1.5 text-sm rounded-lg transition-colors"
            : "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors mt-2";
            
        const activeClass = activeSection === sectionId
            ? (isNested ? "text-slate-900 bg-slate-50 font-medium" : "text-blue-700 bg-blue-50")
            : (isNested ? "text-slate-500 hover:text-slate-900 hover:bg-slate-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50");

        return `${baseClass} ${activeClass}`;
    };

    return (
        <div className="text-slate-900 overflow-hidden h-screen flex flex-col bg-slate-50">
            {/* Inject Custom Global Layout Engine Markdown Prose Styles */}
            <style>{`
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                .prose h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; letter-spacing: -0.025em; }
                .prose h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
                .prose h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .prose p { color: #475569; line-height: 1.75; margin-bottom: 1.25rem; }
                .prose ul, .prose ol { padding-left: 1.5rem; color: #475569; margin-bottom: 1.25rem; }
                .prose ul { list-style-type: disc; }
                .prose ol { list-style-type: decimal; }
                .prose li { margin-bottom: 0.5rem; }
                .prose code { background-color: #f1f5f9; color: #0f172a; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.875em; font-family: monospace; border: 1px solid #e2e8f0; }
                .prose pre { background-color: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.875rem; line-height: 1.5;}
                .prose pre code { background-color: transparent; color: inherit; padding: 0; border: none; }
            `}</style>

            {/* Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h1 className="font-extrabold text-xl tracking-tight text-slate-900">VolleyBros <span className="text-blue-600">Docs</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-500 border border-slate-200">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> System Operational
                    </div>
                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-md">v1.0.0-beta</span>
                </div>
            </header>

            {/* Main Layout Body wrapper */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar Navigation */}
                <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0 flex flex-col hidden md:flex">
                    <div className="p-6">
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Search docs..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                        </div>

                        <nav className="space-y-1">
                            <button onClick={() => setActiveSection('overview')} className={getNavLinkClass('overview')}>
                                <BookOpen size={18} /> Project Overview
                            </button>

                            <button onClick={() => setActiveSection('architecture')} className={getNavLinkClass('architecture')}>
                                <Server size={18} /> Architecture & Docker
                            </button>

                            <div className="h-px bg-slate-200 my-4"></div>
                            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Features</h3>

                            {/* Dropdown: Profile Page */}
                            <div>
                                <button onClick={() => toggleMenu('profile')} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <User size={18} /> Profile Page
                                    </div>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${expandedMenus.profile ? 'rotate-0' : '-rotate-90'}`} />
                                </button>
                                <ul className={`mt-1 mb-2 space-y-1 relative ${expandedMenus.profile ? 'block' : 'hidden'}`}>
                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200"></div>
                                    <li><button onClick={() => setActiveSection('profile-overview')} className={getNavLinkClass('profile-overview', true)}>Page Overview</button></li>
                                    
                                    {/* Anchor Specific Jumps inside Overview */}
                                    <li><button onClick={() => handleAnchorClick('profile-overview', 'info-card')} className="w-full text-left pl-14 pr-3 py-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">• Info Card Details</button></li>
                                    <li><button onClick={() => handleAnchorClick('profile-overview', 'account-settings')} className="w-full text-left pl-14 pr-3 py-1 text-xs text-slate-400 hover:text-slate-700 transition-colors gap-1">• Account Settings</button></li>
                                    
                                    <li><button onClick={() => setActiveSection('profile-auth')} className={getNavLinkClass('profile-auth', true)}>Telegram Auth Flow</button></li>
                                    <li><button onClick={() => setActiveSection('profile-roles')} className={getNavLinkClass('profile-roles', true)}>Role Switching</button></li>
                                </ul>
                            </div>

                            {/* Dropdown: Organizer Tools */}
                            <div>
                                <button onClick={() => toggleMenu('organizer')} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Settings size={18} /> Organizer Tools
                                    </div>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${expandedMenus.organizer ? 'rotate-0' : '-rotate-90'}`} />
                                </button>
                                <ul className={`mt-1 mb-2 space-y-1 relative ${expandedMenus.organizer ? 'block' : 'hidden'}`}>
                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200"></div>
                                    <li><button onClick={() => setActiveSection('org-create')} className={getNavLinkClass('org-create', true)}>Creating Events</button></li>
                                    <li><button onClick={() => setActiveSection('org-manage')} className={getNavLinkClass('org-manage', true)}>Managing Rosters</button></li>
                                </ul>
                            </div>

                             <button onClick={() => setActiveSection('browse')} className={getNavLinkClass('browse')}>
                                <Globe size={18} /> Browse & RSVP API
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Dynamic Viewport Window */}
                <main className="flex-1 overflow-y-auto bg-white relative">
                    <div className="max-w-4xl mx-auto px-8 py-12 prose">
                        {activeSection === 'overview' && <OverviewSection />}
                        {activeSection === 'architecture' && <ArchitectureSection />}
                        {activeSection === 'profile-overview' && <ProfileSection subsection="overview" />}
                        {activeSection === 'profile-auth' && <ProfileSection subsection="auth" />}
                        {activeSection === 'profile-roles' && <ProfileSection subsection="roles" />}
                        {activeSection === 'org-create' && <OrganizerSection subsection="create" />}
                        {activeSection === 'org-manage' && <OrganizerSection subsection="manage" />}
                        {activeSection === 'browse' && <BrowseSection />}
                    </div>
                </main>
            </div>
        </div>
    );
}