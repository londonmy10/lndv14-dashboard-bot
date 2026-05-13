const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    
    // SNIPE VERİSİNİ ÇEK
    const data = db.get(`snipe.id.${message.guild.id}`);
    
    if (!data || !data.icerik) {
        return message.reply("Bu kanalda yakın zamanda silinmiş bir mesaj bulunamadı! 🦁");
    }

    const user = await client.users.fetch(data.yazar).catch(() => null);

    const embed = new EmbedBuilder()
        .setAuthor({ 
            name: user ? user.tag : 'Bilinmeyen Kullanıcı', 
            iconURL: user ? user.displayAvatarURL({ dynamic: true }) : null 
        })
        .setDescription(`🗑️ **Son silinen mesaj:**\n\`\`\`${data.icerik}\`\`\``)
        .setColor('#F3C7E1')
        .setFooter({ text: 'Legends Never Die - Snipe Sistemi' })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['sonmesaj'],
    permLevel: 0
};

exports.help = {
    name: 'snipe',
    description: 'Son silinen mesajı gösterir.',
    usage: 'snipe'
};