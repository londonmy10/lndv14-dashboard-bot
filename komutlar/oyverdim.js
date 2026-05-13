const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args) => {
  // Komutun içeriği buraya gelecek
  // Örnek bir kullanım:
  const embed = new EmbedBuilder()
    .setTitle("Oy Verme Sistemi")
    .setDescription("Botumuza oy verdiğiniz için teşekkürler!")
    .setColor("Green")
    .setFooter({ text: `${message.author.tag} tarafından kullanıldı.` });

  return message.channel.send({ embeds: [embed] });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['oy-ver'],
  permLevel: 0
};

exports.help = {
  name: 'oyverdim',
  kategori: 'genel'
};