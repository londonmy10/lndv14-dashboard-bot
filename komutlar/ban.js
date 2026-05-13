const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    
    // 1. Ban yetkisi kontrolü (Kritik: Bunu ellememek lazım reis)
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkin olmalı!");
    }

    let user = message.mentions.users.first();
    let reason = args.slice(1).join(' ') || "Sebep belirtilmedi.";

    if (!user) return message.reply('❌ Kimi banlayacağını etiketlemelisin.');

    const member = message.guild.members.cache.get(user.id);
    
    // Yetki kontrolü: Botun kendi yetkisi yetiyor mu?
    if (member && !member.bannable) return message.reply('❌ Bu kullanıcıyı banlamaya yetkim yetmiyor reis.');

    try {
        await message.guild.members.ban(user.id, { reason: reason });
        
        const embed = new EmbedBuilder()
            .setColor("#D97634")
            .setTitle('🔨 Kullanıcı Yasaklandı')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Kullanıcı:', value: `\`${user.tag}\``, inline: true },
                { name: 'Yetkili:', value: `\`${message.author.tag}\``, inline: true },
                { name: 'Sebep:', value: `\`${reason}\`` }
            )
            .setFooter({ text: 'Legends Never Die - Ban Sistemi', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    } catch (err) {
        return message.reply(`❌ İşlem sırasında bir gıcıklık çıktı: ${err.message}`);
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['yasakla', 'infaz'],
    permLevel: 0
};

exports.help = {
    name: 'ban',
    kategori: 'yetkili',
    description: 'Kullanıcıyı sunucudan mermi gibi uzaklaştırır.',
    usage: 'ban @etiket [sebep]'
};