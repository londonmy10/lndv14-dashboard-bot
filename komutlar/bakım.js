const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const ayarlar = require("../ayarlar.json");

exports.run = async (client, message, args) => {
  // Yapımcı Kontrolü
  if (message.author.id !== ayarlar.sahip) {
    const embed = new EmbedBuilder()
      .setDescription(`**:x: Bu Komut Yapımcıma Özeldir!**`)
      .setColor('Blue');
    return message.channel.send({ embeds: [embed] }).then(msg => {
      setTimeout(() => msg.delete(), 3000);
    });
  }

  // Bakım Modunu Açma
  if (args[0] === "aç") {
    let sebep = args.slice(1).join(' ');
    if (!sebep) {
      return message.channel.send('❌ Lütfen bakım modu sebebini belirtin!');
    }
    
    db.set('bakim_modu', sebep);
    return message.channel.send(`✅ **Bakım modu başarıyla açıldı.** \nSebep: \`${sebep}\``);
  } 
  
  // Bakım Modunu Kapatma
  else if (args[0] === "kapat") {
    db.delete('bakim_modu');
    return message.channel.send("✅ **Bakım modu kapatıldı.** Bot artık herkes tarafından kullanılabilir.");
  } 
  
  // Geçersiz Kullanım
  else {
    return message.reply("Lütfen geçerli bir seçenek belirtin: `bakım aç <sebep>` veya `bakım kapat`.");
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'bakım',
  kategori: 'yapımcı',
  description: 'Botu bakım moduna alır veya bakımdan çıkarır.',
  usage: 'bakım <aç/kapat> [sebep]'
};