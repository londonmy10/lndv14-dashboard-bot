const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports.run = async (client, message, args) => {
    // Yetki Kontrolü
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.channel.send("❌ Bu komutu kullanabilmek için `Üyeleri Yasakla` yetkisine sahip olmanız gerek.");
    }

    // ID Kontrolü
    const targetID = args[0];
    if (!targetID) {
        return message.channel.send(`❌ Lütfen yasaklanacak kullanıcının **ID**'sini belirtin!`);
    }

    // Sebep Belirleme
    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    try {
        // v14'te banlı listesini kontrol etme
        const bans = await message.guild.bans.fetch();
        if (bans.has(targetID)) {
            return message.channel.send(`⚠️ Bu kullanıcı zaten yasaklanmış.`);
        }

        // Kullanıcıyı ID üzerinden çek (Bilgi mesajı için)
        const user = await client.users.fetch(targetID).catch(() => null);

        // Yasaklama İşlemi (v14 Formatı)
        await message.guild.members.ban(targetID, { reason: reason });

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("🔨 Forceban İşlemi Başarılı")
            .setDescription(`${user ? `**${user.tag}**` : `\`${targetID}\` ID'li kullanıcı`} sunucudan yasaklandı.`)
            .addFields({ name: "Sebep:", value: `\`${reason}\`` })
            .setTimestamp()
            .setFooter({ text: "LND Bot Moderasyon Sistemi" });

        return message.channel.send({ embeds: [embed] });

    } catch (error) {
        console.error('Forceban Hatası:', error);
        return message.channel.send(`❌ Kullanıcı yasaklanırken bir hata oluştu. (ID yanlış olabilir veya yetkim yetersizdir)`);
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true, // Forceban sadece sunucuda çalışır
    aliases: ['force-ban', 'id-ban', 'yargı'],
    permLevel: 0 // bot.js içindeki elevation kontrolüne bağlı
};

exports.help = {
    name: 'forceban',
    kategori: 'yetkili',
    description: 'ID belirterek kullanıcıyı sunucudan yasaklar.',
    usage: 'forceban <ID> [sebep]'
};