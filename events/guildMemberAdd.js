const Discord = require('discord.js');
const db = require('quick.db');

module.exports = async member => {
    const { guild, user } = member;
    const client = member.client;

    // 1. TAG SİSTEMİ
    let tag = await db.get(`tagB_${guild.id}`);
    let tagKanalId = await db.get(`tagKanal_${guild.id}`);

    if (tag) {
        try {
            await member.setNickname(`${tag} ${user.username}`);
            
            if (tagKanalId) {
                const tagKanal = guild.channels.cache.get(tagKanalId);
                if (tagKanal) {
                    tagKanal.send(`**${user.tag}** adlı kullanıcıya \`${tag}\` tagı verildi. Yeni ismi: \`${tag} ${user.username}\``);
                }
            }
        } catch (e) {
            console.error("Tag verilirken hata (Yetki yetersiz olabilir):", e.message);
        }
    }

    // 2. SAYAÇ SİSTEMİ
    let sayacHedef = await db.get(`sayac_${guild.id}`);
    let sayacKanalId = await db.get(`sKanal_${guild.id}`);

    if (sayacHedef && sayacKanalId) {
        const sayacKanal = guild.channels.cache.get(sayacKanalId);
        if (sayacKanal) {
            // v14'te üye sayısı için memberCount kullanılır
            const kalan = sayacHedef - guild.memberCount;
            sayacKanal.send(`**${user.tag}** Sunucuya katıldı! \`${sayacHedef}\` üye olmamıza son \`${kalan}\` üye kaldı!`);
        }
    }

    // 3. OTOROL SİSTEMİ
    let otorolId = await db.get(`otoR_${guild.id}`);
    let otorolKanalId = await db.get(`otoRK_${guild.id}`);

    if (otorolId) {
        const rol = guild.roles.cache.get(otorolId);
        if (rol) {
            try {
                // v14'te addRole yerine roles.add kullanılır
                await member.roles.add(rol);

                if (otorolKanalId) {
                    const otorolKanal = guild.channels.cache.get(otorolKanalId);
                    if (otorolKanal) {
                        otorolKanal.send(`**${user.tag}** adlı kullanıcıya başarıyla **${rol.name}** rolü verildi!`);
                    }
                }
            } catch (e) {
                console.error("Otorol verilirken hata (Botun yetkisi rolün altında olabilir):", e.message);
            }
        }
    }
};