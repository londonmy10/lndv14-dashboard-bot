const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require("croxydb");
const ayarlar = require("../ayarlar.json");

// Komut bekleme süresi (cooldown) için Set yapısı
let talkedRecently = new Set();

module.exports = async (message) => {
    // Botların kendi mesajlarını veya DM'leri engelleme
    if (message.author.bot || !message.guild) return;

    let client = message.client;

    /* --- 1. PANEL OTO-CEVAP SİSTEMİ (ÖNCELİKLİ) --- */
    const otoCevap = db.get(`otocevap_${message.content.toLowerCase()}`);
    if (otoCevap) {
        return message.reply(otoCevap);
    }

    /* --- 2. KOMUT SİSTEMİ BAŞLANGICI --- */
    // Prefix kontrolü
    let prefix = await db.get(`prefix_${message.guild.id}`) || ayarlar.prefix;

    // Mesaj prefix ile başlamıyorsa burada dur (Komut değildir)
    if (!message.content.startsWith(prefix)) return;

    // Cooldown kontrolü
    if (talkedRecently.has(message.author.id)) return;
    talkedRecently.add(message.author.id);
    setTimeout(() => { talkedRecently.delete(message.author.id); }, 2500);

    // Komut ayrıştırma
    let command = message.content.split(' ')[0].slice(prefix.length).toLowerCase();
    let params = message.content.split(' ').slice(1);
    
    let cmd;
    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command));
    }

    if (cmd) {
        // Yetki Seviyesi Belirleme
        let permlvl = 0;
        if (message.member.permissions.has(PermissionFlagsBits.BanMembers)) permlvl = 2;
        if (message.member.permissions.has(PermissionFlagsBits.Administrator)) permlvl = 3;
        if (message.author.id === ayarlar.sahip) permlvl = 4;

        // Bakım Modu Kontrolü
        let bakim = await db.get('bakım');
        if (message.author.id !== ayarlar.sahip && bakim) {
            return message.channel.send(`**<a:tamir:712676193765425194> Sizlere En İyi Hizmeti Verebilmek İçin Bakımdayız.**\n<:bilgi:712676253207101516> Bakım Sebebi: \`${bakim}\`\n<a:lndhg:729628104007614504> Lütfen Daha Sonra Tekrar Deneyin.**`);
        }

        // Komut Yetki Kontrolü
        let cmdPerm = (cmd.conf && cmd.conf.permLevel) ? cmd.conf.permLevel : 0;
        if (permlvl < cmdPerm) return;

        // Komutu Çalıştır
        try {
            cmd.run(client, message, params, permlvl);
        } catch (error) {
            console.error(`${command} komutu çalışırken hata oluştu:`, error);
            message.reply('Bu komut çalıştırılırken bir hata oluştu!');
        }
    }
};