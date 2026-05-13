const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const os = require('os');
const config = require('../ayarlar.json');
const cpuStat = require("cpu-stat");
const { stripIndents } = require('common-tags');
require('moment-duration-format');

exports.run = async (client, message, args) => {
    // v14'te yazıyor efekti (async çalışır)
    message.channel.sendTyping();

    const duration = moment.duration(client.uptime).format('D [gün], H [saat], m [dakika], s [saniye]');

    // İşletim Sistemi ve Mimari Ayarları
    let osType = os.type();
    if (osType === 'Darwin') osType = 'macOS';
    else if (osType === 'Windows_NT') osType = 'Windows';

    let osBit = os.arch() === 'x64' ? '64 Bit' : '32 Bit';

    cpuStat.usagePercent(async function(err, percent, seconds) {
        if (err) return console.log(err);

        const istatistikEmbed = new EmbedBuilder()
            .setColor(0XC51E39)
            .setTitle(`📊 Bot İstatistikleri`)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '📶 Gecikme Süreleri', 
                    value: stripIndents`
                    **Mesaj Gecikmesi:** \`${new Date().getTime() - message.createdTimestamp}\` ms
                    **Bot Gecikmesi:** \`${Math.round(client.ws.ping)}\` ms
                    `, 
                    inline: true 
                },
                { 
                    name: '🕒 Çalışma Süresi', 
                    value: `\`${duration}\``, 
                    inline: true 
                },
                { 
                    name: '📊 Genel Veriler', 
                    value: stripIndents`
                    **Kullanıcı:** ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}
                    **Sunucu:** ${client.guilds.cache.size.toLocaleString()}
                    **Kanal:** ${client.channels.cache.size.toLocaleString()}
                    **Komut:** ${client.commands.size}
                    `, 
                    inline: true 
                },
                { 
                    name: '🤖 Bot Bilgileri', 
                    value: stripIndents`
                    **Adı:** ${client.user.tag}
                    **Sahibi:** <@351695051962843136>
                    **Ön-Ek:** \`${config.prefix}\`
                    `, 
                    inline: true 
                },
                { 
                    name: '💻 Sistem Verileri', 
                    value: stripIndents`
                    **Bellek:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
                    **İşletim:** ${osType} (${osBit})
                    `, 
                    inline: true 
                },
                { 
                    name: '⚙️ İşlemci (CPU)', 
                    value: `\`\`\`xl\n${os.cpus().map(i => `${i.model}`)[0]}\n\`\`\``, 
                    inline: false 
                }
            )
            .setFooter({ text: `${client.user.username} İstatistik Sistemi`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        return message.channel.send({ embeds: [istatistikEmbed] });
    });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['botbilgi', 'stats', 'i'],
    permLevel: 0
};

exports.help = {
    name: 'istatistik',
    kategori: 'genel',
    description: 'Botun anlık teknik verilerini ve istatistiklerini gösterir.',
    usage: 'istatistik'
};