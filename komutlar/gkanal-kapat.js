const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.channel.send('❌ Hoşgeldin kanalını silmek için `Yönetici` yetkisine sahip olman gerek.');
    }

    // Veritabanından kanal bilgisini sil
    const kontrol = db.get(`gcc_${message.guild.id}`);
    
    if (!kontrol) {
        return message.reply("⚠️ Zaten ayarlanmış bir hoşgeldin kanalı bulunmuyor!");
    }

    db.delete(`gcc_${message.guild.id}`);

    // Başarılı Mesajı (Embed ile daha şık)
    const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ **Resimli Hoşgeldin kanalı başarıyla sıfırlandı/silindi.**`)
        .setFooter({ text: "Legends Never Die Ayar Sistemi" });

    message.channel.send({ embeds: [embed] });

    // Tepki Ekleme (Hata almamak için catch ekledim)
    message.react('727665294285209630').catch(() => console.log("Emoji bulunamadı veya yetkim yok."));
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['resim-kanal-sil', 'gkanal-kapat', 'gkanal-sil'],
    permLevel: 3 // bot.js içindeki elevation yapısına uygun (Administrator)
};

exports.help = {
    name: 'gkanal-sil',
    kategori: 'yetkili', // bot.js yükleyicisiyle uyumlu
    description: 'Ayarlanmış olan resimli hoşgeldin-güle güle kanalını siler.',
    usage: 'gkanal-sil'
};