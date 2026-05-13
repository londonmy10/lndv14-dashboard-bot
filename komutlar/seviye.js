const { EmbedBuilder } = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args) => {
    if (!db.fetch(`seviyeacik_${message.guild.id}`)) return message.reply('❌ Seviye sistemi aktif değil!');

    let user = message.mentions.users.first() || message.author;
    let xp = db.fetch(`xp_${user.id}_${message.guild.id}`) || 0;
    let lvl = db.fetch(`lvl_${user.id}_${message.guild.id}`) || 0;

    const embed = new EmbedBuilder()
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setTitle('📊 Seviye Bilgisi')
        .addFields(
            { name: '👤 Kullanıcı:', value: `${user}`, inline: true },
            { name: '⭐ Seviye:', value: `**${lvl}**`, inline: true },
            { name: '✨ Toplam XP:', value: `**${xp}**`, inline: true }
        )
        .setColor('Random')
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: true, aliases: ['rank', 'level'], permLevel: 0 };
exports.help = { name: 'seviye', kategori: 'genel' };