const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü: Üyeleri Yasakla yetkisi gerekir
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Bu komutu kullanabilmek için `Üyeleri Yasakla` yetkisine sahip olmalısın!");
    }

    let userId = args[0];
    let reason = args.slice(1).join(' ');

    if (!userId) return message.reply('❌ Banı kaldırılacak kişinin **ID** numarasını yazmalısın.');
    if (!reason) return message.reply('❌ Ban kaldırma sebebini belirtmelisin.');

    try {
        // Kullanıcının banlı olup olmadığını kontrol et ve banı kaldır
        const bans = await message.guild.bans.fetch();
        if (!bans.has(userId)) {
            return message.reply("⚠️ Bu kullanıcı zaten banlı değil veya yanlış ID girdin.");
        }

        await message.guild.bans.remove(userId, reason);

        // Kullanıcıyı ID'den fetch edelim (Embed'de ismi düzgün görünsün diye)
        const user = await client.users.fetch(userId);

        const unbanEmbed = new EmbedBuilder()
            .setColor("#00AE86")
            .setTitle("🔓 Ban Kaldırıldı")
            .addFields(
                { name: '👤 Kullanıcı:', value: `${user.tag} (${user.id})`, inline: true },
                { name: '👮 Yetkili:', value: `${message.author.tag}`, inline: true },
                { name: '📝 Sebep:', value: `\`${reason}\``, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'LND Bot | Adalet Sistemi' });

        return message.channel.send({ embeds: [unbanEmbed] });

    } catch (err) {
        console.error(err);
        return message.reply("❌ Ban kaldırılırken bir hata oluştu. ID'yi kontrol et veya botun yetkisini kontrol et.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['ban-kaldır', 'yasağı-kaldır'],
    permLevel: 2 // Üyeleri Yasakla yetkisi seviyesi
};

exports.help = {
    name: 'unban',
    kategori: 'yetkili',
    description: 'İstediğiniz kişinin banını ID kullanarak kaldırır.',
    usage: 'unban [ID] [sebep]'
};