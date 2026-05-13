const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const db = require("croxydb");
const ayarlar = require('../ayarlar.json');

module.exports.run = async (client, message, args) => {
    // Veritabanından Ayarları Çek
    let jailRolID = db.get(`jailrol_${message.guild.id}`);
    let yetkiliRolID = db.get(`jailyetkilisi_${message.guild.id}`);
    let logKanalID = db.get(`jailkanal_${message.guild.id}`);

    // Ayar Kontrolleri
    if (!jailRolID || !yetkiliRolID || !logKanalID) {
        return message.channel.send(`❌ Jail sistemi henüz tam ayarlanmamış. \nAyarlar: \`&jail-rol\`, \`&jail-yetkilisi\`, \`&jail-kanal\``);
    }

    let jailRol = message.guild.roles.cache.get(jailRolID);
    let yetkiliRol = message.guild.roles.cache.get(yetkiliRolID);
    let logKanal = message.guild.channels.cache.get(logKanalID);

    if (!jailRol || !yetkiliRol || !logKanal) return message.channel.send(`❌ Ayarlı roller veya kanal sunucuda bulunamadı!`);

    // Yetkili Kontrolü
    if (!message.member.roles.cache.has(yetkiliRol.id) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.channel.send(`❌ Bu komutu kullanabilmek için ${yetkiliRol} rolüne sahip olmalısın.`);
    }

    // Kişi Kontrolü
    let kişi = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!kişi) return message.channel.send(`❌ Jaile gönderilecek kişiyi etiketlemeli veya ID yazmalısın.`);
    if (kişi.permissions.has(PermissionFlagsBits.ManageGuild)) return message.channel.send(`❌ Bu kişiyi jaile gönderemem (Yetkisi benden veya senden yüksek olabilir).`);

    // Süre ve Sebep Kontrolü
    let zaman = args[1];
    if (!zaman || !ms(zaman)) return message.channel.send(`❌ Geçerli bir süre belirtmelisin. \nÖrnek: \`&jail @kişi 10m sebep\` (s: saniye, m: dakika, h: saat, d: gün)`);

    let sebep = args.slice(2).join(' ') || 'Sebep belirtilmemiş.';

    // Jail Embed (Wasted)
    const wasted = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setColor(`#f3c7e1`)
        .setTitle(`🔒 Hapishaneye Gönderildi`)
        .setDescription(`Birisi kuralları çiğnedi ve adalete teslim edildi!`)
        .addFields(
            { name: `👤 Mahkum:`, value: `${kişi}`, inline: true },
            { name: `👮 Hakim/Savcı:`, value: `${message.author}`, inline: true },
            { name: `📝 Sebep:`, value: `\`${sebep}\``, inline: true },
            { name: `⏰ Süre:`, value: `\`${zaman.replace(/d/, ' gün').replace(/s/, ' saniye').replace(/m/, ' dakika').replace(/h/, ' saat')}\``, inline: true }
        )
        .setThumbnail("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHIybTVqZzB4bm9yeWp6bm5hbmh6YjR5ZzF3eGZ6eGZ6eGZ6eGZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/v76S66NqKAn8ghY39v/giphy.gif")
        .setTimestamp()
        .setFooter({ text: `${client.user.username} Adalet Sistemi` });

    // Jail İşlemi (Eski Rolleri Kaydet ve Sil)
    let eskiRoller = kişi.roles.cache.filter(r => r.name !== "@everyone" && r.id !== jailRol.id).map(r => r.id);
    db.set(`jail_eskiroller_${kişi.id}_${message.guild.id}`, eskiRoller);

    try {
        await kişi.roles.set([jailRol.id]); // Tüm rolleri alıp sadece jail rolünü verir
        logKanal.send({ embeds: [wasted] });
        message.channel.send(`✅ ${kişi} başarıyla **${zaman}** süreliğine hapsedildi.`);

        // Tahliye Süreci (setTimeout)
        setTimeout(async () => {
            if (!kişi.guild.members.cache.has(kişi.id)) return; // Üye sunucudan çıktıysa işlemi durdur

            // Eski rolleri geri yükle
            let geriYukle = db.get(`jail_eskiroller_${kişi.id}_${message.guild.id}`) || [];
            await kişi.roles.set(geriYukle).catch(() => console.log("Rol geri yüklenirken hata oluştu."));
            db.delete(`jail_eskiroller_${kişi.id}_${message.guild.id}`);

            const bitti = new EmbedBuilder()
                .setTitle(`🔓 Tahliye Edildi`)
                .setDescription(`${kişi} cezasını tamamladı ve özgürlüğüne kavuştu.`)
                .setColor(`Green`)
                .setTimestamp();

            logKanal.send({ embeds: [bitti] });
        }, ms(zaman));

    } catch (err) {
        console.error(err);
        message.channel.send("❌ Rol işlemleri sırasında bir hata oluştu. Botun yetkisinin en üstte olduğundan emin ol!");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['uçur', 'hapse-at'],
    permLevel: 0 
};

exports.help = {
    name: 'jail',
    kategori: 'yetkili',
    description: 'Bir kişiyi belirli bir süreliğine jaile gönderir.',
    usage: 'jail @üye <süre> <sebep>'
};