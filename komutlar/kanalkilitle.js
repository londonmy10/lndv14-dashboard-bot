const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const ms = require('ms');

exports.run = async (client, message, args) => {
    // Özel Mesaj Kontrolü
    if (message.channel.type === ChannelType.DM) {
        const ozelmesajuyari = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTimestamp()
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .addFields({ name: '⚠️ Uyarı', value: '`kilit` adlı komutu özel mesajlarda kullanamazsın.' });
        return message.author.send({ embeds: [ozelmesajuyari] }).catch(() => {});
    }

    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Bu komutu kullanmak için `Kanalları Yönet` yetkisine sahip olmalısın.");
    }

    if (!client.lockit) client.lockit = [];
    let time = args.join(' ');
    let validUnlocks = ['kilitaç', 'unlock', 'aç'];

    if (!time) return message.channel.send('**❌ Doğru Kullanım** : `&kilitle 2min` veya `&kilitle aç`');

    if (validUnlocks.includes(time)) {
        // Kanal Kilidini Açma
        message.channel.permissionOverwrites.edit(message.guild.id, {
            SendMessages: null
        }).then(() => {
            message.channel.send('🔓 **Kanal kilidi açıldı.**');
            clearTimeout(client.lockit[message.channel.id]);
            delete client.lockit[message.channel.id];
        }).catch(error => {
            console.error(error);
            message.channel.send("❌ Kilidi açarken bir hata oluştu.");
        });
    } else {
        // Süre Kontrolü
        let duration = ms(time);
        if (!duration) return message.channel.send("❌ Lütfen geçerli bir süre girin! (Örn: 10m, 1h, 30s)");

        // Kanalı Kilitleme
        message.channel.permissionOverwrites.edit(message.guild.id, {
            SendMessages: false
        }).then(() => {
            message.channel.send(`🔒 **Kanal kilitlendi.** Süre: \`${ms(duration, { long: true })}\``).then(() => {
                client.lockit[message.channel.id] = setTimeout(() => {
                    message.channel.permissionOverwrites.edit(message.guild.id, {
                        SendMessages: null
                    }).then(() => {
                        message.channel.send('🔓 **Kanalın süresi doldu ve kilidi açıldı.**');
                    }).catch(console.error);
                    delete client.lockit[message.channel.id];
                }, duration);
            });
        }).catch(error => {
            console.error(error);
            message.channel.send("❌ Kanal kilitlenirken bir hata oluştu.");
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['kilitle', 'lock'],
    permLevel: 3 // Administrator/ManageChannels
};

exports.help = {
    name: 'kanalıkilitle',
    kategori: 'yetkili',
    description: 'Kanalı istediğiniz kadar süreyle kilitler.',
    usage: 'kanalıkilitle [süre/aç]'
};