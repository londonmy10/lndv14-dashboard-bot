const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Özel Mesaj (DM) Kontrolü
    if (message.channel.type === ChannelType.DM) {
        return message.reply("❌ Bu komutu sadece sunucularda kullanabilirsin.");
    }

    // Yetki Kontrolü (Yönetici)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('❌ Otomatik tag log kanalını ayarlamak için `YÖNETİCİ` yetkisine sahip olmalısın!');
    }

    // Kanal Etiketleme Kontrolü
    let otoTagKanal = message.mentions.channels.first();
    if (!otoTagKanal) {
        return message.reply('❌ Otomatik tag log kanalını ayarlamak için bir kanal etiketlemelisin! \nÖrnek: `&ototagkanal #kanal`');
    }

    // Veritabanına Kaydetme (croxydb yapısı)
    db.set(`ototagKanal_${message.guild.id}`, otoTagKanal.id);

    // Başarı Embed'i
    const basariEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Ototag Kanalı Ayarlandı")
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setDescription(`Sunucunuzda yeni katılanlara tag verildiğinde bilgilendirme mesajları artık ${otoTagKanal} kanalına gönderilecektir.`)
        .setFooter({ text: "LND Bot Ototag Sistemi", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [basariEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['ototag-log', 'ototag-kanal'],
    permLevel: 3 // Yönetici/Sunucuyu Yönet
};

exports.help = {
    name: 'ototagkanal',
    kategori: 'yetkili',
    description: 'Otomatik tag verildiğinde bildirim gidecek kanalı ayarlar.',
    usage: 'ototagkanal #kanal'
};