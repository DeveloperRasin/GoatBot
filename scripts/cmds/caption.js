const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "caption",
        version: "1.0.0",
        author: "🙂🙂",
        countDown: 11,
        role: 0,
        shortDescription: {
            en: "Send random Islamic caption with image"
        },
        longDescription: {
            en: "Send a random Islamic caption with a random image"
        },
        category: "Islamic caption",
        guide: {
            en: "just type the command"
        },
        dependencies: {
            "request": "",
            "fs-extra": "",
            "axios": ""
        }
    },
    langs: {
        en: {
            randomCaption: [
                "•—»✨「ɪsʟᴀᴍɪᴄ ᴄᴀᴘᴛɪᴏɴ」✨«—•\n༆-✿༊\n\n᭄࿐-ইচ্ছে!!!গুলো!!!যদি!!!পবিত্র!!হয়!✿᭄\n\n✿᭄তাহলে!!!স্বপ্ন!!! গুলো..🖤🥀\n\n✿᭄ ࿐- একদিন!!!পূরণ!!!হবেই!!! ✿᭄\n\n✿᭄࿐ইনশাআল্লাহ..🖤🥀\n\n𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝐓𝐚𝐬𝐛𝐢𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 𝐑𝐚𝐬𝐢𝐧",
                " •—»✨「ɪsʟᴀᴍɪᴄ ᴄᴀᴘᴛɪᴏɴ」✨«—•\n ༆-✿ ༊࿐ \n\n_____✵♡︎\n\n___কি  হবে  এত  মানুষের প্রিয় হয়ে__🦋🌻\n\n__যদি আল্লাহ   প্রিয় না হতে পারি__🙂🦋\n\n_____✵♡︎\n\n𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝐓𝐚𝐬𝐛𝐢𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 𝐑𝐚𝐬𝐢𝐧",
                "___•—»✨「ɪsʟᴀᴍɪᴄ ᴄᴀᴘᴛɪᴏɴ」  ✨«—•\n ༆-✿༊\n\n┏╮/╱╰️❥☆••\n╱/╰┛🍁࿐চিরস্থায়ী কি \n\n༄আপনার সুন্দর ব্যবহার!!🍁!!\n\n🍁যেটা মৃত্যুর পরও সবার সৃতিতে থাকবে🥰ཻღ\n\n\n𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝐓𝐚𝐬𝐛𝐢𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 𝐑𝐚𝐬𝐢𝐧",
                // Add more captions here...
            ],
            randomImageLinks: [
                "https://i.postimg.cc/ZR0SLZyy/received-104854222681538.jpg",
                "https://i.postimg.cc/CM3RdrW4/received-1077131053254543.jpg",
                "https://i.postimg.cc/mhWWRHpQ/received-1202913210365646.jpg",
                "https://i.postimg.cc/yxZCwPj1/received-179416495132916.jpg",
                "https://i.postimg.cc/8kJFpgn5/received-201956602842877.jpg",
                "https://i.postimg.cc/8c2N53cf/received-2183981171798286.jpg",
                "https://i.postimg.cc/6QWwyCWc/received-259795433354586.jpg",
                "https://i.postimg.cc/JzWRC9S9/received-317063074088232.jpg",
                "https://i.postimg.cc/5tsJvjjV/received-583147497311518.jpg",
                "https://i.postimg.cc/7ZMwHKkb/received-598373762409967.jpg",
                "https://i.postimg.cc/wTD7NczY/received-649778976784401.jpg",
                "https://i.postimg.cc/DZDKjDqp/received-659497149400143.jpg",
                "https://i.postimg.cc/WpC2XD8p/received-659559285696847.jpg",
                "https://i.postimg.cc/4NcXMJ26/received-819496329472643.jpg"
                // Add more image links here...
            ]
        }
    },
    onStart: async function ({ api, message, event, getLang }) {
        const captions = getLang("randomCaption");
        const images = getLang("randomImageLinks");
        const randomCaption = captions[Math.floor(Math.random() * captions.length)];
        const randomImageLink = images[Math.floor(Math.random() * images.length)];
        const callback = () => api.sendMessage({ body: ` ${randomCaption} `, attachment: fs.createReadStream(__dirname + "/cache55.jpg") }, event.threadID, () => fs.unlinkSync(__dirname + "/cache55.jpg"));
        request(encodeURI(randomImageLink)).pipe(fs.createWriteStream(__dirname + "/cache55.jpg")).on("close", () => callback());
    }
};