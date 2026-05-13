const { EmbedBuilder } = require('discord.js');

exports.run = function(client, message) {
    const lndResim = "https://cdn.discordapp.com/attachments/659811865341329459/738808800248856747/LegendsNeverDie.png";

    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('⚖️ LND Bot | Jail Sistemi Komutları')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: '🔗 &jail @üye [sebep]', value: 'Belirtilen kullanıcıyı jaile (hapse) atar.', inline: false },
            { name: '📂 &jail-kanal ayarla #kanal', value: 'Jail loglarının tutulacağı kanalı belirler.', inline: false },
            { name: '🎭 &jail-rol ayarla @rol', value: 'Cezalı kullanıcıya verilecek rolü belirler.', inline: false },
            { name: '👮 &jail-yetkilisi ayarla @rol', value: 'Jail komutunu kullanabilecek yetkili rolü belirler.', inline: false }
        )
        .setImage(lndResim) // LND Logosu
        .setFooter({ text: 'Legends Never Die | Jail Sistemi', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['jail-yardım', 'jailsistemi'],
    permLevel: 0
};

exports.help = {
    name: 'jail-sistemi',
    kategori: 'sunucu',
    description: 'Jail sistemiyle ilgili tüm ayar ve kullanım komutlarını gösterir.',
    usage: 'jail-sistemi'
};