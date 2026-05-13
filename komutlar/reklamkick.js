const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('❌ Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!');
    }

    const embed = new EmbedBuilder().setColor("Blurple").setTitle("🛡️ Reklam Kick/Ban Sistemi");

    if (!args[0]) {
        embed.setDescription('⚠️ Sistemi kullanabilmek için bir seçenek belirtmelisin: \n`&reklam-kick aç` veya `kapat`').setColor("Red");
        return message.channel.send({ embeds: [embed] });
    }

    if (args[0] === 'aç') {
        db.set(`reklamkick_${message.guild.id}`, 'acik');
        embed.setDescription(`✅ **Reklam kick sistemi başarıyla açıldı.** \nReklam yapan kullanıcılar 3 uyarıdan sonra otomatik olarak banlanacaktır.`)
             .setColor("Green");
        return message.channel.send({ embeds: [embed] });
    }

    if (args[0] === 'kapat') {
        db.delete(`reklamkick_${message.guild.id}`);
        embed.setDescription(`❌ **Reklam kick sistemi kapatıldı.** \nArtık reklam uyarısı ve otomatik ban işlemi yapılmayacak.`)
             .setColor("Orange");
        return message.channel.send({ embeds: [embed] });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['reklamkick', 'reklam-kick-sistemi'],
    permLevel: 3 // Sunucuyu Yönet / Admin seviyesi
};

exports.help = {
    name: 'reklam-kick',
    kategori: 'sunucu',
    description: 'Reklam yapanları uyaran ve banlayan sistemi açıp kapatır.',
    usage: 'reklam-kick aç/kapat'
};