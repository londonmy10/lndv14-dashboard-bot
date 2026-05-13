const { EmbedBuilder, ActivityType } = require('discord.js');

module.exports.run = async (client, message, args) => {
    // Etiketlenen kullanıcıyı veya mesaj sahibini al
    let user = message.mentions.users.first() || message.author;

    // v14'te presence verisine ulaşmak için kullanıcının sunucudaki üye objesini çekmeliyiz
    let member = message.guild.members.cache.get(user.id);

    // Kullanıcının presence (durum) verisi yoksa veya aktivitesi boşsa
    if (!member.presence || !member.presence.activities.length) {
        return message.channel.send(`**${user.tag}** şu anda herhangi bir aktivitede bulunmuyor.`);
    }

    // Aktiviteler arasından Spotify'ı bul (Type 2 veya Listening)
    const spotify = member.presence.activities.find(x => x.name === 'Spotify' && x.type === ActivityType.Listening);

    if (spotify) {
        try {
            // Şarkı bilgilerini çekme
            const trackName = spotify.details; // Şarkı Adı
            const trackAuthor = spotify.state; // Sanatçı
            const trackAlbum = spotify.assets.largeText; // Albüm Adı
            const trackId = spotify.syncId; // Spotify Şarkı ID
            
            // Spotify Kapak Resmi URL'si oluşturma
            const imageId = spotify.assets.largeImage.split(':')[1];
            const trackImg = `https://i.scdn.co/image/${imageId}`;
            const trackUrl = `https://open.spotify.com/track/${trackId}`;

            const embed = new EmbedBuilder()
                .setAuthor({ 
                    name: 'Spotify Şarkı Bilgisi', 
                    iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2000px-Spotify_logo_without_text.svg.png' 
                })
                .setColor(0x1DB954) // Spotify Yeşili
                .setThumbnail(trackImg)
                .setDescription(`
                    🎶 **Şarkı:** [${trackName}](${trackUrl})
                    👤 **Sanatçı:** ${trackAuthor}
                    💿 **Albüm:** ${trackAlbum}
                `)
                .addFields({ name: 'Spotify\'da Dinle', value: `**[Şarkıya Gitmek İçin Tıkla](${trackUrl})**`, inline: false })
                .setFooter({ 
                    text: `Legends Never Die Spotify Sistemi • ${message.author.username} tarafından istendi.`, 
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return message.channel.send(`**${user.tag}** kullanıcısının Spotify bilgileri çekilirken bir hata oluştu.`);
        }
    } else {
        return message.channel.send(`**${user.tag}** şu anda Spotify üzerinden bir şey dinlemiyor.`);
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['spo', 'spoti', 'spotifyy'],
    permLevel: 0
};

exports.help = {
    name: 'spotify',
    kategori: 'genel',
    description: 'Kullanıcının dinlediği Spotify şarkısını gösterir.',
    usage: 'spotify [@kullanıcı]'
};