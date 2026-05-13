const { EmbedBuilder } = require("discord.js");
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Sahip Kontrolü (Komutu sadece sen kullanabilirsin)
    // Eğer bot.js'de permLevel 4/5 ayarlıysa bu ek güvenliktir.
    if (message.author.id !== "351695051962843136") {
        return message.reply("❌ Bu komut sadece yapımcıma özeldir!");
    }

    // Kullanıcı ID Kontrolü
    const userID = args[0];
    if (!userID) {
        const uyariEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ Kara listeye almak istediğin kullanıcının **ID**'sini yazmalısın!");
        return message.channel.send({ embeds: [uyariEmbed] });
    }

    try {
        // Kullanıcıyı hem cache hem de Discord üzerinden ara
        const user = await client.users.fetch(userID).catch(() => null);
        if (!user) return message.reply("❌ Belirttiğin ID'ye sahip bir kullanıcı bulamadım.");

        // Kara Liste Kontrolü (croxydb yapısı)
        if (db.get(`karalist_${user.id}`)) {
            return message.reply("⚠️ Bu kullanıcı zaten kara listede bulunuyor!");
        }

        // Veritabanına Ekle
        db.set(`karalist_${user.id}`, true);

        const basariEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("🚫 Kara Listeye Alındı")
            .setDescription(`**${user.tag}** (\`${user.id}\`) adlı kullanıcı başarıyla kara listeye alındı!\nArtık botun hiçbir komutunu kullanamayacak.`)
            .setTimestamp()
            .setFooter({ text: "LND Bot Güvenlik Sistemi" });

        return message.channel.send({ embeds: [basariEmbed] });

    } catch (err) {
        console.error("Karaliste hatası:", err);
        return message.channel.send("❌ İşlem sırasında bir hata oluştu.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["blacklist", "kara-liste"],
    permLevel: 4 // Yapımcı seviyesi
};

exports.help = {
    name: "karaliste",
    kategori: 'yapımcı',
    description: "Belirtilen kullanıcıyı botun kara listesine ekleyerek komut kullanımını engeller.",
    usage: "karaliste <kullanıcı ID>"
};