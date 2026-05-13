const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.channel.send(`🔥 **Yetersiz Yetki!** Bu komutu kullanmak için \`Sunucuyu Yönet\` yetkisine sahip olmalısın.`);
    }

    let capslock = await db.get(`capslock_${message.guild.id}`);

    if (capslock) {
        // Sistem Açıksa Kapat
        db.delete(`capslock_${message.guild.id}`);
        const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`🔥 **Capslock engelleme sistemi kapatıldı!** artık büyük harf kullanımı serbest.`);
        
        return message.channel.send({ embeds: [embed] });
    } else {
        // Sistem Kapalıysa Aç
        db.set(`capslock_${message.guild.id}`, 'acik');
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`🔥 **Capslock engelleme sistemi aktif edildi!** Artık büyük harf kullanımı engellenecek.`);
        
        return message.channel.send({ embeds: [embed] });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['capslock', 'caps-engel'],
    permLevel: 3 // bot.js içindeki elevation yapısına uygun (Administrator/ManageGuild)
};

exports.help = {
    name: 'capslock-engelleme',
    kategori: 'yetkili', // bot.js yükleyicisiyle uyumlu
    description: 'Büyük harf kullanımını sunucuda engeller.',
    usage: 'capslock-engelleme'
};