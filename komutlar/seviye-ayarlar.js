const { EmbedBuilder } = require('discord.js');
const db = require('croxydb'); // Projende quick.db varsa ona göre güncelleyebilirsin

exports.run = async (client, message, args) => {
    // Sistemin açık olup olmadığını kontrol et
    let hm = db.get(`seviyeacik_${message.guild.id}`);
    if (!hm) {
        return message.channel.send('⚠️ Seviye sistemi bu sunucuda aktif durumda değil! \nBunu mu arıyorsun? `&seviye-aç`');
    }

    // Veritabanı verilerini çek
    let kanalID = db.get(`svlog_${message.guild.id}`);
    let xp = db.get(`verilecekxp_${message.guild.id}`);
    let seviyerolID = db.get(`svrol_${message.guild.id}`);
    let rollvl = db.get(`rollevel_${message.guild.id}`);

    // Gösterge Kontrolleri (Kanal)
    let kontrol;
    if (!kanalID) {
        kontrol = '❌ Ayarlanmamış';
    } else {
        const kanal = message.guild.channels.cache.get(kanalID);
        kontrol = kanal ? `✅ ${kanal}` : '❌ Kanal Silinmiş';
    }

    // Gösterge Kontrolleri (XP)
    let kontrol2 = xp ? `✅ ${xp}` : '4 (Varsayılan)';

    // Gösterge Kontrolleri (Rol)
    let kontrol3;
    if (!seviyerolID) {
        kontrol3 = '❌ Ayarlanmamış';
    } else {
        const rol = message.guild.roles.cache.get(seviyerolID);
        kontrol3 = rol ? `✅ ${rol}` : '❌ Rol Silinmiş';
    }

    // Gösterge Kontrolleri (Seviye Sınırı)
    let kontrol4 = rollvl ? `✅ ${rollvl}. Seviye` : '❌ Belirlenmemiş';

    // v14 Embed Yapısı
    const ayarlarEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle('📊 Sunucu Seviye Ayarları')
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setDescription(`Aşağıda **${message.guild.name}** sunucusunun güncel seviye sistemi yapılandırması yer almaktadır.`)
        .addFields(
            { name: '📍 Seviye Log Kanalı', value: kontrol, inline: true },
            { name: '✨ Mesaj Başı XP', value: String(kontrol2), inline: true },
            { name: '\u200B', value: '\u200B', inline: true }, // Boşluk bırakmak için (v14 tarzı)
            { name: '🎭 Seviye Rolü', value: kontrol3, inline: true },
            { name: '🆙 Rol Seviye Sınırı', value: kontrol4, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }
        )
        .setFooter({ text: 'LND Bot Seviye Sistemi', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [ayarlarEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['seviyeayarlar', 'level-settings'],
    permLevel: 0
};

exports.help = {
    name: 'seviye-ayarlar',
    kategori: 'yetkili',
    description: 'Sunucudaki seviye sistemi ayarlarını gösterir.',
    usage: 'seviye-ayarlar'
};