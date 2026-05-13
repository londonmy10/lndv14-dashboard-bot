const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message, args) => {
    // İlk ölçüm için mesaj gönderiyoruz
    const başlangıç = Date.now();
    
    var olcum = await message.channel.send('📊 Ölçüm yapılıyor, lütfen bekleyiniz...');

    // Veri alındı mesajını gönderip hemen siliyoruz (v14 tarzı delete)
    await message.channel.send("📥 Veriler alındı...").then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 2000);
    });

    const bitiş = Date.now();
    const mesajGecikmesi = bitiş - başlangıç;
    const apiGecikmesi = Math.round(client.ws.ping);

    // Sonucu Embed ile yakışıklı bir şekilde gösterelim
    const pingEmbed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle("⚡ Legends Never Die - Gecikme Değerleri")
        .addFields(
            { name: '⌛ Mesaj Gecikmesi', value: `\`${mesajGecikmesi}ms\``, inline: true },
            { name: '🌐 API Gecikmesi', value: `\`${apiGecikmesi}ms\``, inline: true }
        )
        .setFooter({ text: `Sorgulayan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    await olcum.edit({ content: null, embeds: [pingEmbed] });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['gecikme', 'p'],
    permLevel: 0
};

exports.help = {
    name: 'ping',
    kategori: 'genel',
    description: 'Botun gecikme sürelerini gösterir.',
    usage: 'ping'
};