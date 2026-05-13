const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('croxydb'); // Projende quick.db varsa ona göre güncelleyebilirsin

exports.run = async (client, message, args) => {
    // Özel Mesaj (DM) Kontrolü
    if (message.channel.type === ChannelType.DM) {
        return message.reply("❌ Bu komutu sadece sunucularda kullanabilirsin.");
    }

    // Yetki Kontrolü (Sunucuyu Yönet)
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('❌ Bu komutu kullanabilmek için `Sunucuyu Yönet` yetkisine sahip olmalısın!');
    }

    let mesaj = args.join(' ');
    
    // Değer belirtilmemişse
    if (!mesaj) {
        const kullanimEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("⚠️ Eksik Değer")
            .setDescription("Ototag ayarlamak için bir değer belirtmelisiniz.\n\n**Örnek:** `&ototag ✥` veya `&ototag LND |` \n**Sıfırlamak için:** `&ototag-sıfırla`")
            .setFooter({ text: "LND Bot Ototag Sistemi" });
        
        return message.channel.send({ embeds: [kullanimEmbed] });
    }

    // Veritabanına kaydet
    db.set(`ototag_${message.guild.id}`, mesaj);

    // Başarı Mesajı
    const basariEmbed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTitle("✅ Ototag Ayarlandı")
        .setDescription(`Sunucunuza yeni katılan üyelerin başına otomatik olarak eklenecek tag: \`${mesaj}\` olarak belirlenmiştir.`)
        .setFooter({ text: "Legends Never Die", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [basariEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['oto-tag', 'tag-ayarla'],
    permLevel: 3 // Sunucuyu Yönet/Yönetici
};

exports.help = {
    name: 'ototag',
    kategori: 'yetkili',
    description: 'Sunucuya yeni katılanlara otomatik tag verir.',
    usage: 'ototag <tag>'
};