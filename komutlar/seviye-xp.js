const db = require('quick.db');

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply("❌ Yetkin yetersiz!");
    
    let miktar = args[0];
    if (!miktar || isNaN(miktar)) return message.reply('❌ Bir XP miktarı belirtmelisin!');
    if (miktar > 800) return message.reply('⚠️ XP değeri güvenlik nedeniyle 800\'den fazla olamaz.');

    db.set(`verilecekxp_${message.guild.id}`, miktar);
    return message.channel.send(`✅ Mesaj başına verilecek XP: **${miktar}** olarak ayarlandı.`);
};

exports.conf = { enabled: true, guildOnly: true, aliases: [], permLevel: 3 };
exports.help = { name: 'seviye-xp', kategori: 'yetkili' };