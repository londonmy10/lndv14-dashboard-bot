const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args) => {
    const queue = client.distube.getQueue(message);
    
    if (!queue) {
        return message.reply("❌ Zaten şu an bir şey çalmıyor, durduracak bir şey yok!");
    }

    try {
        client.distube.stop(message);
        
        const embed = new EmbedBuilder()
            .setColor("#ce1126") 
            .setTitle("🛑 Müzik Kapatıldı")
            .setDescription(`Çalma listesi temizlendi ve ses kanalından ayrıldı.`)
            .setFooter({ text: 'Legends Never Die - dinlenmeye çekildi.' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    } catch (err) {
        // Bazen stop komutu kanal boşsa hata verebilir, onu yakalıyoruz
        return message.reply("❌ Bir gıcıklık çıktı ama müzik zaten durmuş olabilir.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["dur", "dc", "kapat", "ayrıl", "leave"],
    permLevel: 0
};

exports.help = {
    name: 'stop',
    description: 'Müziği tamamen kapatır, kuyruğu siler ve bot kanaldan çıkar.',
    kategori: 'müzik'
};