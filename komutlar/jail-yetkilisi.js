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
    return message.reply(`❌ **${ayarlar.prefix}jail-yetkilisi** komutunu kullanabilmek için \`SUNUCUYU YÖNET\` yetkisine sahip olman gerekiyor.`);
  }

  if (!args[0]) {
    return message.reply(`❓ Sistemi kullanabilmek için: \`${ayarlar.prefix}jail-yetkilisi ayarla @rol\` veya \`sıfırla\` yazmalısın.`);
  }

  // AYARLAMA KISMI
  if (args[0] === 'ayarla') {
    // Rolü Etiket, ID veya İsim ile bulma
    let yetkilirol = message.mentions.roles.first() || 
                     message.guild.roles.cache.get(args[1]) || 
                     message.guild.roles.cache.find(r => r.name === args.slice(1).join(' '));
    
    if (!yetkilirol) return message.channel.send(`${x2} Lütfen geçerli bir rol etiketle veya ID/İsim belirt.`);

    db.set(`jailyetkilisi_${message.guild.id}`, yetkilirol.id);
    
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`${x} Jail komutunu kullanabilecek yetkili rolü **${yetkilirol.name}** olarak ayarlandı.`)
      .setFooter({ text: "LND Bot Jail Sistemi" });

    return message.channel.send({ embeds: [embed] });
  } 

  // SIFIRLAMA KISMI
  if (args[0] === 'sıfırla') {
    const kontrol = db.get(`jailyetkilisi_${message.guild.id}`);
    if (!kontrol) return message.reply(`${x2} Zaten ayarlanmış bir yetkili rolü bulunmuyor.`);

    db.delete(`jailyetkilisi_${message.guild.id}`);
    return message.channel.send(`${x} Jail yetkilisi başarıyla sıfırlandı.`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['jailyetkilisi', 'jail-sorumlusu'],
  permLevel: 3 // Administrator/ManageGuild
};

exports.help = {
  name: 'jail-yetkilisi',
  kategori: 'yetkili',
  description: 'Hangi role sahip kişilerin jail komutunu kullanabileceğini ayarlar.',
  usage: 'jail-yetkilisi ayarla @rol'
};