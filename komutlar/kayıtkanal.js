const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü: Yönetici veya Kanalları Yönet yetkisi gerekir
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        const yetkiEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Yetki Yetersiz")
            .setDescription("Bu komutu kullanabilmek için `Kanalları Yönet` yetkisine sahip olmalısın!")
            .setTimestamp();
        return message.channel.send({ embeds: [yetkiEmbed] });
    }

    // Kanal Etiketleme Kontrolü
    let kanal = message.mentions.channels.first();
    if (!kanal) {
        return message.reply("❌ Lütfen kayıtların yapılacağı kanalı etiketle! \nÖrnek: `&kayıt-kanal #kanal` ");
    }

    // Veritabanına Kaydetme (croxydb yapısı)
    db.set(`kayitKanal_${message.guild.id}`, kanal.id);

    // Başarı Mesajı
    const basariEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Kayıt Kanalı Ayarlandı")
        .setDescription(`Sunucuya kayıt olma işlemi artık ${kanal} kanalında yapılacaktır.`)
        .addFields(
            { name: '📍 Ayarlanan Kanal', value: `${kanal} (\`${kanal.id}\`)`, inline: true },
            { name: '👮 Ayarlayan Yetkili', value: `${message.author.tag}`, inline: true }
        )
        .setFooter({ text: "Legends Never Die Kayıt Sistemi", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [basariEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['kayitkanal', 'kayıt-kanalı'],
    permLevel: 3 // Sunucuyu Yönet / Admin seviyesi
};

exports.help = {
    name: 'kayıt-kanal',
    kategori: 'yetkili',
    description: 'Kayıt işleminin yapılacağı kanalı ayarlar.',
    usage: 'kayıt-kanal <#kanal>'
};