require('dotenv').config();
const { getHint } = require('./src/services/hintEngine');
const mongoose = require('mongoose');
const Assignment = require('./src/models/Assignment');

async function testHint() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected DB');
    const assignment = await Assignment.findOne();
    console.log('Got assignment:', assignment.title);

    try {
        const hint = await getHint(assignment, "SELECT *", 0);
        console.log('HINT OUTPUT:', hint);
    } catch (err) {
        console.error('HINT ERROR:', err);
    }
    process.exit(0);
}

testHint();
