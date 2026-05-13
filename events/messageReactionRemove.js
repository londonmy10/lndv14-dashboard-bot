module.exports = async (client, reaction, user) => {
    if (user.bot) return; // Botların emojilerini işlem dışı bırak
    
    // Eğer mesaj eski bir mesajsa ve botun hafızasında yoksa veriyi çek
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Mesaj verisi çekilirken hata oluştu:', error);
            return;
        }
    }

    // --- AYARLAR (Diğer dosyadakiyle aynı olmalı) ---
    const mesajID = "MESAJ_ID_BURAYA"; // Emoji olan mesajın ID'si
    const emojiAd = "EMOJI_ADI_VEYA_ID"; // Tıklanan emojinin adı veya ID'si
    const alinacakRolID = "ALINACAK_ROL_ID"; // Geri alınacak rolün ID'si

    // Mesaj ve emoji kontrolü
    if (reaction.message.id === mesajID && reaction.emoji.name === emojiAd) {
        const member = reaction.message.guild.members.cache.get(user.id);
        
        if (member) {
            try {
                // Kullanıcı emojiyi kaldırdığı için rolü ondan geri alıyoruz
                await member.roles.remove(alinacakRolID);
                console.log(`✅ ${user.tag} emojiyi kaldırdı, rol geri alındı.`);
            } catch (err) {
                console.error("❌ Rol alınırken hata oluştu (Yetki yetersiz olabilir):", err);
            }
        }
    }
};