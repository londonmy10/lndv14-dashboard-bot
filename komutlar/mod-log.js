const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb'); // Projende quick.db varsa const db = require('quick.db') yapabilirsin

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply(`❌ **Bunu yapabilmek için "Yönetici" yetkisine sahip olmalısın!**`);
    }

    const prefix = client.ayarlar.prefix; // Ayarları client üzerinden veya require ile alabilirsin
    let modlogs = db.get(`modlogkanaly_${message.guild.id}`);

    if (!modlogs) {
        let kanal = message.mentions.channels.first();
        if (!kanal) {
            return message.reply(`⚠️ **Lütfen bir kanal etiketleyiniz!** \n> **Doğru Kullanım:** \`${prefix}mod-log <#kanal>\``);
        }

        // Veritabanına kaydetme
        db.set(`modlogkanaly_${message.guild.id}`, kanal.id);

        const basariEmbed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ **Mod-log kanalı başarılı bir şekilde ${kanal} olarak ayarlandı.**`)
            .setTimestamp();

        return message.channel.send({ embeds: [basariEmbed] });

    } else {
        // Kanal veritabanında varsa cache'den buluyoruz
        const modlogkanal = message.guild.channels.cache.get(modlogs);
        
        // Eğer kanal silinmişse veriyi sıfırla ve yeniden ayarla uyarısı ver
        if (!modlogkanal) {
            db.delete(`modlogkanaly_${message.guild.id}`);
            return message.channel.send(`⚠️ **Daha önce ayarlı olan kanal sunucuda bulunamadı (silinmiş olabilir). Lütfen komutu tekrar kullanarak yeni bir kanal ayarlayın.**`);
        }

        const uyariEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("⚠️ Zaten Ayarlı")
            .setDescription(`Bu sunucuda mod-log kanalı zaten ayarlanmış.\n\n**Ayarlı Kanal:** \`#${modlogkanal.name}\`\n**Sıfırlamak için:** \`${prefix}modlog-sıfırla\``)
            .setFooter({ text: "Legends Never Die" });

        return message.channel.send({ embeds: [uyariEmbed] });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['modlog', 'log-ayarla'],
    permLevel: 3 // Sunucuyu Yönet / Admin seviyesi
};

exports.help = {
    name: 'mod-log',
    kategori: 'yetkili',
    description: 'Moderasyon işlemlerinin kaydedileceği log kanalını belirler.',
    usage: 'mod-log <#kanal>'
};