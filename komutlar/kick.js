const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

exports.run = async (client, message, args) => {
    // Özel Mesaj Kontrolü
    if (!message.guild) {
        const ozelmesajuyari = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTimestamp()
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .addFields({ name: '⚠️ Uyarı', value: '`kick` adlı komutu özel mesajlarda kullanamazsın.' });
        return message.author.send({ embeds: [ozelmesajuyari] }).catch(() => {});
    }

    // Yetki Kontrolü (Kick yetkisi olmayan kullanamaz)
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply("❌ Bu komutu kullanmak için `Üyeleri At` yetkisine sahip olmalısın.");
    }

    let user = message.mentions.users.first() || client.users.cache.get(args[0]);
    let reason = args.slice(1).join(' ');

    if (!user) return message.reply('❌ Kimi sunucudan atacağını belirtmelisin (Etiket veya ID).');
    if (!reason) return message.reply('❌ Sunucudan atma sebebini yazmalısın.');

    // Üyeyi sunucudan çekiyoruz
    const member = message.guild.members.cache.get(user.id);

    if (!member) return message.reply('❌ Bu kullanıcı sunucuda bulunamadı.');
    if (!member.kickable) return message.reply('❌ Yetkilileri veya benden üstte olanları sunucudan atamam.');

    // Atma İşlemi
    await member.kick(reason).catch(err => {
        return message.reply(`❌ Kullanıcı atılamadı. Hata: ${err}`);
    });

    // Bilgilendirme Embed
    const embed = new EmbedBuilder()
        .setColor(0xD97634)
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setTitle('🔨 Üye Sunucudan Atıldı')
        .addFields(
            { name: '👤 Kullanıcı:', value: `${user.tag} (${user.id})`, inline: true },
            { name: '👮 Yetkili:', value: `${message.author.tag}`, inline: true },
            { name: '📝 Sebep:', value: `\`${reason}\``, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'LND Moderasyon Sistemi' });

    // Kanala mesaj gönder (Log kanalı ayarlıysa oraya, değilse mevcut kanala)
    // Not: Eski kodundaki 'kick' değişkeni log kanal ID'si ise burayı ona göre güncelleyebilirsin.
    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['at', 'kov'],
    permLevel: 2 // bot.js içindeki yetki seviyelerine göre
};

exports.help = {
    name: 'kick',
    kategori: 'yetkili',
    description: 'İstediğiniz kişiyi sunucudan atar.',
    usage: 'kick [etiket/ID] [sebep]'
};