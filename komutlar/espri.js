const { EmbedBuilder } = require('discord.js');

exports.run = async (client, message, args) => {
    // Espriler Listesi
    const espriler = [
        'Seni görünce; \ngözlerim dolar, \nkulaklarım euro.',
        'Kar üzerinde yürüyen adama ne denir? Karabasan.',
        'Yıkanan Ton’a ne denir? Washington!',
        'Gidenin arkasına bakmayın yoksa geleni göremezsiniz.',
        '+Oğlum canlılara örnek ver. \n-Kedi, köpek. \n+Cansızlara örnek ver. \n-Ölü kedi, ölü köpek.',
        '+Kanka ben banyoya 3 kişi giriyom. \n-Oha nasıl? \n+Hacı, Şakir ve ben. \n-Defol lan!',
        '+Kocanızla ortak özelliğiniz ne? \n-Aynı gün evlendik.',
        '+Evladım ödevini neden yapmadın? \n-Bilgisayarım uyku modundaydı, uyandırmaya kıyamadım.',
        '+Bizim arkadaş ortamında paranın lafı bile olmaz. \n-Niye ki? \n+Çünkü hiç birimizin parası yok.',
        'Annemin bahsettiği elalem diye bir örgüt var illuminatiden daha tehlikeli yemin ederim.',
        '+Acıkan var mı ya? \n-Yok bizde tatlı kan var.',
        'Yılanlardan korkma, yılmayanlardan kork.',
        '+Baykuşlar vedalaşırken ne der? \n-Bay bay baykuş.',
        'Beni Ayda bir sinemaya götürme, Marsta bir sinemaya götür.',
        'Aaa siz çok terlemişsiniz durun size terlik getireyim.',
        'Aklımı kaçırdım, 100.000 TL fidye istiyorum.'
    ];

    const espri = espriler[Math.floor(Math.random() * espriler.length)];

    // v14 Mesaj Gönderimi ve Edit İşlemi
    const msg = await message.channel.send('⌛ **Espri yükleniyor...**');

    // Kısa bir bekleme süresi ekleyerek daha gerçekçi kılabilirsin (Opsiyonel)
    setTimeout(() => {
        msg.edit(`🤣 ${espri}`).catch(err => console.error("Mesaj editlenemedi:", err));
    }, 1500);
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['espiri', 'espri-yap', 'yap-espri', 'yapbi-espri'],
    permLevel: 0
};

exports.help = {
    name: 'espri',
    kategori: 'eğlence', // bot.js yükleyicisiyle uyumlu
    description: 'Bot rastgele soğuk espri yapar.',
    usage: 'espri'
};