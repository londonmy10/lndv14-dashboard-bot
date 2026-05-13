const { ChannelType } = require("discord.js");

module.exports.run = async (client, message, args) => {
    // Sahip Kontrolü (Senin ID'n)
    if (message.author.id !== "351695051962843136") return;

    // Sunucuyu ID üzerinden çek (v14 cache yapısı)
    let sv = client.guilds.cache.get(args[0]);
    if (!sv) return message.channel.send(`❌ Belirttiğin ID'ye sahip bir sunucu bulamadım.`);

    // Sunucudaki rastgele bir metin kanalını bul
    const channel = sv.channels.cache.filter(c => c.type === ChannelType.GuildText).random();

    if (!channel) {
        return message.channel.send("❌ Davet oluşturmak için uygun bir metin kanalı bulunamadı.");
    }

    try {
        // Davet oluştur ve kullanıcıya DM gönder
        const invite = await channel.createInvite({
            maxAge: 0, // Süresiz
            maxUses: 0 // Sınırsız kullanım
        });

        await message.author.send(`🔗 **${sv.name}** sunucusunun davet linki: ${invite.url}`);
        return message.channel.send("✅ Davet linki DM kutuna gönderildi.");

    } catch (err) {
        console.error("Davet oluşturma hatası:", err);
        return message.channel.send("❌ Davet oluşturulurken bir hata oluştu (Yetkim olmayabilir).");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['sunucu-davet', 'davet-oluştur'],
    permLevel: 4 // bot.js içindeki elevation yapısına uygun (Yapımcı)
};

exports.help = {
    name: 'invites',
    kategori: 'yapımcı',
    description: 'ID girilen sunucudan davet linki oluşturur.',
    usage: 'invites <ID>'
};