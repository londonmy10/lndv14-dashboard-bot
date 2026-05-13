const { EmbedBuilder } = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args) => {
  if (message.author.id !== message.guild.ownerId) return message.reply('❌ Bu komutu sadece sunucu sahibi kullanabilir!');

  const rol = message.mentions.roles.first();
  if (!rol) return message.reply('❌ Bancı yetkisini kime vereceğiz? Bir rol etiketlemelisin. \nÖrn: `&yasaklama-yetkilisi @BanSorumlusu`');

  db.set(`yasaklamaRol_${message.guild.id}`, rol.id);
  
  return message.channel.send(`✅ **${rol.name}** rolüne sahip olanlar artık \`&ban\` komutunu kullanabilecek. Dikkatli ol!`);
};

exports.conf = { enabled: true, guildOnly: true, aliases: ['ban-yetkilisi'], permLevel: 3 };
exports.help = { name: 'yasaklama-yetkilisi', kategori: 'sunucu' };