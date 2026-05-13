const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü: Mesajları Yönet yetkisi gerekir
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply("❌ Bu komutu kullanmak için `Mesajları Yönet` yetkisine sahip olmalısın!");
    }

    // Miktar Kontrolü
    const miktar = parseInt(args[0]);

    if (!miktar || isNaN(miktar)) {
        return message.channel.send("❌ Lütfen silinecek mesaj miktarını sayı olarak yazın! \nÖrnek: `&sil 50` ");
    }

    if (miktar > 100 || miktar < 1) {
        return message.channel.send("❌ Tek seferde en az **1**, en fazla **100** mesaj silebilirsin.");
    }

    // Mesaj Silme İşlemi
    try {
        await message.channel.bulkDelete(miktar, true).then(mesajlar => {
            const basariEmbed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`🚀 **${message.author.username}**, ${mesajlar.size} adet mesaj başarıyla uzaya fırlatıldı!`)
                .setFooter({ text: "LND Bot | Temizlik Sistemi" });

            message.channel.send({ embeds: [basariEmbed] }).then(msg => {
                // 5 saniye sonra onay mesajını siler
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        });
    } catch (err) {
        console.error(err);
        return message.channel.send("❌ Mesajları silerken bir hata oluştu! (Not: 14 günden eski mesajlar Discord API tarafından silinemez.)");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['sil', 'temizle', 'clear'],
    permLevel: 2 // Mesajları Yönet yetkisi seviyesi
};

exports.help = {
    name: 'sil',
    kategori: 'yetkili',
    description: 'Belirlenen miktarda (1-100) mesajı anında siler.',
    usage: 'sil <miktar>'
};