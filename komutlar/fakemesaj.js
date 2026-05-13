const { WebhookClient } = require('discord.js');

exports.run = async (client, message, args) => {
    // Etiketlenen kullanıcı kontrolü
    let user = message.mentions.users.first();
    if (!user) return message.reply('❌ Lütfen mesajını taklit etmek istediğin birisini etiketle!');

    // Yazı kontrolü
    let yazi = args.slice(1).join(' ');
    if (!yazi) return message.reply('❌ Lütfen yazılacak mesajı belirt!');

    // Mesajı sil (Hata almamak için yetki kontrolü veya catch ekledim)
    message.delete().catch(() => {});

    try {
        // v14 Webhook Oluşturma Yapısı
        const webhook = await message.channel.createWebhook({
            name: user.username,
            avatar: user.displayAvatarURL({ dynamic: true, extension: 'png' })
        });

        // WebhookClient ile mesaj gönderimi
        const hook = new WebhookClient({ id: webhook.id, token: webhook.token });
        
        await hook.send({
            content: yazi,
            username: user.username,
            avatarURL: user.displayAvatarURL({ dynamic: true, extension: 'png' })
        });

        // Webhook'u iş bittikten sonra temizle
        await webhook.delete().catch(() => {});

    } catch (err) {
        console.error("Fakemesaj Hatası:", err);
        return message.channel.send("❌ Webhook oluşturulamadı! Botun `Webhookları Yönet` yetkisi olduğundan emin olun.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true, // Webhooklar sadece sunucularda çalışır
    aliases: ['sahte-mesaj', 'taklit'],
    permLevel: 0
};

exports.help = {
    name: 'fakemesaj',
    kategori: 'genel',
    description: 'Etiketlediğiniz kişiye sahte mesaj attırır.',
    usage: 'fakemesaj @etiket [mesaj]'
};