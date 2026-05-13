const db = require('quick.db');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message, args) => {
  // Sadece senin (yapımcının) kullanabilmesi için kontrol
  if (message.author.id !== ayarlar.sahip) {
    return message.reply("❌ Bu komut yapımcıma özeldir.");
  }

  let nesne = args[0];
  if (!nesne) return message.channel.send('❌ Gold üyeliği alınacak kullanıcının IDsini girmelisin.');

  // Veritabanından gold durumunu siliyoruz
  db.delete(`gold_${nesne}`);
  
  return message.channel.send(`✅ **${nesne}** IDli kullanıcı artık Gold Üye listesinde değil.`);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['gold-çıkar', 'gold-sil'],
  permLevel: 4
};

exports.help = {
  name: 'goldçıkar',
  kategori: 'yapımcı',
  description: 'Kullanıcıyı gold üye listesinden çıkarır.',
  usage: 'goldçıkar <ID>'
};