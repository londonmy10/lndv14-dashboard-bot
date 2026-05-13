module.exports = async (client, reaction, user) => {
    if (user.bot) return; // Botların emojilerine tepki verme
    if (reaction.partial) await reaction.fetch(); // Eski mesajları hafızaya al

    // --- AYARLAR ---
    const mesajID = "MESAJ_ID_BURAYA"; // Emoji olan mesajın ID'si
    const emojiAd = "EMOJI_ADI_VEYA_ID"; // Tıklanan emojinin adı veya ID'si
    const verilecekRolID = "VERILECEK_ROL_ID"; // Verilecek rolün ID'si

    if (reaction.message.id === mesajID && reaction.emoji.name === emojiAd) {
        const member = reaction.message.guild.members.cache.get(user.id);
        if (member) {
            await member.roles.add(verilecekRolID).catch(console.error);
        }
    }
};