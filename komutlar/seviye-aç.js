const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb'); // Projende quick.db varsa const db = require('quick.db') yapabilirsin

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (Yönetici)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.channel.send(`⚠️ Bu komutu kullanabilmek için \`Yönetici\` yetkisine sahip olmalısın.`);
    }

    // Sistem zaten açık mı kontrolü
    let hm = db.get(`seviyeacik_${message.guild.id}`);
    if (hm) {
        return message.reply('Bu tuhaf! Anlaşılan seviye sistemi zaten aktif edilmiş.. \nBunu mu arıyorsun? `&seviye-kapat`');
    }

    // Veritabanından mevcut ayarları çekiyoruz
    let kanalID = db.get(`svlog_${message.guild.id}`);
    let xp = db.get(`verilecekxp_${message.guild.id}`);
    let seviyerol = db.get(`svrol_${message.guild.id}`);

    // Kontroller (Görselleştirme için)
    let kontrol = kanalID ? `<#${kanalID}>` : 'Sunucuda Ayarlanmış Bir Log Kanalı Bulunamadı!';
    let kontrol2 = xp ? xp : '4 (Varsayılan)';
    let kontrol3 = seviyerol ? `<@&${seviyerol}>` : 'Seviye Rol Sistemi Aktif Değil!';

    const seviyeEmbed = new EmbedBuilder()
        .setTitle('🦁 LND Bot | Sistem Aktif Edildi!')
        .setDescription(`**${message.guild.name}** sunucusunda seviye sistemini başarıyla aktifleştirdim!\nGenel ayarlar aşağıda belirtilmiştir:`)
        .addFields(
            { name: '📍 Seviye Log Kanalı:', value: kontrol, inline: true },
            { name: '✨ Mesaj Başı XP:', value: String(kontrol2), inline: true },
            { name: '🎭 Seviye Rolü:', value: kontrol3, inline: false }
        )
        .setFooter({ text: 'LND Bot Seviye Sistemi!', iconURL: client.user.displayAvatarURL() })
        .setColor('Random')
        .setTimestamp();

    // Kanalda bilgilendirme mesajı
    await message.channel.send({ embeds: [seviyeEmbed] });

    // Sunucu sahibine DM yoluyla bilgi verme (v14 fetchOwner yapısı)
    try {
        const owner = await message.guild.fetchOwner();
        owner.send(`📢 Seviye sistemi **${message.author.tag}** (${message.author.id}) tarafından aktifleştirildi!\n\`LND Bot Seviye Sistemi\``).catch(() => {});
    } catch (e) {
        console.log("Sunucu sahibine DM gönderilemedi.");
    }

    // Sistemi veritabanında aktif et
    db.set(`seviyeacik_${message.guild.id}`, 'açık');
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['seviyeaç', 'level-on'],
    permLevel: 3 // Sunucuyu Yönet / Admin seviyesi
};

exports.help = {
    name: 'seviye-aç',
    kategori: 'yetkili',
    description: 'Sunucudaki seviye sistemini aktif eder.',
    usage: 'seviye-aç'
};