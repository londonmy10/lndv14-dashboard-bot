const { PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');
db.fetch = db.get;

exports.run = async (client, message, args) => {
    // v14 Yetki Kontrolü
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("❌ Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın.");
    }

    // Sistemin açık olup olmadığını kontrol et
    let hm = await db.get(`seviyeacik_${message.guild.id}`);
    if (!hm) {
        return message.channel.send('⚠️ Seviye sistemi zaten bu sunucuda aktif değil!');
    }

    // Seviye sistemiyle ilgili tüm verileri siliyoruz
    db.delete(`seviyeacik_${message.guild.id}`);
    db.delete(`svlog_${message.guild.id}`);
    db.delete(`verilecekxp_${message.guild.id}`);
    db.delete(`svrol_${message.guild.id}`);
    db.delete(`rollevel_${message.guild.id}`);

    return message.reply('✅ **Seviye sistemi** ve tüm bağlı ayarlar başarıyla sıfırlanarak kapatıldı.');
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['seviyekapat', 'level-kapat'],
    permLevel: 3 // Yönetici seviyesi
};

exports.help = {
    name: 'seviye-kapat',
    kategori: 'yetkili',
    description: 'Sunucudaki seviye sistemini tamamen kapatır.',
    usage: 'seviye-kapat'
};
