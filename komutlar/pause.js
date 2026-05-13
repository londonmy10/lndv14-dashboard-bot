const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args) => {
    const queue = client.distube.getQueue(message);
    
    if (!queue) {
        return message.reply("❌ Şu an çalan bir şey yok, duraklatacak bir şey de yok!");
    }

    if (queue.paused) {
        return message.reply("⚠️ Şarkı zaten duraklatılmış, bekliyor.");
    }

    try {
        client.distube.pause(message);
        
        const embed = new EmbedBuilder()
            .setColor("#fdb912") // Galatasaray sarısı
            .setTitle("⏸️ Müzik Duraklatıldı")
            .setDescription(`**[${queue.songs[0].name}](${queue.songs[0].url})** şu an beklemeye alındı.`)
            .setFooter({ text: 'Legends Never Die - Devam ettirmek için &resume yazabilirsin.' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    } catch (err) {
        return message.reply("❌ Bir gıcıklık çıktı, duraklatamıyorum.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["beklet", "durdur", "stop"],
    permLevel: 0
};

exports.help = {
    name: 'pause',
    description: 'Çalan şarkıyı duraklatır.',
    kategori: 'müzik'
};