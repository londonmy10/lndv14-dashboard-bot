const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Veritabanından ayarları çekiyoruz
    const kayitKanalID = db.get(`kayitKanal_${message.guild.id}`);
    const kayitRolID = db.get(`kayıtrol_${message.guild.id}`);
    const kayitLogID = db.get(`kayıtlog_${message.guild.id}`);

    // Sistem Ayarlı mı Kontrolü
    if (!kayitKanalID || !kayitRolID) {
        return message.channel.send('❌ Kayıt sistemi henüz tam ayarlanmamış! \nAyarlamak için: `&kayıt-rol @rol` ve `&kayıt-kanal #kanal` komutlarını kullanın.');
    }

    // Doğru Kanalda mı Kontrolü
    if (message.channel.id !== kayitKanalID) {
        return message.channel.send(`⚠️ Kayıt işlemini sadece <#${kayitKanalID}> kanalında yapabilirsin!`);
    }

    let user = message.member;
    let isim = args[0];
    let yas = args[1];

    if (!isim) return message.channel.send(`❌ Bir isim girmelisin. \nÖrnek: \`&kayıt Samet 18\``);
    if (!yas) return message.channel.send(`❌ Bir yaş girmelisin.`);
    if (isNaN(yas)) return message.channel.send(`❌ Yaş bir sayı olmalıdır.`);

    try {
        // İsim Değiştirme ve Rol Verme
        await user.setNickname(`${isim} | ${yas}`);
        await user.roles.add(kayitRolID);

        // Kullanıcıya Geri Bildirim
        message.channel.send(`✅ ${message.author}, sunucuya başarıyla kayıt oldun, hoş geldin!`);

        // Log Kanalına Bildirim Gönderme
        const logKanal = message.guild.channels.cache.get(kayitLogID);
        if (logKanal) {
            const logEmbed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("📥 Yeni Kayıt Yapıldı")
                .addFields(
                    { name: "👤 Kullanıcı:", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
                    { name: "📝 Yeni İsim:", value: `\`${isim} | ${yas}\``, inline: true }
                )
                .setFooter({ text: "LND Kayıt Sistemi" })
                .setTimestamp();

            logKanal.send({ embeds: [logEmbed] });
        }
    } catch (err) {
        console.error("Kayıt Hatası:", err);
        return message.channel.send("❌ Kayıt yapılırken bir hata oluştu! (Botun yetkisi yetmiyor veya rol bulunamadı)");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: 0,
    kategori: "genel"
};

exports.help = {
    name: 'kayıt',
    kategori: 'genel',
    description: "Sunucuya kayıt olmanızı sağlar.",
    usage: 'kayıt <isim> <yaş>'
};