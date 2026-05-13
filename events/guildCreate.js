const { EmbedBuilder, ActivityType } = require('discord.js');
const ayarlar = require('../ayarlar.json');

module.exports = async (guild) => {
    const prefix = ayarlar.prefix;

    // Giriş mesajı içeriği
    const girisMesajContent = [
        '**Bot Sunucuya Eklendi**',
        '**LND Bot** sunucunuzdaki insanlara kolaylıklar sağlar.',
        'Botun Her Türlü Komutu Vardır'
    ].join('\n');

    // Botun mesaj gönderebileceği ilk kanalı bulma (v14'te defaultChannel kalktı)
    const channel = guild.channels.cache
        .filter(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'))
        .first();

    if (channel) {
        await channel.send(girisMesajContent);
    }

    // Botun durumunu (Aktivite) güncelleme
    // v14'te guilds.cache.size ve members.cache.reduce kullanılır
    const sunucuSayisi = guild.client.guilds.cache.size;
    const kullaniciSayisi = guild.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString();

    guild.client.user.setPresence({
        activities: [{ 
            name: `${prefix}yardım | ${sunucuSayisi} sunucu | ${kullaniciSayisi} kullanıcı`, 
            type: ActivityType.Playing 
        }],
        status: 'online',
    });

    console.log(`[Sunucuya Katıldı] ${guild.name} sunucusuna eklendim!`);
};