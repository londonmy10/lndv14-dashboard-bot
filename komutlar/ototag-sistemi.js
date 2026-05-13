const { EmbedBuilder } = require('discord.js');

exports.run = function(client, message) {
    // LND Bot görsel bütünlüğü için logo
    const lndResim = "https://cdn.discordapp.com/attachments/659811865341329459/738808800248856747/LegendsNeverDie.png";

    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('🏷️ LND Bot | Ototag Sistemi Komutları')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { 
                name: '✨ &ototag <tag>', 
                value: 'Sunucuya yeni katılanların başına otomatik eklenecek tagı ayarlar.', 
                inline: false 
            },
            { 
                name: '📂 &ototagkanal #kanal', 
                value: 'Ototag verildiğinde bilgi mesajı gidecek log kanalını ayarlar.', 
                inline: false 
            }
        )
        .setImage(lndResim)
        .setFooter({ 
            text: 'Legends Never Die | Ototag Sistemi', 
            iconURL: client.user.displayAvatarURL() 
        })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['ototag-yardım', 'ototagyardım'],
    permLevel: 0
};

exports.help = {
    name: 'ototag-sistemi',
    kategori: 'sunucu',
    description: 'Ototag sistemiyle ilgili komutları listeler.',
    usage: 'ototag-sistemi'
};