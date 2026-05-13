const { EmbedBuilder } = require('discord.js');
const weather = require('weather-js');

exports.run = (client, message, args) => {
    // Şehir girilmemişse uyarı ver
    if (!args[0]) {
        const hata = new EmbedBuilder()
            .setDescription('❌ Lütfen bir şehir veya bölge adı girin.')
            .setColor('Red');
        return message.channel.send({ embeds: [hata] });
    }

    weather.find({ search: args.join(" "), degreeType: 'C' }, function (err, result) {
        if (err) return message.channel.send(`❌ Bir hata oluştu: ${err}`);

        if (result === undefined || result.length === 0) {
            const lokasyonHata = new EmbedBuilder()
                .setDescription('❌ Belirttiğiniz konumu bulamadım.')
                .setColor('Red');
            return message.channel.send({ embeds: [lokasyonHata] });
        }

        var current = result[0].current;
        var location = result[0].location;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${current.observationpoint} için Hava Durumu` })
            .setDescription(`☁️ **Hava Durumu:** ${current.skytext}`)
            .setThumbnail(current.imageUrl)
            .setColor(0x00AE86)
            .addFields(
                { name: '🌐 Zaman Dilimi', value: `UTC${location.timezone}`, inline: true },
                { name: '🌡️ Derece Türü', value: location.degreetype, inline: true },
                { name: '🌡️ Sıcaklık', value: `${current.temperature} Derece`, inline: true },
                { name: '🤔 Hissedilen', value: `${current.feelslike} Derece`, inline: true },
                { name: '💨 Rüzgar', value: current.winddisplay, inline: true },
                { name: '💧 Nem', value: `%${current.humidity}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `${message.author.tag} tarafından istendi.`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        return message.channel.send({ embeds: [embed] });
    });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['hava-durumu', 'hava'],
    permLevel: 0
};

exports.help = {
    name: "havadurumu",
    kategori: 'genel',
    description: "Belirtilen bölgenin hava durumunu gösterir.",
    usage: "havadurumu <şehir>"
};