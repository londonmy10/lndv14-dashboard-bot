// Snipe sistemi için gerekli olan kod
const db = require("croxydb");

module.exports = async (client, message) => {
    // Botların sildiği mesajları veya boş mesajları kaydetmeyelim
    if (message.author?.bot || !message.content) return;

    db.set(`snipe.id.${message.guild.id}`, {
        icerik: message.content,
        yazar: message.author.id,
        kanal: message.channel.id,
        tarih: Date.now()
    });
};