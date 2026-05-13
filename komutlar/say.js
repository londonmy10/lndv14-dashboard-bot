const { EmbedBuilder } = require("discord.js");

const mapping = {
  " ": "   ",
  "0": "<a:sfr:729286531818192956>", "1": "<a:bir:729286555050442822>",
  "2": "<a:iki:729286572859588660>", "3": "<a:uc:729286583290691605>",
  "4": "<a:drt:729286597820022804>", "5": "<a:be:729286611803570246>",
  "6": "<a:alt:729286629381898301>", "7": "<a:yedi:729286654753505290>",
  "8": "<a:sekiz:729286667374166066>", "9": "<a:dokuz:729286681760497674>"
};

exports.run = async (client, message, args) => {
  const toplam = message.guild.memberCount;
  const onlinesayi = message.guild.members.cache.filter(m => m.presence && m.presence.status !== "offline").size;
  const offlinesayi = toplam - onlinesayi;

  const sayıyaÇevir = (sayı) => sayı.toString().split("").map(c => mapping[c] || c).join(" ");

  const embed = new EmbedBuilder()
    .setTitle('<a:mavikalp:737955019160289361> __Sunucu İstatistikleri__ <a:mavikalp:737955019160289361>')
    .setColor('Black')
    .setDescription(`
      **Sunucudaki Kişi Sayısı**: ${sayıyaÇevir(toplam)}
      **Çevrimiçi Kişi Sayısı:** ${sayıyaÇevir(onlinesayi)}
      **Çevrimdışı Kişi Sayısı:** ${sayıyaÇevir(offlinesayi)}
    `)
    .setImage("https://cdn.discordapp.com/attachments/603560726384214036/603562943577063469/ReliableSickHarpyeagle-max-1mb.gif")
    .setFooter({ text: `İsteyen: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

  return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: true, aliases: ["onlinesayi"], permLevel: 0 };
exports.help = { name: "say", kategori: 'genel' };