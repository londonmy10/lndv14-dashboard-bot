const { EmbedBuilder } = require('discord.js');
const ayarlar = require('../ayarlar.json');

exports.run = (client, message, args) => {
    // v14 EmbedBuilder Yapısı
    const embed = new EmbedBuilder()
        .setAuthor({ 
            name: `${client.user.username}`, 
            iconURL: client.user.displayAvatarURL() 
        })
        .setTitle(`${client.user.username} - Davet Bilgileri`)
        .addFields(
            { name: "👨‍💻 Yapımcım", value: "<@351695051962843136>", inline: true }
        )
        .setDescription(
            `📥 **Botun Davet Linki** [TIKLA](https://discordapp.com/oauth2/authorize?client_id=659809412805820436&scope=bot&permissions=2146958847)\n` +
            `🔶 **Destek Sunucusu** [TIKLA](https://discord.gg/7T2FNXaUZx)\n` +
            `🎯 **DBL Sayfası** [TIKLA](https://discord.bots.gg/bots/659809412805820436)`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ 
            text: `${message.author.username} Başarıyla ${ayarlar.prefix}Davet Sistemini Kullandı!`, 
            iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        })
        .setColor('Green')
        .setTimestamp();

    // v14'te mesaj gönderme protokolü
    return message.channel.send({ embeds: [embed] }).catch(err => {
        console.error("Davet komutu hatası:", err);
    });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['davet-et', 'bot-davet'],
    permLevel: 0 // Herkes kullanabilir
};

exports.help = {
    name: 'davet',
    kategori: 'genel', // bot.js yükleyicisiyle uyumlu
    description: 'Botun davet linklerini gösterir.',
    usage: 'davet'
};