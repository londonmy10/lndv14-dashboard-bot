exports.run = async (client, message, args) => {
    const queue = client.distube.getQueue(message);
    if (!queue) return message.reply("❌ Şu an çalan bir şey yok, geçilecek bir şarkı da yok!");

    try {
        await queue.skip();
        message.reply("⏭️ Şarkı geçildi!");
    } catch (e) {
        message.reply("❌ Sıradaki şarkı bulunamadı.");
    }
};

exports.conf = { enabled: true, guildOnly: true, aliases: ["s", "geç"], permLevel: 0 };
exports.help = { name: "skip", kategori: "müzik" };