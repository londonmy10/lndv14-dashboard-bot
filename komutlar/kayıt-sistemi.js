const { EmbedBuilder } = require('discord.js');

exports.run = function(client, message) {
    const lndResim = "https://cdn.discordapp.com/attachments/659811865341329459/738808800248856747/LegendsNeverDie.png";

    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('📝 LND Bot | Kayıt Sistemi Komutları')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: '👤 &kayıt', value: 'Mevcut kayıt istatistiklerini ve ayarlarını gösterir.', inline: false },
            { name: '🎭 &kayıt-rol @rol', value: 'Kayıt olan kullanıcılara verilecek rolü belirler.', inline: false },
            { name: '📂 &kayıt-log #kanal', value: 'Kayıt loglarının tutulacağı kanalı belirler.', inline: false },
            { name: '📍 &kayıt-kanal #kanal', value: 'Kayıt işleminin yapılacağı kanalı belirler.', inline: false }
        )
        .setImage(lndResim)
        .setFooter({ text: 'Legends Never Die | Kayıt Sistemi', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['kayit-yardim', 'kayıtyardım'],
    permLevel: 0
};

exports.help = {
    name: 'kayıt-sistemi',
    kategori: 'sunucu',
    description: 'Kayıt sistemiyle ilgili tüm komutları listeler.',
    usage: 'kayıt-sistemi'
};