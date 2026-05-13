const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

exports.run = async (client, message, args) => {
    // Sahip Kontrolü (Ekstra Güvenlik)
    if (message.author.id !== "351695051962843136") {
        return message.reply("❌ Bu komut sadece yapımcıma özeldir!");
    }

    const onayEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("🔄 Yeniden Başlatma Onayı")
        .setDescription("Botun yeniden başlatılmasını onaylıyor musunuz?\n\nOnaylamak için **evet** yazın. İptal için 30 saniyeniz var.")
        .setFooter({ text: "Legends Never Die | Sistem Kontrolü" });

    const msg = await message.channel.send({ embeds: [onayEmbed] });

    // v14 Mesaj Toplayıcı (Collector) Yapısı
    const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === "evet";
    
    message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
        .then(async (collected) => {
            const rebootEmbed = new EmbedBuilder()
                .setColor("Green")
                .setDescription("🚀 **Sistem yeniden başlatılıyor...** \nLütfen kısa bir süre bekleyin.")
                .setTimestamp();

            await msg.edit({ embeds: [rebootEmbed] });
            
            console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] 🔄 Bot ${message.author.tag} tarafından yeniden başlatıldı.`);
            
            // Botu kapatır. Eğer PM2 veya benzeri bir sistem kullanıyorsan bot otomatik geri açılır.
            setTimeout(() => {
                process.exit(0); 
            }, 1000);
        })
        .catch(() => {
            const iptalEmbed = new EmbedBuilder()
                .setColor("Red")
                .setDescription("⚠️ **Yeniden başlatma işlemi zaman aşımı nedeniyle iptal edildi.**");
            
            msg.edit({ embeds: [iptalEmbed] });
        });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['yenile', 'yb', 'restart'],
    permLevel: 4 // Yapımcı Seviyesi
};

exports.help = {
    name: 'reboot',
    kategori: 'yapımcı',
    description: 'Botu yeniden başlatır.',
    usage: 'reboot'
};