class InMemoryStore {
    constructor() {
        this.items = [];
        this.selected = [];
    }

    init(count) {
        this.items = Array.from({ length: count }, (_, i) => ({ id: i + 1 }));
        this.selected = [];
    }

    getState() {
        return {
            selectedIds: this.selected.map(item => item.id),
            selectedOrder: this.selected.map(item => item.id)
        };
    }

    setState(state) {
        if (!state || !Array.isArray(state.selectedIds)) return;

        // Return all currently selected items back into the pool before applying the new state
        this.selected.forEach(item => {
            const exists = this.items.some(existing => existing.id === item.id);
            if (!exists) {
                const insertAt = this.items.findIndex(existing => existing.id > item.id);
                if (insertAt === -1) {
                    this.items.push(item);
                } else {
                    this.items.splice(insertAt, 0, item);
                }
            }
        });

        this.selected = [];

        const uniqueSelectedIds = [...new Set(state.selectedIds)];
        uniqueSelectedIds.forEach(id => {
            const idx = this.items.findIndex(item => item.id === id);
            if (idx !== -1) {
                const [item] = this.items.splice(idx, 1);
                this.selected.push(item);
            }
        });

        if (Array.isArray(state.selectedOrder) && state.selectedOrder.length) {
            const orderSet = new Set();
            const orderedSelected = [];

            state.selectedOrder.forEach(id => {
                const idx = this.selected.findIndex(item => item.id === id);
                if (idx !== -1 && !orderSet.has(id)) {
                    orderedSelected.push(this.selected[idx]);
                    orderSet.add(id);
                }
            });

            this.selected.forEach(item => {
                if (!orderSet.has(item.id)) {
                    orderedSelected.push(item);
                }
            });

            this.selected = orderedSelected;
        }
    }

    getAll() {
        return this.items;
    }

    add(item) {
        const exists = this.items.find(i => i.id === item.id) || this.selected.find(i => i.id === item.id);
        if (!exists) {
            const toInsert = { id: item.id };
            const insertAt = this.items.findIndex(existing => existing.id > toInsert.id);
            if (insertAt === -1) {
                this.items.push(toInsert);
            } else {
                this.items.splice(insertAt, 0, toInsert);
            }
        }
    }

    toggleSelected(ids) {
        ids.forEach(id => {
            const idxSelected = this.selected.findIndex(i => i.id === id);
            if (idxSelected !== -1) {
                const [it] = this.selected.splice(idxSelected, 1);
                const insertAt = this.items.findIndex(existing => existing.id > it.id);
                if (insertAt === -1) {
                    this.items.push(it);
                } else {
                    this.items.splice(insertAt, 0, it);
                }
                return;
            }

            const idxItems = this.items.findIndex(i => i.id === id);
            if (idxItems !== -1) {
                const [it] = this.items.splice(idxItems, 1);
                this.selected.push(it);
            }
        });

    }

    removeByIds(ids) {
        this.items = this.items.filter(item => !ids.includes(item.id));
    }
}

module.exports = new InMemoryStore();
