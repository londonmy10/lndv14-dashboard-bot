const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message, args) => {
  
  // Rastgele Mesaj Havuzu
  const basarili = ['**İŞTE BU!**', '**SÜPER!**', '**MÜKEMMEL!**', '**SEVDİM BUNU!**', '**ŞİMDİ OLDU!**'];
  const x = basarili[Math.floor(Math.random() * basarili.length)];

  const basarisiz = ['**TÜH!**', '**OLMADI BU!**', '**HAY AKSİ!**', '**BÖYLE OLMAZ?!**', '**HADİ YA!**'];
  const x2 = basarisiz[Math.floor(Math.random() * basarisiz.length)];

  // Yetki Kontrolü
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return message.reply(`❌ **${ayarlar.prefix}jail-kanal** komutunu kullanabilmek için \`SUNUCUYU YÖNET\` yetkisine sahip olman gerekiyor.`);
  }

  if (!args[0]) {
    return message.reply(`❓ Sistemi kullanabilmek için: \`${ayarlar.prefix}jail-kanal ayarla #kanal\` veya \`sıfırla\` yazmalısın.`);
  }

  // AYARLAMA KISMI
  if (args[0] === 'ayarla') {
    let kanal = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
    
    if (!kanal) return message.channel.send(`${x2} Lütfen geçerli bir kanal etiketle veya ID'sini yaz.`);

    db.set(`jailkanal_${message.guild.id}`, kanal.id);
    
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`${x} Jail log kanalı ${kanal} olarak başarıyla ayarlandı.`)
      .setFooter({ text: "LND Bot Jail Sistemi" });

    return message.channel.send({ embeds: [embed] });
  } 

  // SIFIRLAMA KISMI
  if (args[0] === 'sıfırla') {
    const kontrol = db.get(`jailkanal_${message.guild.id}`);
    if (!kontrol) return message.reply(`${x2} Zaten ayarlanmış bir kanal bulunmuyor.`);

    db.delete(`jailkanal_${message.guild.id}`);
    return message.channel.send(`${x} Jail log kanalı başarıyla sıfırlandı.`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['jailkanal', 'jail-log'],
  permLevel: 3 // Administrator/ManageGuild
};

exports.help = {
  name: 'jail-kanal',
  kategori: 'yetkili',
  description: 'Jail loglarının tutulacağı kanalı ayarlar.',
  usage: 'jail-kanal ayarla/sıfırla #kanal'
};