import { create } from 'zustand';
import { CustomColumn } from '@/lib/columns/types';
import { loadColumns, addColumn, updateColumn, deleteColumn, toggleColumn, saveColumns } from '@/lib/columns/storage';
import { PRESET_COLUMNS } from '@/lib/columns/presets';

interface ColumnsState {
    columns: CustomColumn[];
    columnsLoaded: boolean;
    loadColumns: () => Promise<void>;
    handleAddColumn: (column: CustomColumn) => Promise<void>;
    handleUpdateColumn: (column: CustomColumn) => Promise<void>;
    handleDeleteColumn: (id: string) => Promise<void>;
    handleToggleColumn: (id: string) => Promise<void>;
    handleColumnReorder: (draggedId: string, targetId: string) => Promise<void>;
}

export const useColumnsStore = create<ColumnsState>((set, get) => ({
    columns: PRESET_COLUMNS,
    columnsLoaded: false,

    loadColumns: async () => {
        const columns = await loadColumns();
        set({ columns, columnsLoaded: true });
    },

    handleAddColumn: async (column: CustomColumn) => {
        const newColumns = await addColumn(column);
        set({ columns: newColumns });
    },

    handleUpdateColumn: async (column: CustomColumn) => {
        const newColumns = await updateColumn(column.id, column);
        set({ columns: newColumns });
    },

    handleDeleteColumn: async (id: string) => {
        const newColumns = await deleteColumn(id);
        set({ columns: newColumns });
    },

    handleToggleColumn: async (id: string) => {
        const newColumns = await toggleColumn(id);
        set({ columns: newColumns });
    },

    handleColumnReorder: async (draggedId: string, targetId: string) => {
        if (draggedId === targetId) return;

        const columns = get().columns;
        const draggedIndex = columns.findIndex(c => c.id === draggedId);
        const targetIndex = columns.findIndex(c => c.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newColumns = [...columns];
        const [draggedItem] = newColumns.splice(draggedIndex, 1);
        newColumns.splice(targetIndex, 0, draggedItem);

        set({ columns: newColumns });
        await saveColumns(newColumns);
    },
}));

// Initialize columns on store creation
useColumnsStore.getState().loadColumns();
