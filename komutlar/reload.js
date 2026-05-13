const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message, args) => {
    // Sahip Kontrolü (Güvenlik için ID kontrolü eklemek iyidir)
    if (message.author.id !== "351695051962843136") {
        return message.reply("❌ Bu komutu sadece yapımcım kullanabilir!");
    }

    if (!args[0]) return message.reply("⚠️ Yenilemek istediğin komutun adını yazmalısın!");

    let commandName = args[0].toLowerCase();
    let command;

    // Komut veya Alias kontrolü
    if (client.commands.has(commandName)) {
        command = commandName;
    } else if (client.aliases.has(commandName)) {
        command = client.aliases.get(commandName);
    }

    if (!command) {
        return message.reply(`❌ \`${commandName}\` adında bir komut veya takma ad bulunamadı.`);
    }

    // Bilgilendirme mesajı gönderiyoruz
    const msg = await message.channel.send({ content: `🔄 \`${command}\` adlı komut yenileniyor...` });

    try {
        // Ana dosyadaki (main.js/bot.js) reload fonksiyonunu çağırır
        await client.reload(command);

        const basariEmbed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ **${command}** adlı komut başarıyla yenilendi! Değişiklikler anında aktif edildi.`)
            .setTimestamp();

        return msg.edit({ content: null, embeds: [basariEmbed] });

    } catch (e) {
        console.error(e);
        const hataEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Komut Yenilenemedi")
            .setDescription(`\`${command}\` yenilenirken bir hata oluştu. Kodlarını kontrol et!\n\`\`\`js\n${e.message}\n\`\`\``);

        return msg.edit({ content: null, embeds: [hataEmbed] });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['r', 'yenile'],
    permLevel: 4 // Yapımcı Seviyesi
};

exports.help = {
    name: 'reload',
    kategori: 'yapımcı',
    description: 'Değişiklik yapılan bir komutu botu kapatmadan günceller.',
    usage: 'reload <komut adı>'
};