import type { ReactNode } from 'react';
import { LayoutGrid, ChefHat, UserCircle, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface LayoutProps {
    children: ReactNode;
    activeTab: 'home' | 'pantry' | 'planner' | 'profile';
    onTabChange: (tab: 'home' | 'pantry' | 'planner' | 'profile') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center z-50 safe-area-bottom">
                <NavButton
                    active={activeTab === 'home'}
                    onClick={() => onTabChange('home')}
                    icon={<Home size={24} />}
                    label="Home"
                />
                <NavButton
                    active={activeTab === 'pantry'}
                    onClick={() => onTabChange('pantry')}
                    icon={<LayoutGrid size={24} />}
                    label="Dispensa"
                />
                <NavButton
                    active={activeTab === 'planner'}
                    onClick={() => onTabChange('planner')}
                    icon={<ChefHat size={24} />}
                    label="Piano"
                    isMain
                />
                <NavButton
                    active={activeTab === 'profile'}
                    onClick={() => onTabChange('profile')}
                    icon={<UserCircle size={24} />}
                    label="Profilo"
                />
            </nav>
        </div>
    );
}

function NavButton({ active, onClick, icon, label, isMain }: { active: boolean, onClick: () => void, icon: ReactNode, label: string, isMain?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex flex-col items-center gap-1 transition-colors relative",
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600",
                isMain && "-mt-8"
            )}
        >
            <div className={clsx(
                "p-2 rounded-2xl transition-all",
                isMain ? (active ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" : "bg-black text-white shadow-lg") : ""
            )}>
                {icon}
            </div>
            <span className={clsx("text-[10px] font-medium", isMain && "mt-1")}>{label}</span>
        </button>
    )
}
