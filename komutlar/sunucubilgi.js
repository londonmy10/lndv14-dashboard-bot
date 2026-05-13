const { EmbedBuilder, ChannelType } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

exports.run = async (client, message, args) => {
    // DM Kontrolü
    if (message.channel.type === ChannelType.DM) {
        const ozelmesajuyari = new EmbedBuilder()
            .setColor("Red")
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setDescription('⚠️ `sunucubilgi` adlı komutu özel mesajlarda kullanamazsın.');
        return message.author.send({ embeds: [ozelmesajuyari] });
    }

    // Sunucu Sahibini ve Diğer Bilgileri Çekme
    const owner = await message.guild.fetchOwner();
    const kanallar = message.guild.channels.cache;
    const roller = message.guild.roles.cache;
    const kurulus = moment(message.guild.createdAt).format('DD MMMM YYYY HH:mm:ss');

    const sunucubilgi = new EmbedBuilder()
        .setColor("#D97634")
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields(
            { name: '❯ Sunucu İsmi', value: `${message.guild.name}`, inline: true },
            { name: '❯ Sunucu ID', value: `\`${message.guild.id}\``, inline: true },
            { name: '❯ Sunucu Sahibi', value: `${owner.user.tag}`, inline: true },
            { name: '❯ Üye Sayısı', value: `${message.guild.memberCount}`, inline: true },
            { name: '❯ Kanal Sayısı', value: `${kanallar.size}`, inline: true },
            { name: '❯ Rol Sayısı', value: `${roller.size}`, inline: true },
            { name: '❯ Oluşturulma Tarihi', value: `${kurulus}`, inline: false },
            { name: '❯ Sunucu Logosu', value: `[Tıkla ve Gör](${message.guild.iconURL({ dynamic: true, size: 2048 })})`, inline: false }
        )
        .setFooter({ text: `Sorgulayan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [sunucubilgi] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['sunucu', 'sbilgi', 'server-info'],
    permLevel: 0
};

exports.help = {
    name: 'sunucubilgi',
    kategori: 'genel',
    description: 'Sunucu hakkında detaylı bilgi verir.',
    usage: 'sunucubilgi'
};