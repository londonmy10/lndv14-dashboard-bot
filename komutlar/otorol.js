const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü: Yönetici yetkisi gerekir
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("❌ Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!");
    }

    // Dosyayı oku
    let profil = JSON.parse(fs.readFileSync("./jsonlar/otorol.json", "utf8"));

    // Rol ve Kanal etiketlerini al
    var mentionedRole = message.mentions.roles.first();
    var mentionedChannel = message.mentions.channels.first();

    // Hatalı kullanım kontrolü
    if (!mentionedRole || !mentionedChannel) {
        const kullanimEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("⚠️ Eksik Bilgi")
            .setDescription("Otorolü ayarlamak için hem bir rol hem de bir log kanalı etiketlemelisin!\n\n**Doğru Kullanım:** `&otorol @rol #kanal`\n**Sıfırlamak için:** `&otorol-sıfırla`")
            .setFooter({ text: "LND Bot Otorol Sistemi" });
        
        return message.channel.send({ embeds: [kullanimEmbed] });
    }

    // Veriyi hazırla
    profil[message.guild.id] = {
        sayi: mentionedRole.id, // Rol ID'si
        kanal: mentionedChannel.id // Kanal ID'si
    };

    // Dosyaya yaz
    fs.writeFile("./jsonlar/otorol.json", JSON.stringify(profil, null, 2), (err) => {
        if (err) {
            console.error(err);
            return message.channel.send("❌ Veritabanına kaydedilirken bir hata oluştu!");
        }

        // Başarı mesajı
        const basariEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Otorol Ayarlandı")
            .setDescription(`Otorol başarıyla ${mentionedRole} olarak ayarlandı!\nOtorol log kanalı ise ${mentionedChannel} olarak belirlendi.`)
            .addFields(
                { name: '🎭 Verilecek Rol', value: `${mentionedRole}`, inline: true },
                { name: '📍 Log Kanalı', value: `${mentionedChannel}`, inline: true }
            )
            .setFooter({ text: "LND Bot | Otorol Sistemi", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [basariEmbed] });
    });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["setautorole", "otorol-ayarla", "otoroldeğiştir"],
    permLevel: 3 // Yönetici/Sunucuyu Yönet
};

exports.help = {
    name: 'otorol',
    kategori: 'yetkili',
    description: 'Sunucuya yeni katılanlara otomatik verilecek rolü ve log kanalını ayarlar.',
    usage: 'otorol @rol #kanal'
};