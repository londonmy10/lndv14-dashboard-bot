const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("croxydb");

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (Sunucuyu Yönet yetkisi olanlar kullanabilir)
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Bu sistemi yönetmek için `Sunucuyu Yönet` yetkisine sahip olmalısın.");
    }

    const embed = new EmbedBuilder().setColor("Black").setTitle("🛡️ Kanal Koruma Sistemi");

    if (!args[0]) {
        embed.setDescription("❌ Hatalı kullanım! \nÖrnek: `&kanal-koruma aç` veya `&kanal-koruma kapat`").setColor("Red");
        return message.channel.send({ embeds: [embed] });
    }

    let kanalKoruma = db.get(`kanalk_${message.guild.id}`);

    if (args[0] === "aç") {
        if (kanalKoruma) {
            embed.setDescription("⚠️ Görünüşe göre kanal koruma sistemi zaten aktif!").setColor("Yellow");
            return message.channel.send({ embeds: [embed] });
        } else {
            db.set(`kanalk_${message.guild.id}`, "acik");
            embed.setDescription("✅ Kanal koruma sistemi başarıyla açıldı! \n*Artık silinen kanallar otomatik olarak geri açılacak.*").setColor("Green");
            return message.channel.send({ embeds: [embed] });
        }
    } 
    
    if (args[0] === "kapat") {
        if (!kanalKoruma) {
            embed.setDescription("⚠️ Kanal koruma sistemi zaten kapalı!").setColor("Yellow");
            return message.channel.send({ embeds: [embed] });
        } else {
            db.delete(`kanalk_${message.guild.id}`);
            embed.setDescription("✅ Kanal koruma sistemi başarıyla kapatıldı.").setColor("Green");
            return message.channel.send({ embeds: [embed] });
        }
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["kanal-k", "kanalkoruma"],
    permLevel: 3 // Administrator/ManageGuild seviyesi
};

exports.help = {
    name: "kanal-koruma",
    kategori: 'sunucu',
    description: "Silinen kanalları botun yetkisi dahilinde korur.",
    usage: "kanal-koruma aç/kapat"
};