const { EmbedBuilder } = require("discord.js");
const db = require('croxydb');

exports.run = async (client, message, args) => {
  // Kullanıcı ID'sini al
  let userID = args[0];

  if (!userID) {
    const hataEmbed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("❌ Kara listeden kaldırmak istediğin kullanıcının **ID**'sini yazmalısın!");
    return message.channel.send({ embeds: [hataEmbed] });
  }

  try {
    // Kullanıcıyı ID üzerinden çekmeye çalış (v14 fetch yapısı)
    const user = await client.users.fetch(userID).catch(() => null);
    
    if (!user) {
      return message.reply("❌ Belirttiğin ID'ye sahip bir kullanıcı bulunamadı!");
    }

    // Kara listede olup olmadığını kontrol et
    const kontrol = await db.get(`karalist_${user.id}`);
    if (!kontrol) {
      return message.reply("⚠️ Bu kullanıcı zaten kara listede değil!");
    }

    // Kara listeden kaldır
    db.delete(`karalist_${user.id}`);

    const basariliEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`✅ **${user.tag}** adlı kullanıcı başarıyla kara listeden çıkartıldı!`)
      .setFooter({ text: "LND Bot Yapımcı Sistemi" })
      .setTimestamp();

    return message.channel.send({ embeds: [basariliEmbed] });

  } catch (err) {
    console.error(err);
    return message.reply("❌ Bir hata oluştu. Lütfen ID'nin doğru olduğundan emin ol.");
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["unblacklist", "kara-liste-çıkar"],
  permLevel: 4 // bot.js içindeki elevation yapısına uygun (Yapımcı Seviyesi)
};

exports.help = {
  name: "beyazliste",
  kategori: 'yapımcı', // bot.js yükleyicisiyle uyumlu
  description: "Belirtilen kullanıcıyı kara listeden çıkartır.",
  usage: "beyazliste <kullanıcı ID>"
};