const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args) => {
    const kanal = message.member.voice.channel;
    if (!kanal) return message.reply("❌ Önce bir ses kanalına girmen lazım!");
    
    const sarki = args.join(" ");
    if (!sarki) return message.reply("🎵 Hangi şarkıyı patlatalım? Bir isim veya link yaz.");

    client.distube.play(kanal, sarki, {
        member: message.member,
        textChannel: message.channel,
        message
    });

    message.reply(`🔍 **${sarki}** aranıyor ve listeye ekleniyor...`);
};

exports.conf = { enabled: true, guildOnly: true, aliases: ["p", "çal"], permLevel: 0 };
exports.help = { name: "play", kategori: "müzik", description: "Şarkı çalar.", usage: "play [isim/link]" };