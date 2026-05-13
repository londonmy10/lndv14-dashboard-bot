const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args) => {
    const queue = client.distube.getQueue(message);
    
    if (!queue) {
        return message.reply("❌ Şu an çalan bir şey yok, devam ettirecek bir şarkı bulamıyorum!");
    }

    if (!queue.paused) {
        return message.reply("⚠️ Şarkı zaten akıyor, durdurulmamış!");
    }

    try {
        client.distube.resume(message);
        
        const embed = new EmbedBuilder()
            .setColor("#fdb912")
            .setTitle("▶️ Müzik Devam Ediyor")
            .setDescription(`**[${queue.songs[0].name}](${queue.songs[0].url})** kaldığı yerden devam ediyor.`)
            .setFooter({ text: 'Legends Never Die - Müzik Sistemi' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    } catch (err) {
        return message.reply("❌ Bir gıcıklık çıktı, devam ettiremiyorum.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["devam", "sürdür"],
    permLevel: 0
};

exports.help = {
    name: 'resume',
    description: 'Duraklatılan şarkıyı devam ettirir.',
    kategori: 'müzik'
};