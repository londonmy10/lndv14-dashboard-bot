const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("croxydb");
const ms = require("parse-ms"); // Kalan süreyi gün/saat/dakika yapmak için

exports.run = async (client, message, args) => {
    // Yetki Kontrolü: Sunucuyu Yönet yetkisi olanlar tanıtabilsin (İsteğe bağlı)
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Bu komutu kullanabilmek için `Sunucuyu Yönet` yetkisine sahip olmalısın!");
    }

    let cooldown = 86400000; // 24 Saat (milisaniye)
    let lastDaily = db.get(`tanit_bekleme_${message.guild.id}`);

    if (lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0) {
        let time = ms(cooldown - (Date.now() - lastDaily));

        const beklemeEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("⏳ Biraz Bekle!")
            .setDescription(`**${message.author.username}**, bu sunucuyu zaten tanıtmışsın.\n\nTekrar tanıtmak için **${time.hours} saat, ${time.minutes} dakika** beklemelisin.`)
            .setFooter({ text: "Legends Never Die Sunucu Tanıtım" });

        return message.channel.send({ embeds: [beklemeEmbed] });
    } else {
        // Başarı Mesajı
        const basariEmbed = new EmbedBuilder()
            .setTitle("✅ İşlem Başarılı")
            .setDescription("**Sunucunuz başarıyla destek sunucumuzda tanıtıldı.**\n**24 saat sonra tekrar tanıtabilirsiniz.**")
            .setColor("Green")
            .setTimestamp();

        message.channel.send({ embeds: [basariEmbed] });

        // Davet linki oluşturma ve Tanıtım kanalına gönderme
        message.channel.createInvite({ maxAge: 0, reason: 'Sunucu Tanıtma Komutu' }).then(invite => {
            
            const tanitimEmbed = new EmbedBuilder()
                .setTitle("📢 Yeni Bir Sunucu Tanıtıldı!")
                .setColor("Random")
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '👑 Sunucu Sahibi', value: `${message.author.tag}`, inline: true },
                    { name: '🏰 Sunucu İsmi', value: `**${message.guild.name}**`, inline: true },
                    { name: '👥 Üye Sayısı', value: `\`${message.guild.memberCount}\``, inline: true },
                    { name: '🔗 Davet Linki', value: `[Sunucuya Gitmek İçin Tıkla](${invite.url})`, inline: false }
                )
                .setFooter({ text: `Sunucu ID: ${message.guild.id}` })
                .setTimestamp();

            // Tanıtımların gideceği kanal ID'si (v14 cache yapısı)
            const logKanal = client.channels.cache.get('727784226778513408');
            if (logKanal) {
                logKanal.send({ embeds: [tanitimEmbed] });
            }

            // Bekleme süresini veritabanına kaydet
            db.set(`tanit_bekleme_${message.guild.id}`, Date.now());
        }).catch(err => {
            return message.channel.send("❌ Davet linki oluşturulurken bir hata oluştu. Botun `Davet Oluştur` yetkisi olduğundan emin ol!");
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["sunucu-tanıt", "tanıt"],
    permLevel: 0
};

exports.help = {
    name: "sunucutanıt",
    kategori: 'yetkili',
    description: "Sunucunuzu botun global tanıtım kanalında tanıtır.",
    usage: "sunucutanıt"
};