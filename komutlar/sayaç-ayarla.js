const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

exports.run = async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply("❌ Yetkin yetersiz!");

    let profil = JSON.parse(fs.readFileSync("./ayarlar/sayac.json", "utf8"));
    let sayi = args[0];
    let kanal = message.mentions.channels.first();

    if (!sayi || isNaN(sayi)) return message.reply("❌ Geçerli bir sayı belirtmelisin!");
    if (!kanal) return message.reply("❌ Bir sayaç kanalı etiketlemelisin!");
    if (sayi <= message.guild.memberCount) return message.reply(`❌ Belirlediğin sayı sunucu mevcudundan (${message.guild.memberCount}) yüksek olmalı!`);

    profil[message.guild.id] = { sayi: sayi, kanal: kanal.id };
    fs.writeFileSync("./ayarlar/sayac.json", JSON.stringify(profil, null, 2));

    const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ Sayaç hedefi **${sayi}**, kanalı ise ${kanal} olarak ayarlandı!`)
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: true, aliases: [], permLevel: 3 };
exports.help = { name: 'sayaç-ayarla', kategori: 'yetkili' };