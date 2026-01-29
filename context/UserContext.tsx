import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, WeeklySchedule } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UserContextType {
    profile: UserProfile | null;
    updateProfile: (profile: UserProfile) => void;
    updateSchedule: (schedule: WeeklySchedule) => void;
    hasOnboarded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [profile, setProfile] = useLocalStorage<UserProfile | null>('sfp_user_profile', null);

    const updateProfile = (newProfile: UserProfile) => {
        setProfile(newProfile);
    };

    const updateSchedule = (schedule: WeeklySchedule) => {
        if (profile) {
            setProfile({ ...profile, schedule });
        }
    };

    const hasOnboarded = !!profile;

    return (
        <UserContext.Provider value={{ profile, updateProfile, updateSchedule, hasOnboarded }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
