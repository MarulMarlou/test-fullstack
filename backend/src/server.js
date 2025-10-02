const express = require('express');
const cors = require('cors');
const itemsRouter = require('./controllers/itemsController');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', itemsRouter);

const PORT = process.env.PORT || 4000;
console.log('InMemoryStore initial items:', require('./utils/inMemoryStore').items.length);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});