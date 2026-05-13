const { EmbedBuilder } = require("discord.js");
const db = require('croxydb'); // Sisteminle uyumlu hale getirildi

exports.run = async (client, message, args) => {
    
    // Kullanıcı ID kontrolü
    let user = client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null);
    if (!user) return message.reply("Lütfen kara listeden çıkarılacak geçerli bir kullanıcı ID yaz reis! 🦁");

    // Veritabanından silme işlemi
    db.delete(`karalist_${user.id}`);
    
    const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: 'LND Yapımcı Sistemi', iconURL: client.user.displayAvatarURL() })
        .setDescription(`✅ **${user.tag}** adlı kullanıcı başarıyla kara listeden çıkartıldı! Artık botu aslanlar gibi kullanabilir.`)
        .setFooter({ text: 'Legends Never Die', iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
    
    return message.channel.send({ embeds: [embed] });
};

exports.conf = { 
    enabled: true, 
    guildOnly: false, 
    aliases: ["whitelist", "ak-liste"], 
    permLevel: 4 // Sadece yapımcı seviyesi kullanabilir
};

exports.help = { 
    name: "beyazliste",
    kategori: "yapımcı", 
    description: "Belirtilen kullanıcıyı kara listeden mermi gibi çıkartır.",
    usage: "beyazliste [ID]"
};