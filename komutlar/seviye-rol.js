const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb'); // Projende quick.db varsa ona göre güncelleyebilirsin

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (Yönetici)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.channel.send(`❌ Bu komutu kullanabilmek için \`Yönetici\` yetkisine sahip olmalısın.`);
    }

    // Gerekli Tanımlamalar
    let rol = message.mentions.roles.first();
    let seviye = args[1];

    // Sistem Açık mı Kontrolü
    let hm = db.get(`seviyeacik_${message.guild.id}`);
    if (!hm) {
        return message.reply('⚠️ Seviye sistemi aktif değil! Aktif edilmeyen bir sisteme ödül ekleyemezsin. \nKullanım: `&seviye-aç`');
    }

    // Girdi Kontrolleri
    if (!rol) return message.channel.send('❌ Ayarlayabilmem için bir rol belirtmelisin. \nÖrnek: `&seviye-rol @rol 10`');
    if (!seviye) return message.channel.send('❌ Ayarlayabilmem için bir seviye belirtmelisin. \nÖrnek: `&seviye-rol @rol 10`');
    if (isNaN(seviye)) return message.channel.send('❌ Seviye değerini bir sayı biçiminde girmelisin.');
    if (seviye > 700) return message.channel.send('❌ Maksimum `700` seviyesine kadar ödül ayarlanabilir!');

    // Veritabanından mevcut bilgileri çekme (Bilgi Mesajı İçin)
    let kanalID = db.get(`svlog_${message.guild.id}`);
    let xp = db.get(`verilecekxp_${message.guild.id}`);

    let kontrol = kanalID ? `<#${kanalID}>` : 'Sunucuda Ayarlanmış Bir Log Kanalı Bulunamadı!';
    let kontrol2 = xp ? xp : '4 (Varsayılan)';

    // v14 EmbedBuilder Yapısı
    const basariEmbed = new EmbedBuilder()
        .setTitle('✅ Seviye Rol Ödülü Ayarlandı!')
        .setDescription('Üyeler belirlenen seviyeye ulaştığında otomatik olarak bu rolü alacaklar.')
        .addFields(
            { name: '📍 Seviye Log Kanalı:', value: kontrol, inline: true },
            { name: '✨ Mesaj Başı XP:', value: String(kontrol2), inline: true },
            { name: '\u200B', value: '\u200B', inline: true }, // Boşluk
            { name: '🎭 Verilecek Rol:', value: `${rol}`, inline: true },
            { name: '🆙 Gereken Seviye:', value: `\`${seviye}\``, inline: true }
        )
        .setFooter({ text: 'LND Bot | Seviye Sistemi!', iconURL: client.user.displayAvatarURL() })
        .setColor('Green')
        .setTimestamp();

    // Veritabanına Kaydetme
    db.set(`svrol_${message.guild.id}`, rol.id);
    db.set(`rollevel_${message.guild.id}`, seviye);

    return message.channel.send({ embeds: [basariEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['seviyerol', 'level-role'],
    permLevel: 3 // Sunucuyu Yönet / Admin
};

exports.help = {
    name: 'seviye-rol',
    kategori: 'yetkili',
    description: 'Belirli bir seviyeye ulaşanlara verilecek rolü ayarlar.',
    usage: 'seviye-rol @rol <seviye>'
};