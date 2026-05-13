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
        return message.reply("❌ Lütfen kayıt loglarının gönderileceği kanalı etiketle! \nÖrnek: `&kayıt-log #kanal` ");
    }

    // Veritabanına Kaydetme (croxydb yapısı)
    db.set(`kayıtlog_${message.guild.id}`, kanal.id);

    // Başarı Mesajı (Embed ile daha şık görünür)
    const basariEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Kayıt Log Kanalı Ayarlandı")
        .setDescription(`Sunucuya yeni kayıt olan kullanıcıların bilgileri artık ${kanal} kanalına gönderilecektir.`)
        .addFields({ name: '📂 Ayarlanan Kanal', value: `${kanal} (\`${kanal.id}\`)`, inline: true })
        .addFields({ name: '👮 Ayarlayan Yetkili', value: `${message.author.tag}`, inline: true })
        .setFooter({ text: "Legends Never Die Kayıt Sistemi", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [basariEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true, // Sadece sunucularda çalışsın
    aliases: ['kayitlog', 'kayıt-kanal'],
    permLevel: 3 // Sunucuyu Yönet / Admin seviyesi
};

exports.help = {
    name: 'kayıt-log',
    kategori: 'yetkili',
    description: 'Yeni kayıt olan kullanıcıların logunun gideceği kanalı ayarlar.',
    usage: 'kayıt-log <#kanal>'
};