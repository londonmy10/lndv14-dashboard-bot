const { EmbedBuilder } = require('discord.js');
const db = require('croxydb'); // croxydb kullandığını varsayıyorum, hata verirse quick.db yapabilirsin.

module.exports = async (member) => {
    if (!member || !member.guild) return;

    let ototag = db.get(`ototag_${member.guild.id}`);
    let kanalId = db.get(`ototagKanal_${member.guild.id}`);

    if (!ototag) return;

    try {
        await member.setNickname(`${ototag} ${member.user.username}`).catch(err => {
            console.log(`[OTOTAG HATA] ${member.user.tag} kullanıcısına yetkim yetmediği için tag verilemedi.`);
        });

        if (kanalId) {
            const logKanali = member.guild.channels.cache.get(kanalId);
            if (logKanali) {
                const embed = new EmbedBuilder()
                    .setDescription(`**Sunucuya Yeni Katılan** **${member.user.username}** Kullanıcısına [**${ototag}**] **tagı verildi.**`)
                    .setColor('#36393E')
                    .setFooter({ text: `LND Tag Sistemi` });

                logKanali.send({ embeds: [embed] });
            }
        }
    } catch (e) {
        console.error("OtoTag Sisteminde Teknik Hata:", e.message);
    }
};