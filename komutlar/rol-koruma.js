const db = require("quick.db");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply("❌ Yetkin yok!");

    if (args[0] === "aç") {
        db.set(`rolk_${message.guild.id}`, "acik");
        return message.channel.send("✅ **Rol Koruma** sistemi başarıyla açıldı!");
    } else if (args[0] === "kapat") {
        db.delete(`rolk_${message.guild.id}`);
        return message.channel.send("❌ **Rol Koruma** sistemi kapatıldı.");
    } else {
        return message.reply("❓ Kullanım: `&rol-koruma aç` veya `&rol-koruma kapat`.");
    }
};

exports.conf = { enabled: true, guildOnly: true, aliases: ["rol-k"], permLevel: 3 };
exports.help = { name: "rol-koruma", kategori: 'sunucu' };