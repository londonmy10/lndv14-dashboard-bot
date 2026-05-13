const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    let prefix = '&'; // botunuzun prefixi
    const lndResim = "https://cdn.discordapp.com/attachments/659811865341329459/738808800248856747/LegendsNeverDie.png";

    let kategoriler = ['genel', 'yetkili', 'eğlence', 'nsfw', 'sunucu', 'yapımcı', 'lndözel', 'müzik', 'moderasyon']; 

    // ANA MENÜ
    if (!args[0]) {
        const anaEmbed = new EmbedBuilder()
            .setTitle('Legends Never Die | Yardım Menüsü')
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('Gold')
            .addFields(
                { 
                    name: "🔗 Linkler", 
                    value: `**Web Panel:** [Tıkla](http://lndbot.duckdns.org/)\n**Destek Sunucusu:** [Tıkla](https://discord.gg/7T2FNXaUZx)\n**Bot Davet:** [Tıkla](https://discord.com/api/oauth2/authorize?client_id=659809477028446208&permissions=8&scope=bot)` 
                },
                { name: "❓ Nasıl Kullanılır?", value: `Örn. Kullanım: \`${prefix}yardım genel\`\nÇalışmayan komutları \`${prefix}bug-bildir\` yaparak bize bildirin.` },
                { name: "📂 Kategoriler", value: `\`${kategoriler.join(', ')}\`` },
                { name: "» Sponsor", value: `Botumuza Sponsor Aranmaktadır.` }
            )
            .setImage(lndResim) 
            .setFooter({ text: "Legends Never Die", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        return message.channel.send({ embeds: [anaEmbed] });
    } 
    
    // KATEGORİ DETAYI
    else {
        const secilenKategori = args[0].toLowerCase();

        if (!kategoriler.includes(secilenKategori)) {
            return message.channel.send(`❌ **${args[0]}** isminde bir kategorim yok.`);
        }

        const komutlar = client.commands.filter(c => 
            c.help && 
            c.help.kategori && 
            c.help.kategori.toLowerCase() === secilenKategori
        );

        const kategoriEmbed = new EmbedBuilder()
            .setAuthor({ name: `${message.author.username} tarafından istendi.`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTitle(`📂 ${secilenKategori.toUpperCase()} Komutları`)
            .setColor('Gold')
            .setTimestamp()
            .setFooter({ text: `${client.user.username}: ${komutlar.size} komut bulunuyor.` })
            .setDescription(
                komutlar.size > 0 
                ? komutlar.map(c => `\`${prefix}${c.help.name}\``).join(', ') 
                : "Bu kategoride henüz komut bulunmuyor."
            );

        return message.channel.send({ embeds: [kategoriEmbed] });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['h', 'help', 'y'],
    permLevel: 0
};

exports.help = {
    name: 'yardım',
    kategori: 'genel',
    description: 'Botun tüm komutlarını kategoriler halinde gösterir.',
    usage: 'yardım [kategori]'
};
