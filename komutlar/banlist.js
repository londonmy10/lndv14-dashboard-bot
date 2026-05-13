const { EmbedBuilder } = require('discord.js');

exports.run = async (bot, message, args) => {
    try {
        // v14'te banları çekme yöntemi
        const bans = await message.guild.bans.fetch();

        if (bans.size === 0) {
            const embed = new EmbedBuilder()
                .setTitle(`<a:banned:679718784524746848> Banlanan Kullanıcı Bulunamadı`)
                .setColor("Blue")
                .setTimestamp();
            
            return message.channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        } else {
            const embed = new EmbedBuilder()
                .setTitle("<a:banned:679718784524746848> Ban Listesi: Sunucudan Banlananlar")
                .setColor("Red")
                .setTimestamp();

            // v14'te koleksiyon üzerinde döngü kurma
            bans.forEach(ban => {
                embed.addFields({ 
                    name: `👤 ${ban.user.tag}`, 
                    value: `**ID:** \`${ban.user.id}\` ${ban.reason ? `\n**Sebep:** ${ban.reason}` : ''}`,
                    inline: false 
                });
            });

            return message.channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete(), 10000); // Liste uzun olabileceği için süreyi artırdım
            });
        }
    } catch (err) {
        console.error(err);
        return message.reply("Ban listesi çekilirken bir hata oluştu. Yetkim olduğundan emin olun.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true, // Ban listesi sadece sunucuda çalışır
    aliases: ["banlılar", "banliste", "ban-liste"],
    permLevel: 0 // bot.js içindeki elevation yapısına uygun
};

exports.help = {
    name: 'banlist',
    kategori: 'yetkili', // bot.js yükleyicisiyle uyumlu
    description: 'Sunucudan banlanan üyeleri gösterir.',
    usage: 'banlist'
};