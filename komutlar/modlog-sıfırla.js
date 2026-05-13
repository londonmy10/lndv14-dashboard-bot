const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb'); // Projende quick.db kullanıyorsan öyle bırakabilirsin

exports.run = async (client, message, args) => {
    
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply(`❌ **Bunu yapabilmek için "Yönetici" yetkisine sahip olmalısın!**`);
    }

    const prefix = client.ayarlar.prefix;
    let modlogs = db.get(`modlogkanaly_${message.guild.id}`);

    // Veritabanında kayıt yoksa uyarı ver
    if (!modlogs) {
        const hataEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`⚠️ **Bu sunucuda zaten ayarlanmış bir mod-log kanalı bulunmuyor.** \n\n> **Ayarlamak için:** \`${prefix}mod-log <#kanal>\``);
        
        return message.channel.send({ embeds: [hataEmbed] });
    }

    // Veritabanı kaydını sil
    db.delete(`modlogkanaly_${message.guild.id}`);

    const basariEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ İşlem Başarılı")
        .setDescription(`> **Mod-log kanalı başarıyla sıfırlandı.** \nArtık moderasyon kayıtları tutulmayacak.`)
        .setFooter({ text: "LND Bot Moderasyon Sistemi", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    return message.channel.send({ embeds: [basariEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["modlog-sıfırla", "modlog-kapat"],
    permLevel: 3 // Sunucuyu Yönet / Admin seviyesi
};

exports.help = {
    name: 'modlog-sıfırla',
    kategori: 'yetkili',
    description: 'Ayarlanmış olan mod-log kanalını sıfırlar.',
    usage: 'modlog-sıfırla'
};