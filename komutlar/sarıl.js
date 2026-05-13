const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args) => {
    const gifler = [
        "https://media.giphy.com/media/3VEFW2uWzO3kY/giphy.gif",
        "https://media1.tenor.com/images/77eb2d5e86e552f0b938e3766fcbefb2/tenor.gif",
        "https://media1.tenor.com/images/23547c466df7d691ae28f0df5e25be2e/tenor.gif"
    ];
    const resim = gifler[Math.floor(Math.random() * gifler.length)];
    
    let user = message.mentions.users.first();
    if (!user) return message.reply("🫂 Kime sarılmak istersin?");
    if (user.id === message.author.id) return message.reply("Kendine sarılacak kadar yalnız mısın? 😟");

    const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(`🤗 **${message.author.username}**, **${user.username}** kullanıcısına sımsıkı sarıldı!`)
        .setImage(resim);

    return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: false, aliases: [], permLevel: 0 };
exports.help = { name: "sarıl", kategori: 'eğlence' };