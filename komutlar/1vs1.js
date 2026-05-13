const { EmbedBuilder } = require('discord.js');
const { stripIndents } = require('common-tags');
const { randomRange, verify } = require('../util/Util.js');

// Kanal başına oyun kontrolü için Set nesnesini exports dışında tanımlıyoruz
let fighting = new Set();

exports.run = async (client, message, args) => {
    let opponent = message.mentions.users.first();
    
    // Temel Kontroller
    if (!opponent) return message.reply("❌ Oynamak istediğin kişiyi etiketlemelisin!");
    if (opponent.bot) return message.reply('🤖 Botlar ile oynayamazsın!');
    if (opponent.id === message.author.id) return message.reply('👤 Kendin ile düello atamazsın!');
    if (fighting.has(message.channel.id)) return message.reply('⚔️ Kanal başına sadece bir düello meydana gelebilir.');

    fighting.add(message.channel.id);

    try {
        // Düello Teklifi
        await message.channel.send(`${opponent}, düello isteği geldi. Kabul ediyor musun? (\`evet\` veya \`hayır\`)`);
        const verification = await verify(message.channel, opponent);
        
        if (!verification) {
            fighting.delete(message.channel.id);
            return message.channel.send(`📡 Düello kabul edilmedi...`);
        }

        let userHP = 500;
        let oppoHP = 500;
        let userTurn = Math.random() > 0.5; // Rastgele birisi başlasın
        let guard = false;

        const reset = (changeGuard = true) => {
            userTurn = !userTurn;
            if (changeGuard && guard) guard = false;
        };

        const dealDamage = damage => {
            if (userTurn) oppoHP -= damage;
            else userHP -= damage;
        };

        const forfeit = () => {
            if (userTurn) userHP = 0;
            else oppoHP = 0;
        };

        while (userHP > 0 && oppoHP > 0) {
            const user = userTurn ? message.author : opponent;
            let choice;

            // v14 Arayüzü (Embed ile daha şık durur)
            await message.channel.send(stripIndents`
                ⚔️ ${user}, sıra sende! Ne yapmak istersin? 
                \`saldır\`, \`savun\`, \`ultra güç\`, veya \`kaç\`?

                ❤️ **${message.author.username}**: ${userHP} HP
                ❤️ **${opponent.username}**: ${oppoHP} HP
            `);

            const filter = res => res.author.id === user.id && ['saldır', 'savun', 'ultra güç', 'kaç'].includes(res.content.toLowerCase());
            
            // v14 awaitMessages Yapısı
            const turn = await message.channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ['time']
            }).catch(() => null);

            if (!turn || !turn.size) {
                await message.channel.send(`⏱️ Üzgünüm ${user}, süre doldu! Pas geçiyorsun.`);
                reset();
                continue;
            }

            choice = turn.first().content.toLowerCase();

            // Aksiyon Mantığı
            if (choice === 'saldır') {
                const damage = Math.floor(Math.random() * (guard ? 10 : 100)) + 1;
                await message.channel.send(`💥 ${user}, **${damage}** hasar vurdu!`);
                dealDamage(damage);
                reset();
            } else if (choice === 'savun') {
                await message.channel.send(`🛡️ ${user}, kendisini süper kalkan ile savundu!`);
                guard = true;
                reset(false);
            } else if (choice === 'ultra güç') {
                const miss = Math.floor(Math.random() * 4);
                if (!miss) {
                    const damage = randomRange(100, guard ? 150 : 300);
                    await message.channel.send(`🌟 ${user}, ultra sonik enerjiyle **${damage}** hasar vurdu!!`);
                    dealDamage(damage);
                } else {
                    await message.channel.send(`☁️ ${user}, ultra güç için yeterli enerjiyi toplayamadı!`);
                }
                reset();
            } else if (choice === 'kaç') {
                await message.channel.send(`🏃 ${user} korkup kaçtı!`);
                forfeit();
                break;
            }
        }

        fighting.delete(message.channel.id);
        const winner = userHP > oppoHP ? message.author : opponent;
        
        return message.channel.send(`🏆 **Oyun bitti!** \nKazanan: **${winner}** \n\n📊 **Son Durum:**\n${message.author.username}: ${userHP} HP\n${opponent.username}: ${oppoHP} HP`);

    } catch (err) {
        fighting.delete(message.channel.id);
        console.error(err);
        return message.reply("⚠️ Düello sırasında teknik bir hata oluştu.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['1vs1', '1v1', 'savaş'],
    permLevel: 0 // bot.js içindeki elevation yapısına uygun
};

exports.help = {
    name: 'düello',
    kategori: "eğlence", // bot.js yükleyicisiyle uyumlu
    description: 'İstediğiniz bir kişi ile düello atarsınız!',
    usage: 'düello <@kullanıcı>'
};