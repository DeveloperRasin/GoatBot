const axios = require('axios');

module.exports = {
    config: {
        name: "gf",
        version: "1.0.0",
        author: "Rasin",
        countDown: 5,
        role: 0,
        description: {
            en: "Give gf"
        },
        category: "Fun",
        guide: {
            en: "{n}"
        }
    },

    onStart: async function (){},

    onChat: async function ({ api, event, message }) {
        const input = event.body;
        if (input && (
                input.trim().toLowerCase().includes('gf de') || 
                input.trim().toLowerCase().includes('bot gf de') || 
                input.trim().toLowerCase().includes('need gf')
            )) {
            try {
               
                api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

                // Fetching data from API
                const response = await axios.get('https://gf-tasbiul.onrender.com/gf');
                
                
                if (response.data && response.data.message) {
                    const resMessage = response.data.message;

                    
                    api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                    
                    
                    await message.reply({ body: resMessage });
                } else {
                    throw new Error('Invalid response format from API');
                }

            } catch (error) {
                
                console.error('Error fetching data:', error.message, error.response?.data || '');
                message.reply('Error fetching data. Please try again later.');
            }
        }
    }
};
