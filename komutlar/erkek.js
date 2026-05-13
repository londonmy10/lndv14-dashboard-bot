const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

exports.run = async (client, message, args) => {
    // Yetki Kontrolü
    if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
        return message.channel.send(`❌ Bu Komutu Kullanabilmek için \`İsimleri Yönet\` Yetkisine Sahip Olmalısın!`);
    }

    let member = message.mentions.members.first();
    let isim = args.slice(1).join(" ");
    
    if (!member) return message.channel.send("❌ Bir Üye Etiketlemelisin!");
    if (!isim) return message.channel.send("❌ Bir İsim Yazmalısın!");

    try {
        await member.setNickname(`${isim}`);
        await member.roles.remove('603580899111731232'); // Kayıtsız Rolü ID
        await member.roles.add('609133255819526344');    // Erkek Rolü ID
    } catch (err) {
        return message.channel.send("❌ Rol verme veya isim değiştirme yetkim yetmiyor!");
    }

    // Üye Sayısı ve Emoji Dönüştürücü
    let guild = client.guilds.cache.get("374894897917853707");
    let üyeSayısıStr = guild.memberCount.toString();
    
    const emojiMap = {
        '0': `<a:sfr:729286531818192956>`,
        '1': `<a:bir:729286555050442822>`,
        '2': `<a:iki:729286572859588660>`,
        '3': `<a:uc:729286583290691605>`,
        '4': `<a:drt:729286597820022804>`,
        '5': `<a:be:729286611803570246>`,
        '6': `<a:alt:729286629381898301>`,
        '7': `<a:yedi:729286654753505290>`,
        '8': `<a:sekiz:729286667374166066>`,
        '9': `<a:dokuz:729286681760497674>`
    };

    let emojiÜyeSayısı = üyeSayısıStr.split('').map(digit => emojiMap[digit] || digit).join('');

    // ✅ SADECE EMOJİLİ MESAJI GÖNDEREN KISIM
    let hgKanal = client.channels.cache.get('702624607072682054');
    if (hgKanal) {
        hgKanal.send({ 
            content: `${member.user} Aramıza Katıldı! ${emojiÜyeSayısı} kişi olduk!\n\nAramıza hoşgeldin <a:sonsuz:729780899201155082> \n\n Rollerini bu kanallardan alabilirsin <a:sonsuz:729780899201155082> \n <#543782959321186334> <#729476239659761765>`
        }).then(msg => {
            setTimeout(() => msg.delete(), 100000);
        });
    }

    // Kayıt Logu (Opsiyonel: İstemiyorsan bu kısmı silebilirsin)
    const logKanal = client.channels.cache.get('728968298108158043');
    if (logKanal) {
        const logEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`**🏷 Legends Never Die Erkek Kayıt 🏷**\n\n**🔸️Kayıt Edilen:** ${member.user} \n**🔸️Kayıt Eden:** \`${message.author.username}\``)
            .setTimestamp();
        logKanal.send({ embeds: [logEmbed] });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["nick", "isim", "e"],
    permLevel: 0
};

exports.help = {
    name: "erkek",
    kategori: 'lndözel',
    description: "Erkek Kayıt Sistemi",
    usage: "erkek @üye isim"
};
