const store = require('../utils/inMemoryStore');
const taskQueue = require('../utils/taskQueue');

store.init(1_000_000);

async function getItems({ selected = false, filterId, offset = 0, limit = 20 }) {
    return new Promise((resolve) => {
        const operation = () => {
            const all = selected ? store.selected : store.items;
            let filtered = filterId ? all.filter(item => item.id.toString().includes(filterId)) : all;
            resolve(filtered.slice(offset, offset + limit));
        };
        taskQueue.enqueueUpdate(`get-${Date.now()}-${Math.random()}`, operation);
    });
}

async function addItem(item) {
    taskQueue.enqueueAdd(item.id, item);
}

async function selectItems(ids) {
    return new Promise((resolve) => {
        const operation = () => {
            store.toggleSelected(ids);
            resolve();
        };
        taskQueue.enqueueUpdate(`select-${Date.now()}-${Math.random()}`, operation);
    });
}

async function sortSelected(order = []) {
    return new Promise((resolve) => {
        const operation = () => {
            if (!Array.isArray(order) || order.length === 0) {
                resolve();
                return;
            }
            const seen = new Set();
            const ordered = [];
            order.forEach(id => {
                const item = store.selected.find(i => i.id === id);
                if (item && !seen.has(item.id)) {
                    ordered.push(item);
                    seen.add(item.id);
                }
            });
            if (ordered.length !== store.selected.length) {
                store.selected.forEach(item => {
                    if (!seen.has(item.id)) {
                        ordered.push(item);
                    }
                });
            }
            store.selected = ordered;
            resolve();
        };
        taskQueue.enqueueUpdate(`sort-${Date.now()}`, operation);
    });   
}

module.exports = { getItems, addItem, selectItems, sortSelected };
