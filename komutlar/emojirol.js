const { PermissionFlagsBits } = require('discord.js');
const db = require("croxydb");

module.exports = {
    help: {
        name: "emojirol",
        description: "Mesaja emoji ile kayıt sistemi kurar.",
        usage: "&emojirol <mesaj_id> <emoji> @Üye @Kayıt",
        kategori: "yetkili"
    },
    conf: { aliases: [], permLevel: 3 },

    run: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const mesajId = args[0];
        const emoji = args[1];

        // 📝 Burası Kritik: Mentions yerine args üzerinden sırayı kontrol ediyoruz
        // args[2] her zaman ilk etiketlediğin, args[3] ikinci etiketlediğin olur.
        const verilecekRolHam = args[2] ? args[2].replace(/[<@&>]/g, '') : null;
        const alinacakRolHam = args[3] ? args[3].replace(/[<@&>]/g, '') : null;

        if (!mesajId || isNaN(mesajId)) return message.reply("❌ **Hata:** Geçerli bir Mesaj ID yazmalısın.");
        if (!emoji) return message.reply("❌ **Hata:** Bir emoji koymalısın.");
        if (!verilecekRolHam || !alinacakRolHam) {
            return message.reply("❌ **Hata:** Kullanım: `&emojirol ID Emoji @Verilecek @Alınacak` (Sıra önemlidir!)");
        }

        try {
            const targetMessage = await message.channel.messages.fetch(mesajId);

            // Veritabanı kaydı
            db.set(`emojiSistemi_${mesajId}`, {
                emoji: emoji,
                verilecek: verilecekRolHam, // İlk yazdığın rol eklenecek
                alinacak: alinacakRolHam    // İkinci yazdığın rol silinecek
            });

            await targetMessage.react(emoji);
            
            message.reply({
                content: `✅ **Sistem Başarıyla Kuruldu!**\n\n**Verilecek Rol:** <@&${verilecekRolHam}>\n**Alınacak Rol:** <@&${alinacakRolHam}>`
            });

        } catch (error) {
            console.error(error);
            message.reply("❌ **Hata:** Mesaj bulunamadı veya botun yetkisi yetersiz.");
        }
    }
};
