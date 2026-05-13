const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message, args) => {
    // v14 uyumlu kullanıcı çekme (ilk ve ikinci etiketlenenler)
    let user1 = message.mentions.users.first();
    let user2 = message.mentions.users.at(1) || message.author;

    if (!user1) {
        const hataEmbed = new EmbedBuilder()
            .setDescription(`❌ Ölçmek için birini etiketlemelisin. Mesela: \`@kullanıcı\``)
            .setColor("Red")
            .setTimestamp();
        return message.channel.send({ embeds: [hataEmbed] });
    }

    // Aşk yüzdesi hesaplama
    var anasonuc = Math.floor(Math.random() * 101);
    var kalp = '';
    var akalp = '';
    
    // Kalp çubuğu oluşturma
    let doluKalpSayisi = Math.floor(anasonuc / 10);
    for (let i = 0; i < 10; i++) {
        if (i < doluKalpSayisi) {
            kalp += '❤️';
        } else {
            akalp += '🖤';
        }
    }

    // Yorum belirleme
    var yorum = '💍 Sizi evlendirelim <3';
    if (anasonuc < 80) yorum = '😊 Biraz daha uğraşırsan bu iş olacak gibi :)';
    if (anasonuc < 60) yorum = '🤨 Eh biraz biraz bir şeyler var gibi.';
    if (anasonuc < 40) yorum = '😅 Azıcık da olsa bir şeyler hissediyor sana.';
    if (anasonuc < 20) yorum = '💔 Bu iş olmaz, sen bunu unut.';

    const askEmbed = new EmbedBuilder()
        .setAuthor({ name: `💓 Aşk Ölçer | ${user1.username} & ${user2.username}` })
        .setDescription(`**Aşk Yüzdesi:** %${anasonuc}\n${kalp}${akalp}\n\n${yorum}`)
        .setColor("LuminousVividPink")
        .setTimestamp()
        .setFooter({ text: 'Legends Never Die Eğlence Sistemi' });

    message.channel.send({ embeds: [askEmbed] });
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['aşk-ölçer', 'ask-olcer', 'askolcer', 'ask', 'aşk'],
    permLevel: 0 // bot.js içindeki elevation yapısına uygun
}

exports.help = {
    name: 'aşkölçer',
    kategori: 'eğlence', // bot.js yükleyicisiyle uyumlu kategori
    description: 'İki kullanıcı arasındaki aşkı ölçer.',
    usage: 'aşkölçer [@Kullanıcı]'
}