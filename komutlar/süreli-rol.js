const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require("ms");

exports.run = async (client, message, args) => {
    // Genel Embed Taslağı
    const embedBase = () => new EmbedBuilder()
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setFooter({ text: `LND Bot | Süreli Rol Sistemi` })
        .setTimestamp();

    // Yetki Kontrolü
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.channel.send({ embeds: [embedBase().setColor("Red").setDescription(`❌ Bu komutu kullanabilmek için \`Rolleri Yönet\` yetkin olmalı.`)] });
    }

    let kullanıcı = message.mentions.users.first();
    let rol = message.mentions.roles.first();
    let süreMetni = args[2];

    // Giriş Kontrolleri
    if (!args[0]) return message.channel.send({ embeds: [embedBase().setColor("Yellow").setDescription(`⚠️ Bir kullanıcı etiketlemelisin.`)] });
    if (!kullanıcı) return message.channel.send({ embeds: [embedBase().setColor("Red").setDescription(`❌ **${args[0]}** kullanıcısını sunucuda bulamadım.`)] });
    
    if (!args[1]) return message.channel.send({ embeds: [embedBase().setColor("Yellow").setDescription(`⚠️ Bir rol etiketlemelisin.`)] });
    if (!rol) return message.channel.send({ embeds: [embedBase().setColor("Red").setDescription(`❌ **${args[1]}** rolünü sunucuda bulamadım.`)] });

    if (!süreMetni) return message.channel.send({ embeds: [embedBase().setColor("Yellow").setDescription(`⚠️ Ne kadar süre rolün kalacağını belirtmelisin. \nÖrnek: \`&süreli-rol @üye @rol 1h\``)] });

    const üye = message.guild.members.cache.get(kullanıcı.id);
    const msSüre = ms(süreMetni);

    if (!msSüre) return message.channel.send({ embeds: [embedBase().setColor("Red").setDescription(`❌ Geçersiz süre formatı! (Örnek: 1d, 1h, 1m)`)] });

    try {
        // Rolü Ver
        await üye.roles.add(rol.id);

        let süreGörünüm = süreMetni
            .replace(/d/, ' gün')
            .replace(/h/, ' saat')
            .replace(/m/, ' dakika')
            .replace(/s/, ' saniye');

        const baslangicEmbed = embedBase()
            .setColor("Green")
            .setDescription(`✅ ${kullanıcı} kişisine **${süreGörünüm}** boyunca ${rol} rolü verildi. \n\n**Yetkili:** ${message.author}`);

        const msg = await message.channel.send({ embeds: [baslangicEmbed] });

        // Süre Bitince Rolü Al
        setTimeout(async () => {
            try {
                if (üye.roles.cache.has(rol.id)) {
                    await üye.roles.remove(rol.id);
                }
                
                const bitisEmbed = embedBase()
                    .setColor("Orange")
                    .setDescription(`⏳ ${kullanıcı} için ${rol} rolünün süresi doldu ve geri alındı.`);
                
                msg.edit({ embeds: [bitisEmbed] });
            } catch (e) {
                console.error("Rol geri alınırken hata oluştu:", e);
            }
        }, msSüre);

    } catch (e) {
        console.error(e);
        return message.reply("❌ Rol verilirken bir hata oluştu. Botun yetkisinin rolün üstünde olduğundan emin ol!");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['s-rol', 'temporary-role'],
    permLevel: 0
};

exports.help = {
    name: 'süreli-rol',
    kategori: 'yetkili',
    description: 'Bir kullanıcıya belirli bir süre boyunca rol verir.',
    usage: 'süreli-rol @üye @rol <süre>'
};