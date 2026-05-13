const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Sahip Kontrolü (Senin ID'n: 351695051962843136)
    if (message.author.id !== "351695051962843136") { 
        return message.channel.send("❌ Bu komut sadece sahibime özeldir.");
    }

    // Şahıs Kontrolü
    let sahis = message.mentions.users.first() || client.users.cache.get(args[0]);

    if (!sahis) {
        return message.channel.send('❌ Gold üye yapılacak şahsı etiketlemelisin veya ID yazmalısın.');
    }

    // Gold Üye Durumu Kontrolü
    let kontrol = db.get(`gold_${sahis.id}`);
    if (kontrol) {
        return message.reply("⚠️ Bu kullanıcı zaten bir Gold Üye!");
    }

    // Veritabanına Kaydet
    db.set(`gold_${sahis.id}`, 'acik');

    const embed = new EmbedBuilder()
        .setTitle("✨ Yeni Gold Üye!")
        .setDescription(`🎉 ${sahis} kullanıcısı başarıyla **Gold Üye** yapıldı!`)
        .setThumbnail(sahis.displayAvatarURL({ dynamic: true }))
        .setColor("Gold")
        .setFooter({ text: "Legends Never Die Gold Sistemi" })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['gold-yap', 'gyap'],
    permLevel: 4 // bot.js içindeki elevation yapısına uygun (Yapımcı Seviyesi)
};

exports.help = {
    name: 'goldyap',
    kategori: 'yapımcı',
    description: 'Belirtilen kullanıcıyı gold üye yapar.',
    usage: 'goldyap @etiket'
};