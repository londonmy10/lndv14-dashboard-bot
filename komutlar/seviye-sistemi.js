const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message) => {
    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('📊 Seviye Sistemi Komutları')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: '&seviye', value: 'Mevcut seviyenizi gösterir.' },
            { name: '&seviye-ayarlar', value: 'Sunucudaki seviye ayarlarını gösterir.' },
            { name: '&seviye-aç / &seviye-kapat', value: 'Sistemi aktif eder veya kapatır.' },
            { name: '&seviye-log #kanal', value: 'Level atlama bildirim kanalını ayarlar.' },
            { name: '&seviye-rol @rol <seviye>', value: 'Belirli bir seviyeye ödül rolü ekler.' },
            { name: '&seviye-xp <sayı>', value: 'Mesaj başına gelecek puanı belirler.' }
        )
        .setFooter({ text: 'LND Bot | Seviye Sistemi', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: false, aliases: ['seviye-yardım'], permLevel: 0 };
exports.help = { name: 'seviye-sistemi', kategori: 'sunucu' };