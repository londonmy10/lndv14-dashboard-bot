const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

exports.run = async (client, message, args) => {
    // Yetki Kontrolü (v14 Formatı)
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.channel.send('<a:hayirr:679719517345415190> | Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!');
    }

    // Rolü Bulma (Etiket, ID veya İsim ile)
    let rol = message.mentions.roles.first() || 
              message.guild.roles.cache.get(args[0]) || 
              message.guild.roles.cache.find(r => r.name === args.join(' '));

    if (!rol) return message.channel.send('❌ Herkese rol verebilmem için bir rol etiketlemelisin veya ID/İsim yazmalısın.');

    const baslangicEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription(`🔄 **${rol.name}** rolü herkese verilmeye başlandı... \n*(Üye sayısına göre bu işlem biraz zaman alabilir)*`);
    
    message.channel.send({ embeds: [baslangicEmbed] });

    try {
        // v14'te tüm üyeleri çekiyoruz (Cache sorunu olmaması için)
        const members = await message.guild.members.fetch();
        
        // Rol verme işlemi (Botu ve halihazırda role sahip olanları atlar)
        members.forEach(member => {
            if (!member.roles.cache.has(rol.id) && !member.user.bot) {
                member.roles.add(rol).catch(err => console.log(`${member.user.tag} kullanıcısına rol verilemedi.`));
            }
        });

        const bitisEmbed = new EmbedBuilder()
            .setDescription(`✅ Herkese **${rol}** adlı rol başarıyla verildi!`)
            .setColor(rol.hexColor || "Green")
            .setTimestamp();

        return message.channel.send({ embeds: [bitisEmbed] });

    } catch (err) {
        console.error(err);
        return message.channel.send("❌ Üyeler çekilirken veya rol verilirken bir hata oluştu.");
    }
}

exports.conf = {
    enabled: true,
    guildOnly: true, // Bu komut sadece sunucuda çalışır
    aliases: ['toplu-rol-ver', 'herkeserolver'],
    permLevel: 3 // Administrator/Yönetici seviyesi
};

exports.help = {
    name: 'herkese-rol-ver',
    kategori: 'yetkili',
    description: 'Sunucudaki tüm üyelere belirtilen rolü verir.',
    usage: 'herkese-rol-ver @rol'
};