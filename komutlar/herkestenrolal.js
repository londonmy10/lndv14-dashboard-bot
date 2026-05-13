const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.channel.send("❌ **Bu komutu kullanabilmek için `Rolleri Yönet` yetkisine sahip olmalısın!**");
    }

    // Rolü Bulma (Etiket, ID veya İsim ile)
    let rol = message.mentions.roles.first() || 
              message.guild.roles.cache.get(args[0]) || 
              message.guild.roles.cache.find(r => r.name === args.join(' '));

    if (!rol) {
        return message.channel.send("❌ **Herkesten rol alabilmem için bir rol etiketlemelisin veya ID/İsim yazmalısın!**");
    }

    const baslangicEmbed = new EmbedBuilder()
        .setColor("Orange")
        .setDescription(`🔄 **${rol.name}** rolü herkesten alınmaya başlandı... \n*(Sunucu mevcuduna göre bu işlem biraz sürebilir)*`);
    
    message.channel.send({ embeds: [baslangicEmbed] });

    try {
        // v14'te tüm üyeleri çekiyoruz (Önbellek/Cache sorunu yaşanmaması için)
        const members = await message.guild.members.fetch();
        
        // Rol alma işlemi (Botları ve role zaten sahip olmayanları atlar)
        members.forEach(member => {
            if (member.roles.cache.has(rol.id) && !member.user.bot) {
                member.roles.remove(rol).catch(err => {
                    // Botun yetkisinin yetmediği durumları sessizce konsola basar
                    console.log(`${member.user.tag} kullanıcısından rol alınamadı.`);
                });
            }
        });

        const bitisEmbed = new EmbedBuilder()
            .setDescription(`✅ **Herkesten ${rol} adlı rol başarıyla alındı!**`)
            .setColor(rol.hexColor || "Red")
            .setTimestamp();

        return message.channel.send({ embeds: [bitisEmbed] });

    } catch (err) {
        console.error(err);
        return message.channel.send("❌ Üyeler çekilirken veya rol alınırken bir hata oluştu.");
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true, // Rol işlemleri sadece sunucuda çalışır
    aliases: ["toplurolal", "herkestenrolal"],
    permLevel: 3 // Administrator/ManageRoles seviyesi
};

exports.help = {
    name: "herkesten-rol-al",
    kategori: 'yetkili',
    description: "Belirlenen rolü sunucudaki herkesten geri alır.",
    usage: "herkesten-rol-al @rol"
};