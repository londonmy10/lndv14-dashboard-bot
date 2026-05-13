const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args) => {
    const queue = client.distube.getQueue(message);
    
    if (!queue) {
        return message.reply("❌ Şu an çalma listesi boş, bir şeyler eklemeyi dene!");
    }

    // İlk 10 şarkıyı listeler (Sayfa çok uzamasın diye)
    const q = queue.songs
        .map((song, i) => `${i === 0 ? "▶️ **Şu an çalan:**" : `**${i}.**`} ${song.name} - \`${song.formattedDuration}\``)
        .slice(0, 10)
        .join("\n");

    const embed = new EmbedBuilder()
        .setColor("#fdb912")
        .setTitle("🎶 Mevcut Şarkı Listesi")
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(q)
        .addFields({ 
            name: "📊 Liste Bilgisi", 
            value: `Kuyrukta toplam **${queue.songs.length}** şarkı var. | Ses seviyesi: \`%${queue.volume}\`` 
        })
        .setFooter({ text: 'Legends Never Die - Müzik Kuyruğu', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["sıra", "liste", "kuyruk"],
    permLevel: 0
};

exports.help = {
    name: 'queue',
    description: 'Mevcut şarkı listesini gösterir.',
    kategori: 'müzik'
};