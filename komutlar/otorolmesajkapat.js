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
            .setDescription(`⚠️ Otorol sistemi zaten ayarlanmamış, bu yüzden mesajları kapatamazsın!`)
            .setColor("Red")
            .setFooter({ text: 'Ayarlamak için: &otorol @rol #kanal' });
        
        return message.channel.send({ embeds: [hataEmbed] });
    }

    // Sadece kanal (mesaj) verisini temizle, rol ID'si kalsın istiyorsan null yapabilirsin
    // Eğer komple mesaj özelliğini kapatmak istiyorsan kanal verisini siliyoruz
    otorolVerisi[message.guild.id].kanal = null;

    // Dosyaya güncel veriyi yaz
    fs.writeFile("./jsonlar/otorol.json", JSON.stringify(otorolVerisi, null, 2), (err) => {
        if (err) {
            console.error(err);
            return message.channel.send("❌ İşlem sırasında bir hata oluştu!");
        }

        const basariEmbed = new EmbedBuilder()
            .setTitle("✅ Mesajlar Kapatıldı")
            .setDescription(`Otorol **mesaj sistemi** başarıyla kapatıldı. \nÜyeler rol almaya devam edecek ancak kanala bilgi mesajı atılmayacak.`)
            .setColor("Green")
            .setTimestamp()
            .setFooter({ text: 'LND Bot Otorol Sistemi', iconURL: client.user.displayAvatarURL() });

        return message.channel.send({ embeds: [basariEmbed] });
    });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["otomesajkapat", "otorolmesaj-kapat"],
    permLevel: 3 // Yönetici seviyesi
};

exports.help = {
    name: 'otomesajkapat',
    kategori: "yetkili",
    description: 'Otorol verildiğinde kanala atılan bilgi mesajını kapatır.',
    usage: 'otomesajkapat'
};