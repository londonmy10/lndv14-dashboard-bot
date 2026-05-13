const { EmbedBuilder } = require("discord.js");
const db = require("croxydb"); // quick.db yerine croxydb kullanımı

exports.run = async (client, message, args) => {
  var USER = message.author;
  var REASON = args.slice(0).join(" ");

  // Sebep belirtilmemişse hata mesajı gönder
  if (!REASON) {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTitle('Hata!')
      .setDescription(`<a:hgg:729628053789081610> AFK olmak için bir sebep belirtin. <a:hgg:729628053789081610>`)
      .setFooter({ text: 'Legends Never Die AFK Sistemi' });

    return message.channel.send({ embeds: [embed] }).then(msg => {
      setTimeout(() => msg.delete(), 5000);
    });
  }

  // AFK bilgilerini veritabanına kaydet
  db.set(`afk_${USER.id}`, REASON);
  db.set(`afk_süre_${USER.id}`, Date.now());

  // Başarılı mesajı gönder
  const afkEmbed = new EmbedBuilder()
    .setColor('#006400')
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
    .setTitle('Başarılı!')
    .setDescription(`<a:tac:729628071417741354> Başarıyla AFK moduna girdiniz. <a:tac:729628071417741354>`)
    .setFooter({ text: 'Legends Never Die AFK Sistemi' });

  message.channel.send({ embeds: [afkEmbed] }).then(msg => {
    setTimeout(() => msg.delete(), 5000);
  });
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0 // bot.js içindeki elevation yapısına uygun
};

exports.help = {
  name: 'afk',
  kategori: 'genel',
  description: 'Kullanıcıyı AFK moduna sokar.',
  usage: 'afk <sebep>'
};