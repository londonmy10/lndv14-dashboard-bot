const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply(`❌ Bu komutu kullanabilmek için **Yönetici** yetkisine sahip olmalısın.`);
    }

    let logk = message.mentions.channels.first();
    let logkanal = db.get(`guvenlik_${message.guild.id}`);
  
    // Sıfırlama / Kapatma İşlemi
    if (args[0] === "sıfırla" || args[0] === "kapat") {
        if (!logkanal) return message.channel.send(`⚠️ Güvenliği kapatmak için zaten bir kanalın seçili olması lazım.`);
        
        db.delete(`guvenlik_${message.guild.id}`);
        const kapatEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`✅ Güvenlik sistemi başarıyla kapatıldı.`);
        
        return message.channel.send({ embeds: [kapatEmbed] });
    }
  
    // Kanal Ayarlama İşlemi
    if (!logk) return message.channel.send('❌ Güvenlik kanalını ayarlamak için bir kanal etiketlemelisin! \nÖrnek: `&güvenlik #kanal`');

    db.set(`guvenlik_${message.guild.id}`, logk.id);

    const ayarEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Güvenlik Sistemi Aktif")
        .setDescription(`Güvenlik kanalı başarıyla ${logk} olarak ayarlandı.\n\nArtık yeni gelen üyelerin hesap yaşı bu kanalda kontrol edilecek.`)
        .setFooter({ text: "Legends Never Die Güvenlik Sistemi" })
        .setTimestamp();

    return message.channel.send({ embeds: [ayarEmbed] });
}

exports.conf = {
  enabled: true,
  guildOnly: true, // Güvenlik sadece sunucuda çalışır
  aliases: ['gkl', 'güvenlik-ayarla'],
  permLevel: 3 // bot.js içindeki elevation yapısına uygun (Administrator)
};

exports.help = {
  name: 'güvenlik',
  kategori: 'yetkili',
  description: 'Gelen üyelerin güvenilirliğini kontrol eden kanalı ayarlar.',
  usage: 'güvenlik #kanal'
};