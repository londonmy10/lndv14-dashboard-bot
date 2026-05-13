const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message) => {
    const promises = [
        client.shard.fetchClientValues('guilds.cache.size'),
        client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        client.shard.fetchClientValues('ws.ping')
    ];

    const results = await Promise.all(promises);
    const totalGuilds = results[0].reduce((acc, count) => acc + count, 0);
    const totalMembers = results[1].reduce((acc, count) => acc + count, 0);

    const embed = new EmbedBuilder()
        .setTitle('💎 Shard Bilgileri')
        .setColor('Red')
        .setFooter({ text: `Mevcut Shard: ${client.shard.ids[0] + 1}` });

    results[0].forEach((guildCount, index) => {
        embed.addFields({
            name: `Shard ${index + 1}`,
            value: `🏠 Sunucu: ${guildCount}\n👥 Üye: ${results[1][index]}\n📡 Ping: ${results[2][index]}ms`,
            inline: true
        });
    });

    return message.channel.send({ embeds: [embed] });
};

exports.conf = { enabled: true, guildOnly: false, aliases: ['shard'], permLevel: 0 };
exports.help = { name: 'shard-bilgi', kategori: 'yapımcı' };