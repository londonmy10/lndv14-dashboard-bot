const { PermissionFlagsBits } = require('discord.js');

exports.run = async (client, message, args) => {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply("❌ Bu komutu kullanmak için `Mesajları Yönet` yetkin olmalı!");
  
  let mesaj = args.join(' ');
  if (mesaj.length < 1) return message.reply('❌ Bota ne yazdırmak istiyorsun?');
  
  await message.delete().catch(() => {});
  return message.channel.send(mesaj);
};

exports.conf = { enabled: true, guildOnly: false, aliases: ['say', 'söyle'], permLevel: 3 };
exports.help = { name: 'yaz', kategori: 'yetkili' };