require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Wait, listModels might not exist or be exposed, but we can try 
        // using the REST API directly or just fetch models.

        // Actually the easiest is to just fetch the REST API using fetch.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
    } catch (e) {
        console.log(e);
    }
}
checkModels();
