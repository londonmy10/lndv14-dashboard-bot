const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports.run = async (client, message, args) => {
    // Yetki kontrolü (v14 standartı)
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply("❌ Bu komutu kullanmak için `Üyeleri At` yetkisine sahip olmalısın!");
    }

    const mod = message.author;
    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    
    if (!user) return message.reply("❌ Susturması açılacak kullanıcıyı bulamadım! Lütfen etiketleyin veya ID girin.");

    // "Muted" rolünü sunucuda ara
    let muterole = message.guild.roles.cache.find(role => role.name === "Muted");

    if (!muterole || !user.roles.cache.has(muterole.id)) {
        return message.reply("⚠️ Bu kullanıcı zaten susturulmamış veya 'Muted' rolü sunucuda mevcut değil.");
    }

    // Rolü kullanıcıdan al
    await user.roles.remove(muterole.id).catch(err => {
        return message.channel.send(`❌ Rol geri alınırken bir hata oluştu: ${err.message}`);
    });

    const unmuteEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Eylem: Susturma Kaldırıldı' })
        .addFields(
            { name: 'Kullanıcı', value: `${user}`, inline: true },
            { name: 'Yetkili', value: `${mod}`, inline: true }
        )
        .setColor('Green')
        .setFooter({ text: 'Legends Never Die Sustur Sistemi', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [unmuteEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['unmute', 'susturma-aç'],
    permLevel: 2 // KickMembers yetkisi olanlar için
};

exports.help = {
    name: 'susturaç',
    kategori: 'yetkili',
    description: 'Belirtilen kullanıcının susturmasını kaldırır.',
    usage: 'susturaç @kullanıcı'
};