module.exports = {
    conf: { aliases: ["ses"], permLevel: 0 },
    help: { name: 'volume', description: 'Ses seviyesini ayarlar.', kategori: 'müzik' },
    run: async (client, message, args) => {
        const queue = client.distube.getQueue(message);
        if (!queue) return message.reply("❌ Çalan bir şey yok.");
        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 1 || volume > 100) return message.reply("❌ 1 ile 100 arasında bir sayı yazmalısın.");
        client.distube.setVolume(message, volume);
        message.reply(`🔊 Ses seviyesi **%${volume}** olarak ayarlandı.`);
    }
};