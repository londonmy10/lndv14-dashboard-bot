const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message, args) => {
    // Etiketlenen kullanıcıyı veya mesaj sahibini belirle
    let user = message.mentions.users.first() || message.author;
    
    // Kullanıcının sunucudaki takma adını veya kullanıcı adını belirle
    let displayName = message.guild ? (message.guild.members.cache.get(user.id)?.nickname || user.username) : user.username;

    // v14 EmbedBuilder Yapısı
    const avatarEmbed = new EmbedBuilder()
        .setAuthor({ 
            name: displayName, 
            iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) 
        })
        .setColor(0x3498db) // Modern bir mavi tonu
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setFooter({ 
            text: `${message.author.tag} tarafından istendi.`, 
            iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();

    // Mesajı gönder (v14'te sendEmbed yerine embeds dizisi kullanılır)
    return message.channel.send({ embeds: [avatarEmbed] }).catch(err => {
        console.error("Avatar komutu hatası:", err);
        message.reply("Avatar gösterilirken bir hata oluştu!");
    });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['avatar', 'pp'],
    permLevel: 0 // bot.js içindeki elevation yapısına uygun
};

exports.help = {
    name: 'avatar',
    kategori: 'genel', // Kategori uyarısı almamak için "genel" olarak ayarlandı
    description: 'Etiketlediğiniz veya kendinizin profil fotosunu gösterir.',
    usage: 'avatar [@etiket]'
};