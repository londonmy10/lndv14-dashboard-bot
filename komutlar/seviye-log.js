const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb'); // Projende quick.db varsa const db = require('quick.db') yapabilirsin

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (Yönetici)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.channel.send(`❌ Bu komutu kullanabilmek için \`Yönetici\` yetkisine sahip olmalısın.`);
    }

    // Sistem Açık mı Kontrolü
    let hm = db.get(`seviyeacik_${message.guild.id}`);
    if (!hm) {
        return message.reply('⚠️ Aktif edilmeyen bir seviye sistemine log kanalı ayarlayamazsın! \nBunu deneyebilirsin: `&seviye-aç`');
    }

    // Kanal Etiketleme Kontrolü
    let kanals = message.mentions.channels.first();
    if (!kanals) {
        return message.channel.send('❌ Kanal ayarlamam için bir kanal belirtmen gerekiyor. \nÖrnek: `&seviye-log #level-log`');
    }

    // Veritabanından Diğer Ayarları Çekme (Bilgi Mesajı İçin)
    let xp = db.get(`verilecekxp_${message.guild.id}`);
    let seviyerol = db.get(`svrol_${message.guild.id}`);

    let kontrol2 = xp ? xp : '4 (Varsayılan)';
    let kontrol3 = seviyerol ? `<@&${seviyerol}>` : 'Seviye Rol Sistemi Aktif Değil! ⚠️';

    // v14 EmbedBuilder Yapısı
    const basariEmbed = new EmbedBuilder()
        .setTitle('✅ İşlem Başarılı!')
        .setDescription('Seviye log kanalı ayarlandı. Üyeler seviye atlayınca artık orada belirteceğim.')
        .addFields(
            { name: '📍 Seviye Log Kanalı:', value: `${kanals}`, inline: true },
            { name: '✨ Mesaj Başı XP:', value: String(kontrol2), inline: true },
            { name: '🎭 Seviye Rolü:', value: kontrol3, inline: false }
        )
        .setFooter({ text: 'LND Bot | Seviye Sistemi!', iconURL: client.user.displayAvatarURL() })
        .setColor('Green')
        .setTimestamp();

    await message.channel.send({ embeds: [basariEmbed] });

    // Veritabanına Kaydetme (ID olarak kaydetmek en sağlıklısıdır)
    db.set(`svlog_${message.guild.id}`, kanals.id);

    // Sunucu Sahibine Bilgilendirme
    try {
        const owner = await message.guild.fetchOwner();
        owner.send(`📢 Seviye sistemi log kanalı **${message.author.tag}** tarafından **${kanals.name}** olarak ayarlandı!\n\`LND Bot Seviye Sistemi\``).catch(() => {});
    } catch (e) {
        console.log("Sahibe DM gönderilemedi.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['seviyelog', 'level-log'],
    permLevel: 3 // Sunucuyu Yönet / Admin
};

exports.help = {
    name: 'seviye-log',
    kategori: 'yetkili',
    description: 'Seviye atlayan kullanıcıların bildirim kanalını ayarlar.',
    usage: 'seviye-log #kanal'
};