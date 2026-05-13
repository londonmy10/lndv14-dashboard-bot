const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args) => {

    const sonuc = [
        "``1CM``\nƐ=>",
        "``2CM``\nƐ==>",
        "``3CM``\nƐ===>",
        "``4CM``\nƐ====>",
        "``5CM``\nƐ=====>",
        "``6CM``\nƐ======>",
        "``7CM``\nƐ=======>",
        "``8CM``\nƐ========>",
        "``9CM``\nƐ=========>",
        "``10CM``\nƐ==========>",
        "``11CM``\nƐ===========>",
        "``12CM``\nƐ============>\nKalkıyor kalkıyor... 🚀",
        "``13CM``\nƐ=============>", 
        "``14CM``\nƐ==============>", 
        "``15CM``\nƐ===============>\nÇıkarda gölgesinde rakı içek aq 🥃", 
        "``16CM``\nƐ================>\nUçak? ✈️", 
        "``17CM``\nƐ=================>\nSağlam linkmiş. 🔗", 
        "``18CM``\nƐ==================>\nSayın yolcularımız uçağımız kalkışa hazır! 🛫", 
        "``19CM``\nƐ===================>\nKırk yıllık kampçıyım böyle çadır görmedim aq! ⛺", 
        "``20CM``\nƐ====================>\nKuşa fazla yem verdin galiba? 🐦", 
        "``21CM``\nƐ=====================>\nMalzeme kaç torba çimento attın aq? 🧱"
    ];

    const result = Math.floor((Math.random() * sonuc.length));

    // v14 EmbedBuilder Yapısı
    const kacembed = new EmbedBuilder()
        .setAuthor({ 
            name: message.author.username, 
            iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        })
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setColor('Random')
        .setFooter({ 
            text: `${client.user.username} | Eğlence Sistemi`, 
            iconURL: client.user.displayAvatarURL() 
        })
        .addFields({ 
            name: "📏 Haşmetliyi Masaya Vuruyor...", 
            value: sonuc[result] 
        })
        .setTimestamp();

    return message.channel.send({ embeds: [kacembed] });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['kaçcm', 'kaccm'],
    permLevel: 0
};

exports.help = {
    name: 'kaccm',
    kategori: 'eğlence',
    description: 'Malum ölçümü yapar.',
    usage: 'kaccm'
};