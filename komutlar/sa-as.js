const db = require("croxydb");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

exports.run = async (client, message, args) => {
  // Yetki Kontrolü (v14 Administrator kontrolü)
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.reply("❌ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın!");
  }

  if (!args[0]) {
    return message.reply("❓ Sistemi kullanmak için: `sa-as aç` veya `sa-as kapat` yazmalısın.");
  }

  if (args[0] === "aç") {
    db.set(`ssaass_${message.guild.id}`, "acik");
    return message.reply("✅ **SA-AS sistemi başarıyla açıldı!** Artık biri 'sa' yazınca bot 'Aleyküm Selam' diyecek.");
  }

  if (args[0] === "kapat") {
    db.delete(`ssaass_${message.guild.id}`);
    return message.reply("❌ **SA-AS sistemi başarıyla kapatıldı!**");
  }
};

exports.conf = {
  aliases: ["saas"],
  permLevel: 0
};

exports.help = {
  name: "sa-as",
  description: "Selamün Aleyküm - Aleyküm Selam sistemini açar/kapatır.",
  usage: "sa-as aç/kapat"
};