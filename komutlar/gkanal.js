const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.channel.send('❌ Hoşgeldin kanalı ayarlamak için `Yönetici` yetkisine sahip olman gerek.');
    }

    // Kanal Etiketleme Kontrolü
    let hgkanali = message.mentions.channels.first();
    if (!hgkanali) {
        return message.channel.send('❌ Hoşgeldin kanalı ayarlamak için bir kanal etiketlemeniz gerekli. \nÖrnek: `&gkanal #kanal`');
    }

    // Veritabanına Kaydetme (croxydb yapısı)
    db.set(`gcc_${message.guild.id}`, hgkanali.id);

    // Başarılı Mesajı (Embed ile)
    const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Ayar Başarılı")
        .setDescription(`Resimli hoşgeldin kanalı <#${hgkanali.id}> olarak ayarlandı.\n\nSistemi kapatmak için: \`&gkanal-sil\` yazabilirsiniz.`)
        .setFooter({ text: "Legends Never Die Ayar Sistemi" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });

    // Tepki Ekleme (Hata almamak için catch ekledim)
    message.react('727665294285209630').catch(() => console.log("Emoji bulunamadı veya yetkim yok."));
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['resim-kanal', 'hg-bb', 'rgk', 'rgç', 'resimli-hoşgeldin-kanal', 'hoşgeldin-ayarla', 'welcome-set', 'gelen-giden', 'resim'],
    permLevel: 3 // bot.js içindeki elevation yapısına uygun (Administrator)
};

exports.help = {
    name: 'gkanal',
    kategori: 'yetkili', // bot.js yükleyicisiyle uyumlu
    description: 'Resimli hoşgeldin-güle güle kanalı ayarlar.',
    usage: 'gkanal #kanal'
};