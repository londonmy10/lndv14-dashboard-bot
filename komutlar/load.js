const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message, args) => {
    // Sahip Kontrolü (Güvenlik için ID kontrolü eklemek her zaman iyidir)
    if (message.author.id !== "351695051962843136") {
        return message.reply("❌ Bu komutu sadece yapımcım kullanabilir!");
    }

    const commandName = args[0];
    if (!commandName) return message.reply("⚠️ Bir komut adı yazmalısın!");

    // İlk bilgilendirme mesajı
    const msg = await message.channel.send(`🔄 \`${commandName}\` adlı komut yükleniyor...`);

    try {
        // Ana dosyadaki (main.js/bot.js) yükleme fonksiyonunu çağırır
        // Eğer client.load tanımlı değilse hata fırlatır
        await client.load(commandName);

        const basariEmbed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ \`${commandName}\` adlı komut başarıyla sisteme yüklendi ve kullanıma hazır!`)
            .setTimestamp();

        return msg.edit({ content: null, embeds: [basariEmbed] });

    } catch (e) {
        console.error(e);
        const hataEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ \`komutlar\` klasöründe \`${commandName}.js\` isminde bir dosya bulunamadı veya kodda hata var!`)
            .setFooter({ text: "Hata detayları konsolda." });

        return msg.edit({ content: null, embeds: [hataEmbed] });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['yükle', 'komut-yükle'],
    permLevel: 4 // Yapımcı seviyesi
};

exports.help = {
    name: 'load',
    kategori: 'yapımcı',
    description: 'Yeni eklenen bir komutu botu yeniden başlatmadan aktif eder.',
    usage: 'load <komut adı>'
};