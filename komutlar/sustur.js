const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports.run = async (client, message, args) => {
    // Yetki Kontrolü: Üyeleri At (Kick) yetkisi olanlar kullanabilsin
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply("❌ Bu komutu kullanmak için `Üyeleri At` yetkisine sahip olmalısın.");
    }

    const mod = message.author;
    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!user) return message.reply("❌ Susturulacak kullanıcıyı bulamıyorum. Lütfen etiketleyin veya ID girin.");

    // Muted rolünü bul veya oluştur
    let muterole = message.guild.roles.cache.find(role => role.name === "Muted");

    if (!muterole) {
        try {
            muterole = await message.guild.roles.create({
                name: "Muted",
                color: "#000000",
                reason: "Susturma sistemi için gerekli rol oluşturuldu.",
                permissions: []
            });

            // Tüm kanallarda susturma rolünün yetkilerini ayarla
            message.guild.channels.cache.forEach(async (channel) => {
                // Sadece metin ve ses kanallarında işlem yap
                if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
                    await channel.permissionOverwrites.create(muterole, {
                        SendMessages: false,
                        AddReactions: false,
                        Speak: false,
                        Connect: false
                    });
                }
            });
        } catch (e) {
            console.error("Rol oluşturma hatası:", e);
            return message.reply("❌ 'Muted' rolü oluşturulurken bir hata oluştu.");
        }
    }

    // Rolü kullanıcıya ver
    try {
        await user.roles.add(muterole.id);

        const muteembed = new EmbedBuilder()
            .setAuthor({ name: 'Eylem: Susturma', iconURL: client.user.displayAvatarURL() })
            .setColor('Random')
            .addFields(
                { name: '👤 Kullanıcı', value: `<@${user.id}>`, inline: true },
                { name: '👮 Yetkili', value: `${mod}`, inline: true }
            )
            .setFooter({ text: 'Legends Never Die Sustur Sistemi' })
            .setTimestamp();

        message.channel.send({ embeds: [muteembed] }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        });

    } catch (err) {
        console.error(err);
        return message.reply("❌ Kullanıcıya rol verilirken bir hata oluştu. Botun yetkisinin 'Muted' rolünden üstte olduğundan emin olun.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["mute"],
    permLevel: 2
};

module.exports.help = {
    name: "sustur",
    kategori: 'yetkili',
    description: "Etiketlenen kişiye Muted rolü vererek susturur.",
    usage: "sustur [kullanıcı]"
};