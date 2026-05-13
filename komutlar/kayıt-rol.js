const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü: Yönetici veya Rolleri Yönet yetkisi gerekir
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        const yetkiEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Yetki Yetersiz")
            .setDescription("Bu komutu kullanabilmek için `Rolleri Yönet` yetkisine sahip olmalısın!")
            .setTimestamp();
        return message.channel.send({ embeds: [yetkiEmbed] });
    }

    // Rol Etiketleme Kontrolü
    let rol = message.mentions.roles.first();
    if (!rol) {
        return message.reply("❌ Lütfen kayıt olanlara verilecek rolü etiketle! \nÖrnek: `&kayıt-rol @üye` ");
    }

    // Veritabanına Kaydetme (croxydb yapısı)
    db.set(`kayıtrol_${message.guild.id}`, rol.id);

    // Başarı Mesajı
    const basariEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Kayıt Rolü Ayarlandı")
        .setDescription(`Sunucuya kayıt olan kullanıcılara artık ${rol} rolü verilecektir.`)
        .addFields(
            { name: '🎭 Ayarlanan Rol', value: `${rol} (\`${rol.id}\`)`, inline: true },
            { name: '👮 Ayarlayan', value: `${message.author.tag}`, inline: true }
        )
        .setFooter({ text: "Legends Never Die Kayıt Sistemi", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [basariEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['kayitrol', 'kayıt-rolü'],
    permLevel: 3 // Sunucuyu Yönet / Admin seviyesi
};

exports.help = {
    name: 'kayıt-rol',
    kategori: 'yetkili',
    description: 'Kayıt olan kullanıcılara otomatik verilecek rolü ayarlar.',
    usage: 'kayıt-rol <@rol>'
};