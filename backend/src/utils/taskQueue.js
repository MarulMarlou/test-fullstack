class TaskQueue {
    constructor() {
        this.addQueue = new Map();
        this.processQueue = new Map();
        this.isProcessingAdd = false;
        this.isProcessingUpdate = false;
        this.addTimer = null;
        this.updateTimer = null;
    }

    enqueueAdd(id, item) {
        this.addQueue.set(id.toString(), item);
        this.scheduleAddProcessing();
    }

    enqueueUpdate(key, operation) {
        this.processQueue.set(key, operation);
        this.scheduleUpdateProcessing();
    }

    scheduleAddProcessing() {
        if (this.isProcessingAdd || this.addTimer) return;
        this.addTimer = setTimeout(async () => {
            this.addTimer = null;
            await this.processAddBatch();
            if (this.addQueue.size > 0) {
                this.scheduleAddProcessing();
            }
        }, 0);
    }

    scheduleUpdateProcessing() {
        if (this.isProcessingUpdate || this.updateTimer) return;
        this.updateTimer = setTimeout(async () => {
            this.updateTimer = null;
            await this.processUpdateBatch();
            if (this.processQueue.size > 0) {
                this.scheduleUpdateProcessing();
            }
        }, 0);
    }

    async processAddBatch() {
        if (this.isProcessingAdd || this.addQueue.size === 0) return;
        this.isProcessingAdd = true;
        const batch = new Map(this.addQueue);
        this.addQueue.clear();
        try {
            const store = require('./inMemoryStore');
            batch.forEach((item, id) => {
                store.add(item);
            });
            console.log(`Processed add batch: ${batch.size} items`);
        } catch (e) {
            console.error('Error processing add batch:', e);
        } finally {
            this.isProcessingAdd = false;
        }
    }

    async processUpdateBatch() {
        if (this.isProcessingUpdate || this.processQueue.size === 0) return;
        this.isProcessingUpdate = true;
        const batch = new Map(this.processQueue);
        this.processQueue.clear();
        try {
            const store = require('./inMemoryStore');
            batch.forEach((operation, key) => {
                try {
                    operation();
                } catch (e) {
                    console.error(`Error executing operation ${key}:`, e);
                }
            });
            console.log(`Processed update batch: ${batch.size} operations`);
        } catch (e) {
            console.error('Error processing update batch:', e);
        } finally {
            this.isProcessingUpdate = false;
        }
    }
}

module.exports = new TaskQueue();
