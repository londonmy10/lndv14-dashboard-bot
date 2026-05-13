const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü: Yönetici yetkisi gerekir
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("❌ Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!");
    }

    // Dosyayı oku
    let otorolVerisi = JSON.parse(fs.readFileSync("./jsonlar/otorol.json", "utf8"));

    // Eğer sunucuya ait bir kayıt yoksa uyarı ver
    if (!otorolVerisi[message.guild.id]) {
        const hataEmbed = new EmbedBuilder()
            .setDescription(`⚠️ Otorol bu sunucuda zaten ayarlanmamış, bu yüzden sıfırlayamazsın!`)
            .setColor("Red")
            .setFooter({ text: 'Ayarlamak için: &otorol @rol #kanal' });
        
        return message.channel.send({ embeds: [hataEmbed] });
    }

    // Sunucu verisini sil
    delete otorolVerisi[message.guild.id];

    // Dosyaya güncel veriyi yaz
    fs.writeFile("./jsonlar/otorol.json", JSON.stringify(otorolVerisi, null, 2), (err) => {
        if (err) {
            console.error(err);
            return message.channel.send("❌ Veri silinirken bir hata oluştu!");
        }

        const basariEmbed = new EmbedBuilder()
            .setTitle("✅ İşlem Başarılı")
            .setDescription(`Otorol sistemi bu sunucu için başarıyla sıfırlandı ve kapatıldı.`)
            .setColor("Green")
            .setTimestamp()
            .setFooter({ text: 'LND Bot Otorol Sistemi', iconURL: client.user.displayAvatarURL() });

        return message.channel.send({ embeds: [basariEmbed] });
    });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["otorolsıfırla", "otorol-kapat", "otorol-sıfırla"],
    permLevel: 3 // Yönetici/Sunucuyu Yönet seviyesi
};

exports.help = {
    name: 'otorolkapat',
    kategori: "yetkili",
    description: 'Sunucudaki otorol sistemini kapatır ve verileri siler.',
    usage: 'otorolkapat'
};