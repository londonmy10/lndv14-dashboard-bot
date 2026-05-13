const { EmbedBuilder } = require("discord.js");
const loglar = require("../loglar.json");

var prefix = loglar.prefix;

exports.run = async (client, message, args) => {
    // v14 EmbedBuilder Yapısı
    const yardım = new EmbedBuilder()
        .setColor(0x36393e)
        .setAuthor({ 
            name: `LND Bot`, 
            iconURL: client.user.displayAvatarURL() 
        })
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: "🔗 Linkler", value: `Destek Sunucusu [TIKLA](https://discord.gg/7T2FNXaUZx)` }
        )
        .setFooter({ 
            text: `${message.author.username} tarafından istendi.`, 
            iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();

    // v14'te sendEmbed yerine embeds dizisi kullanılır
    return message.channel.send({ embeds: [yardım] }).catch(err => {
        console.error("Destek komutu hatası:", err);
    });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["sunucu", "destek-sunucusu"],
    permLevel: 0
};

exports.help = {
    name: "destek",
    kategori: 'genel', // bot.js yükleyicisiyle uyumlu
    description: "Botun destek sunucusu linkini gösterir.",
    usage: "destek"
};