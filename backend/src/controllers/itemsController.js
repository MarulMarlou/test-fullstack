const express = require('express');
const router = express.Router();
const { getItems, addItem, selectItems } = require('../services/itemsService');

// GET /items?
router.get('/items', async (req, res) => {
    try {
        const { selected, filter, offset, limit } = req.query;
        const items = await getItems({
            selected: selected === 'true',
            filterId: filter,
            offset: Number(offset) || 0,
            limit: Number(limit) || 20
        });
        return res.json(items);
    } catch (err) {
        console.error('Error in GET /items', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /items
router.post('/items', async (req, res) => {
    try {
        const item = req.body;
        await addItem(item);
        return res.status(201).json({ success: true });
    } catch (err) {
        console.error('Error in POST / items:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /select
router.post('/select', async (req, res) => {
    try {
        const { ids } = req.body;
        await selectItems(ids);
        return res.json({ success: true });
    } catch (err) {
        console.error('Error in POST /select:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /sort
router.post('/sort', async (req, res) => {
    try {
        const { order } = req.body;
        await require('../services/itemsService').sortSelected(order);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /state
router.get('/state', async (req, res) => {
    try {
        return new Promise((resolve) => {
            const operation = () => {
                const state = require('../utils/inMemoryStore').getState();
                res.json(state);
                resolve();
            };
            require('../utils/taskQueue').enqueueUpdate(`getState-${Date.now()}`, operation);
        }); 
    } catch (err) {
        console.error('Error in GET /state:', e);
        res.status(500).json({ error: 'Internal Server Error '});
    }
});

// POST /state
router.post('/state', async (req, res) => {
    try {
        return new Promise((resolve) => {
            const operation = () => {
                require('../utils/inMemoryStore').setState(req.body);
                res.json({ success: true });
                resolve();
            }; 
            require('../utils/taskQueue').enqueueUpdate(`setState-${Date.now()}`, operation);
        });  
    } catch (e) {
        console.error('Error in POST /state:', e);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

module.exports = router;