const { EmbedBuilder } = require("discord.js");

module.exports.run = async (client, message, args) => {
    try {
        // Tüm komut isimlerini alıp aralarına ' | ' ekleyerek birleştiriyoruz
        const komutListesi = client.commands.map(props => `\`${props.help.name}\``).join(" | ");

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setAuthor({ 
                name: `${client.user.username} - Tüm Komutlar`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setTitle("📜 Bot Komut Listesi")
            .setDescription(komutListesi)
            .setFooter({ 
                text: `Toplam ${client.commands.size} komut bulunuyor.`, 
                iconURL: message.author.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    } catch (e) {
        console.error("Komutlar listelenirken hata oluştu:", e);
        return message.channel.send("❌ Komut listesi alınırken bir teknik hata oluştu.");
    }
}

module.exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["commands", "tüm-komutlar"],
    permLevel: 0 // Herkesin görebilmesi için 0 yaptım, istersen 4'te bırakabilirsin
};

module.exports.help = {
    name: 'komutlar',
    kategori: 'genel',
    description: 'Botta bulunan tüm komutları şık bir liste halinde gösterir.',
    usage: 'komutlar'
};