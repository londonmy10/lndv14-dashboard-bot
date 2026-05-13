const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

exports.run = async (client, message) => {
    let sayac = JSON.parse(fs.readFileSync("./ayarlar/sayac.json", "utf8"));
    if (!sayac[message.guild.id]) return message.reply("❌ Ayarlanmış bir sayaç bulunmuyor!");

    delete sayac[message.guild.id];
    fs.writeFileSync("./ayarlar/sayac.json", JSON.stringify(sayac, null, 2));

    const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription(`✅ Sayaç sistemi başarıyla sıfırlandı.`)
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: true, aliases: ['sayaçsıfırla'], permLevel: 3 };
exports.help = { name: 'sayaç-sıfırla', kategori: 'yetkili' };