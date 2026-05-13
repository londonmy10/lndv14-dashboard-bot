const { EmbedBuilder } = require('discord.js');

exports.run = (client, message, args) => {
    // Mesaj içeriğini kontrol etme
    let mesaj = args.slice(0).join(' ');
    
    if (mesaj.length < 1) {
        return message.reply('**<a:dance:677418198857023488> | Kime el hareketi çekeceğimi yazmalısın!**');
    }

    // v14 EmbedBuilder Yapısı
    const embed = new EmbedBuilder()
        .setColor("#36393F")
        .setAuthor({ 
            name: message.author.username, 
            iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        })
        .setDescription(`**${mesaj}, ${message.author.username} sana el hareketi çekti!**`)
        .setImage(`https://cdn.discordapp.com/attachments/527484295015563286/532187285131886592/Enys1.gif`)
        .setTimestamp()
        .setFooter({ text: 'LND Eğlence Sistemi' });

    // v14 Mesaj Gönderme Protokolü
    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['el-hareketi', 'nah'],
    permLevel: 0
};

exports.help = {
    name: 'nahçek',
    kategori: 'eğlence',
    description: 'Etiketlediğiniz kişiye sembolik bir el hareketi çeker.',
    usage: 'nahçek <@etiket/isim>'
};