import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PantryItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface InventoryContextType {
    items: PantryItem[];
    addItem: (item: PantryItem) => void;
    removeItem: (id: string) => void;
    updateItem: (id: string, updates: Partial<PantryItem>) => void;
    getCondiments: () => PantryItem[];
    getMainItems: () => PantryItem[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useLocalStorage<PantryItem[]>('sfp_inventory', []);

    const addItem = (item: PantryItem) => {
        setItems((prev) => [...prev, item]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, updates: Partial<PantryItem>) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
    };

    const getCondiments = () => items.filter((i) => i.isCondiment);
    const getMainItems = () => items.filter((i) => !i.isCondiment);

    return (
        <InventoryContext.Provider value={{ items, addItem, removeItem, updateItem, getCondiments, getMainItems }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
