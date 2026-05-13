const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message, args) => {
  
  // Rastgele Mesaj Havuzu
  const basarili = ['**İŞTE BU!**', '**SÜPER!**', '**MÜKEMMEL!**', '**SEVDİM BUNU!**', '**ŞİMDİ OLDU!**'];
  const x = basarili[Math.floor(Math.random() * basarili.length)];

  const basarisiz = ['**TÜH!**', '**OLMADI BU!**', '**HAY AKSİ!**', '**BÖYLE OLMAZ?!**', '**HADİ YA!**'];
  const x2 = basarisiz[Math.floor(Math.random() * basarisiz.length)];

  // Yetki Kontrolü (v14 Formatı)
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return message.reply(`❌ **${ayarlar.prefix}jail-rol** komutunu kullanabilmek için \`SUNUCUYU YÖNET\` yetkisine sahip olman gerekiyor.`);
  }

  if (!args[0]) {
    return message.reply(`❓ Sistemi kullanabilmek için: \`${ayarlar.prefix}jail-rol ayarla @rol\` veya \`sıfırla\` yazmalısın.`);
  }

  // AYARLAMA KISMI
  if (args[0] === 'ayarla') {
    let rol = message.mentions.roles.first() || 
              message.guild.roles.cache.get(args[1]) || 
              message.guild.roles.cache.find(r => r.name === args.slice(1).join(' '));
    
    if (!rol) return message.channel.send(`${x2} Lütfen geçerli bir rol etiketle, ID'sini yaz veya ismini belirt.`);

    db.set(`jailrol_${message.guild.id}`, rol.id);
    
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`${x} Jail rolü **${rol.name}** olarak başarıyla ayarlandı.`)
      .setFooter({ text: "LND Bot Jail Sistemi" });

    return message.channel.send({ embeds: [embed] });
  } 

  // SIFIRLAMA KISMI
  if (args[0] === 'sıfırla') {
    const kontrol = db.get(`jailrol_${message.guild.id}`);
    if (!kontrol) return message.reply(`${x2} Zaten ayarlanmış bir rol bulunmuyor.`);

    db.delete(`jailrol_${message.guild.id}`);
    return message.channel.send(`${x} Jail rolü başarıyla sıfırlandı.`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['jailrol', 'cezalı-rolü'],
  permLevel: 3 // Administrator/ManageGuild
};

exports.help = {
  name: 'jail-rol',
  kategori: 'yetkili',
  description: 'Birisi jaile atılınca verilecek olan rolü ayarlar.',
  usage: 'jail-rol ayarla @rol'
};