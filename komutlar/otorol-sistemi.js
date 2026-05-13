const { EmbedBuilder } = require('discord.js');

exports.run = function(client, message) {
    // LND Bot görsel bütünlüğü için logo
    const lndResim = "https://cdn.discordapp.com/attachments/659811865341329459/738808800248856747/LegendsNeverDie.png";

    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('🤖 LND Bot | Otorol Sistemi Komutları')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { 
                name: '⚙️ &otorol-ayarla @rol #logKanal', 
                value: 'Sunucuya yeni katılanlara verilecek rolü ve log kanalını ayarlar.', 
                inline: false 
            },
            { 
                name: '❌ &otorol-sıfırla', 
                value: 'Ayarlanmış olan otorol sistemini tamamen kapatır ve verileri siler.', 
                inline: false 
            }
        )
        .setImage(lndResim)
        .setFooter({ 
            text: 'Legends Never Die | Otorol Sistemi', 
            iconURL: client.user.displayAvatarURL() 
        })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['otorol-yardım', 'otorolayarlar'],
    permLevel: 0
};

exports.help = {
    name: 'otorol-sistemi',
    kategori: 'sunucu',
    description: 'Otorol sistemiyle ilgili komutları listeler.',
    usage: 'otorol-sistemi'
};