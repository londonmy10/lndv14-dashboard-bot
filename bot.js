const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, AttachmentBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const ayarlar = require("./ayarlar.json");
const chalk = require("chalk");
const fs = require("fs");
const moment = require("moment");
const db = require("croxydb");
db.fetch = db.get;
const passport = require('passport');
const session = require('express-session');
const Strategy = require('passport-discord').Strategy;
const express = require('express');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const ms = require("parse-ms");
const Canvas = require("canvas");


// --- CLIENT AYARLARI ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction, 
        Partials.User
    ],
    shards: 'auto',
    restReadyTimeout: 60000 
});

// Limitsiz event dinleyici (Eğer çok fazla event varsa performans sorunlarına dikkat edin)
client.setMaxListeners(0);
process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 0;

// 1. ADIM: EXPRESS'İ BAŞLAT (Her şeyden önce bu gelmeli)
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. ADIM: MIDDLEWARE VE SESSION AYARLARI
app.use(session({
    secret: 'lnd_gizli_anahtar_2026', // Güvenli bir anahtar
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// 3. ADIM: PASSPORT STRATEJİSİ
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const strategy = new Strategy({
    clientID: 'BOTUN_ID_Sİ', 
    clientSecret: 'DEVELOPER_PORTALDA_BELİRTTİĞİN_CLIENT_SECRET', 
    callbackURL: 'DEVELOPER_PORTALDA_BELİRTTİĞİN_REDIRECT_URI', 
    scope: ['identify', 'guilds'] 
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
});

passport.use(strategy);

// 4. ADIM: DOSYA YOLLARI VE MOTOR
app.set('views', path.join(__dirname, 'web')); 
app.set('view engine', 'ejs');
app.use(express.static('public'));

// 5. ADIM: ROTALAR (Login ve Sayfalar)
app.get('/', (req, res) => {
    res.render('index', { user: req.user }); // index.ejs dosyasına kullanıcı verisini gönderir
});

// Giriş Başlatma ve Callback (Discord Developer Portal'da Redirect URI /login olduğu için ikisi de aynı)
app.get('/login', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/'); 
});

// Çıkış Yapma
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// 6. ADIM: SUNUCUYU ÇALIŞTIR
const port = 80;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 LND Bot Web Paneli Hazır!`);
    console.log(`🌐 Erişim Adresi: http://lndbot.duckdns.org`);
});

// 7. Panel Ayarları

app.get('/commands', (req, res) => {
    // Botun komutlarını koleksiyondan çekiyoruz
    const commands = client.commands.map(c => {
        return {
            name: c.help.name,
            description: c.help.description || "Açıklama belirtilmemiş.",
            kategori: c.help.kategori || "Genel"
        };
    });

    res.render('commands', { 
        user: req.user, 
        commands: commands 
    });
});

// Panel Sunucularım

app.get('/guilds', (req, res) => {
    if (!req.user) return res.redirect('/login');

    // Sadece Administrator yetkisi olan sunucuları filtrele (Permission bit: 0x8)
    const adminGuilds = req.user.guilds.filter(guild => (guild.permissions & 0x8) === 0x8);

    res.render('guilds', {
        user: req.user,
        guilds: adminGuilds,
        client: client // Botun o sunucuda olup olmadığını anlamak için
    });
});

// Sunucu Yönetim Rotası
app.get('/manage/:guildID', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404).send("Bot bu sunucuda bulunmuyor.");

    const member = await guild.members.fetch(req.user.id).catch(() => null);
    if (!member || !member.permissions.has('Administrator')) {
        return res.status(403).send("Bu sunucuyu yönetme yetkiniz yok.");
    }

    // BURAYI GÜNCELLE: db nesnesini sayfaya gönderiyoruz
    res.render('manage', {
        user: req.user,
        guild: guild,
        client: client,
        db: db // Sayfanın croxydb komutlarını tanıması için bu satır şart
    });
});

// Veri Kaydetme Rotası - Emoji Rol Destekli
app.post('/manage/:guildID/save', async (req, res) => {
    if (!req.user) return res.status(401).send();

    const { guildID } = req.params;
    const data = req.body;

    try {
        if (Array.isArray(data)) {
            for (const item of data) {
                // 1. Silme İşlemi (Eğer sil:true gönderildiyse)
                if (item.sil) {
                db.delete(item.tip);
                    continue;
                }

                // 2. Normal Kayıt İşlemi
                if (item.tip && item.deger !== undefined && item.deger !== null && item.deger !== "") {
                    db.set(`${item.tip}_${guildID}`, item.deger);

                    // 🎯 EMOJI ROL TETİKLEYİCİSİ
                    // Eğer kaydedilen veri bir emoji sistemiyse botu harekete geçir
                    if (item.tip.startsWith('emojiSistemi_')) {
                        const mId = item.tip.split('_')[1]; // Mesaj ID'sini al
                        const emoji = item.deger.emoji;    // Emojiyi al

                        // Botun sunucudaki tüm kanallarına bak ve mesajı bul
                        const guild = client.guilds.cache.get(guildID);
                        if (guild) {
                            // Mesajı bulmak için kanalları tara
                            guild.channels.cache.filter(c => c.isTextBased()).forEach(async (chan) => {
                                try {
                                    const targetMsg = await chan.messages.fetch(mId);
                                    if (targetMsg) {
                                        await targetMsg.react(emoji);
                                        console.log(`✅ ${guild.name} sunucusunda ${mId} mesajına emoji basıldı.`);
                                    }
                                } catch (e) {
                                    // Mesaj bu kanalda değilse hata vermemesi için sessizce geç
                                }
                            });
                        }
                    }
                }
            }
        }
        return res.json({ success: true });
    } catch (error) {
        console.error("Kayıt Hatası:", error);
        return res.status(500).json({ success: false });
    }
});

// EmojiRol Tepki
client.on('messageReactionAdd', async (reaction, user) => {
    // Botların kendi tepkilerini görmezden gel
    if (user.bot) return;

    // Eğer mesaj önbellekte yoksa (eski bir mesajsa) veriyi çek
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Mesaj çekilirken hata oluştu:', error);
            return;
        }
    }

    const messageId = reaction.message.id;
    const guildId = reaction.message.guild.id;

    // 🎯 BURASI EN ÖNEMLİ KISIM: Paneldeki yeni kayıt formatımızla tam eşleşmeli
    // Format: emojiSistemi_123456789_987654321
    const dbKey = `emojiSistemi_${messageId}_${guildId}`;
    const sistem = db.get(dbKey);

    // Veritabanında bu mesaj için ayar var mı ve emoji doğru mu?
    if (sistem && reaction.emoji.name === sistem.emoji) {
        try {
            const member = await reaction.message.guild.members.fetch(user.id);

            // 1. Üye Rolünü VER (Member)
            if (sistem.verilecek) {
                const verilecekRol = reaction.message.guild.roles.cache.get(sistem.verilecek);
                if (verilecekRol && !member.roles.cache.has(sistem.verilecek)) {
                    await member.roles.add(verilecekRol);
                    console.log(`✅ ${user.tag} kullanıcısına ${verilecekRol.name} rolü verildi.`);
                }
            }

            // 2. Kayıt Rolünü AL (Unregistered)
            if (sistem.alinacak) {
                const alinacakRol = reaction.message.guild.roles.cache.get(sistem.alinacak);
                if (alinacakRol && member.roles.cache.has(sistem.alinacak)) {
                    await member.roles.remove(alinacakRol);
                    console.log(`🗑️ ${user.tag} kullanıcısından ${alinacakRol.name} rolü alındı.`);
                }
            }
        } catch (error) {
            console.error("Rol verme/alma işlemi sırasında hata:", error);
        }
    }
});

// İletişim Sayfası Rotası
app.get('/iletisim', (req, res) => {
    try {
        res.render('iletisim', {
            // Eğer navbar'da kullanıcı adı görünüyorsa bunları göndermen şart
            user: req.user || null,
            bot: client, // Botun client objesi
            path: req.path,
            guilds: client.guilds.cache // Eğer sunucu sayısı falan lazımsa
        });
    } catch (error) {
        console.error("İletişim sayfası yüklenirken hata:", error);
        res.status(500).send("Sayfa yüklenemedi.");
    }
});

// Dinamik Ayar Rotası
// Modül Ayar Sayfası Rotası
app.get('/manage/:guildID/:module', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    
    const { guildID, module } = req.params;
    const guild = client.guilds.cache.get(guildID);
    
    if (!guild) return res.redirect('/guilds');

    // Yetki Kontrolü
    const member = await guild.members.fetch(req.user.id).catch(() => null);
    if (!member || !member.permissions.has('Administrator')) return res.redirect('/');

    // Hangi sayfayı render edeceğimizi belirliyoruz (Örn: web/modules/kayit.ejs)
    res.render(`modules/${module}`, {
        user: req.user,
        guild: guild,
        db: db, // Croxydb'yi sayfada kullanmak için gönderiyoruz
        client: client
    });
});

// 8 Panel Oto Cevap
client.on('messageCreate', async (message) => {
    // Güvenlik Kontrolleri
    // Mesaj bir sunucuda mı? Yazın bir bot mu? Mesaj boş mu?
    if (!message.guild || message.author.bot || !message.content) return;

    const guildId = message.guild.id;

    // 1. Adım: Sistemin açık olup olmadığını kontrol et
    const durum = db.get(`otocevap_sistemi_${guildId}`);
    
    // Panelden gönderdiğimiz 'acik' string verisini veya true değerini kontrol ediyoruz
    if (durum === 'acik' || durum === true) {
        
        // 2. Adım: Sunucuya özel eklenmiş cevap listesini çek
        const cevaplar = db.get(`otocevaplar_${guildId}`);

        // Eğer veritabanında cevaplar varsa ve bir diziyse (array) işlem yap
        if (cevaplar && Array.isArray(cevaplar)) {
            
            // 3. Adım: Kullanıcının yazdığı mesajla eşleşen bir soru ara
            // toLowerCase() kullanarak büyük/küçük harf duyarlılığını ortadan kaldırıyoruz
            const eslesenCevap = cevaplar.find(
                (item) => item.soru.toLowerCase() === message.content.toLowerCase()
            );

            // 4. Adım: Eşleşme bulunduysa cevabı yapıştır!
            if (eslesenCevap) {
                try {
                    return await message.reply(eslesenCevap.cevap);
                } catch (error) {
                    console.error("Otocevap gönderilirken hata oluştu:", error);
                }
            }
        }
    }
});

// --- DIS-TUBE AYARLARI ---
const { DisTube } = require('distube');
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const ffmpeg_yolu = require('ffmpeg-static'); // İsim karışıklığı olmaması için değiştirdik

// Cookie kontrolü
let cookies = [];
if (fs.existsSync('./cookies.json')) {
    try {
        const rawCookies = fs.readFileSync('./cookies.json', 'utf-8');
        if (rawCookies.trim().length > 0) {
            cookies = JSON.parse(rawCookies);
        }
    } catch (err) {
        console.error("❌ cookies.json okunurken hata oluştu:", err.message);
    }
}

client.distube = new DisTube(client, {
    ffmpeg: {
        path: ffmpeg_yolu // Burayı ffmpeg_yolu yaptık
    },
    plugins: [
        new SoundCloudPlugin(),
        new SpotifyPlugin(),
        new YtDlpPlugin({ update: true })
    ],
    emitNewSongOnly: true,
    savePreviousSongs: true,
    nsfw: true
});

// MaxListeners uyarısını sustur
if (client.distube) {
    client.distube.setMaxListeners(0);
}

// Hataları yakalamak için bu dinleyiciyi mutlaka ekle
client.distube.on("error", (error, queue) => {
    console.error("❌ DisTube Hatası:", error);

    if (queue && queue.textChannel) {
        queue.textChannel.send(`❌ Müzik sisteminde bir hata oluştu.`).catch(() => {});
    }
});

// Ses kanalında bağlantı hatalarını ve kopmaları loglamak için
client.distube.on("error", (channel, e) => {
    if (channel) channel.send(`❌ Bir hata oluştu: ${e.message.slice(0, 1900)}`);
    else console.error(e);
});

// FFMPEG Yolu (Eğer ffmpeg sistem PATH'inde değilse, tam yolunu belirtmeniz gerekebilir)
process.env.FFMPEG_PATH = require('ffmpeg-static');

// Müzik Sistemi Hatası

client.distube.on("error", (error, channel) => {
    // Hatanın detaylarını konsola yazdır ki ne olduğunu görelim
    console.error("DisTube Hatası Yakalandı:", error);

    // Eğer kanal geçerliyse ve mesaj gönderilebiliyorsa gönder
    if (channel && typeof channel.send === 'function') {
        channel.send(`❌ **Müzik Sistemi Hatası:** ${error.message ? error.message.slice(0, 100) : "Bir hata oluştu!"}`).catch(err => console.error("Mesaj gönderilemedi:", err));
    }
});

// Müzik sistemi için olay dinleyicileri

client.distube.on("playSong", (queue, song) => {
    const playEmbed = new EmbedBuilder()
        .setColor("#fdb912")
        .setTitle("🎶 Şimdi Oynatılıyor")
        .setDescription(`**[${song.name}](${song.url})**`)
        .addFields(
            { name: "👤 İsteyen", value: `${song.user}`, inline: true },
            { name: "⏱️ Süre", value: `${song.formattedDuration}`, inline: true }
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: "Legends Never Die - Müzik Sistemi" });

    queue.textChannel.send({ embeds: [playEmbed] });
});


// --- EMOJİ ROL SİSTEMİ (GÜNCEL) ---
client.on('messageReactionAdd', async (reaction, user) => {
    // Botun kendi tepkilerine cevap vermesini engelle
    if (user.bot) return;

    // Eğer mesaj verisi eksikse (eski mesajlar için) veriyi Discord'dan çek
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Tepki verisi çekilirken hata oluştu:', error);
            return;
        }
    }

    const messageId = reaction.message.id;
    const guild = reaction.message.guild;
    if (!guild) return;

    // Veritabanında bu mesaj için kurulmuş bir sistem var mı kontrol et
    const sistem = db.get(`emojiSistemi_${messageId}`);

    // Sistem kayıtlıysa ve tıklanan emoji doğruysa işlemleri başlat
    if (sistem && reaction.emoji.toString() === sistem.emoji) {
        try {
            const member = await guild.members.fetch(user.id);

            // 1. Üyeye 'Verilecek' rolünü (Üye/Member) ekle
            if (sistem.verilecek && !member.roles.cache.has(sistem.verilecek)) {
                await member.roles.add(sistem.verilecek);
            }

            // 2. Üyeden 'Alınacak' rolünü (Kayıt/Unregistered) çıkar
            if (sistem.alinacak && member.roles.cache.has(sistem.alinacak)) {
                await member.roles.remove(sistem.alinacak);
            }

        } catch (error) {
            console.error("Rol işlemleri sırasında hata:", error);
        }
    }
});

// --- Sunucuya Katılma (Giriş + Otorol) ---
client.on("guildMemberAdd", async member => {
const guild = member.guild;

// 1. Otorol Verme İşlemi
// 'Kayıt' isimli rolü bulur. ID kullanmak her zaman daha sağlıklıdır!
const joinRole = guild.roles.cache.find(role => role.name === "Kayıt");
if (joinRole) {
member.roles.add(joinRole).catch(err => console.error("Otorol verilirken hata oluştu:", err.message));
}

 // 2. Giriş Log Mesajı
const channel = guild.channels.cache.find(chan => chan.name === "「🖐」gelen-giden");
if (!channel) return;

const girisEmbed = new EmbedBuilder()
.setColor("#00cc44")
.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
.setTitle(`📥 ${member.user.username} sunucuya katıldı.`)
.setDescription(`Hoş geldin ${member}! Seninle beraber **${guild.memberCount}** kişi olduk.`)
.setTimestamp();

channel.send({ embeds: [girisEmbed] });
});

// --- Sunucudan Ayrılma (Çıkış) ---
client.on("guildMemberRemove", async member => {
const guild = member.guild;
const channel = guild.channels.cache.find(chan => chan.name === "「🖐」gelen-giden");
if (!channel) return;

const cikisEmbed = new EmbedBuilder()
.setColor("#ff1a1a")
.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
.setTitle(`📤 ${member.user.username} sunucudan ayrıldı.`)
.setDescription(`Görüşürüz ${member.user.tag}! Sunucuda **${guild.memberCount}** kişi kaldık.`)
.setTimestamp();

channel.send({ embeds: [cikisEmbed] });
});

// Kanal Koruma Sistemi komutu komutlar/kanalkoru.js dosyasında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve kanal koruma sistemini yönetir.

client.on("channelCreate", async (channel) => {
// Sunucu dışında bir kanal (DM vb.) ise işlem yapma
if (!channel.guild) return;

// Veritabanından sistemin açık olup olmadığını kontrol et
let kanalKoruma = await db.get(`kanalk_${channel.guild.id}`);

if (kanalKoruma === "acik") {
 // Botun kanalı silme yetkisi var mı kontrol et
if (!channel.deletable) return console.log(`[KORUMA] ${channel.name} kanalını silme yetkim yok!`);

// Kanalı sil
await channel.delete().catch(err => console.log("Kanal silinirken hata oluştu:", err));

// Sunucu sahibine bilgi gönder
try {
const owner = await channel.guild.fetchOwner();
 
const korumaEmbed = new EmbedBuilder()
.setTitle("🛡️ Kanal Koruma Sistemi")
.setDescription(`Sunucunuzda yeni bir kanal (**${channel.name}**) oluşturuldu, fakat koruma sistemi aktif olduğu için otomatik olarak silindi!`)
.setColor("Black")
.setFooter({ text: "Legends Never Die Koruma Sistemi" })
.setTimestamp();

await owner.send({ embeds: [korumaEmbed] });
} catch (e) {
console.log("Sunucu sahibine koruma bildirimi gönderilemedi (DM kapalı olabilir).");
}
}
});

// Rol Koruma Sistemi komutu komutlar/rolkoruma.js dosyasında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve rol koruma sistemini yönetir.

client.on("roleCreate", async (role) => {
// Sunucu kontrolü
if (!role.guild) return;

// Veritabanından sistemin durumunu çek
let rolKoruma = await db.get(`rolk_${role.guild.id}`);

if (rolKoruma === "acik") {
// Botun rolü silme yetkisi var mı kontrol et (Kendi üstündeki rolleri silemez)
if (!role.editable) return console.log(`[KORUMA] ${role.name} rolünü silme yetkim yok!`);

// Rolü sil
await role.delete().catch(err => console.log("Rol silinirken hata oluştu:", err));

// Sunucu sahibine bildirim gönder
try {
const owner = await role.guild.fetchOwner();

const korumaEmbed = new EmbedBuilder()
.setTitle("🛡️ Rol Koruma Sistemi")
.setDescription(`Sunucunuzda yeni bir rol (**${role.name}**) oluşturuldu, fakat koruma sistemi aktif olduğu için otomatik olarak silindi!`)
.setColor("Black")
.setFooter({ text: "Legends Never Die Koruma Sistemi" })
.setTimestamp();

await owner.send({ embeds: [korumaEmbed] });
} catch (e) {
 console.log("Sunucu sahibine rol koruma bildirimi gönderilemedi (DM kapalı olabilir).");
}
}
});

// --- AFK SİSTEMİ BAŞLANGIÇ ---
client.on("messageCreate", async message => {
if (message.author.bot || !message.guild) return;

const prefix = ayarlar.prefix;
const db = require("croxydb");
const ms = require("parse-ms");

// 1. AFK Olan Birini Etiketleme Kontrolü
const etiket = message.mentions.users.first();
if (etiket) {
let afkSebep = db.get(`afk_${etiket.id}`);
if (afkSebep) {
let afkSüre = db.get(`afk_süre_${etiket.id}`);
let zaman = ms(Date.now() - afkSüre);

message.reply({ 
content: `🚫 Etiketlediğin kullanıcı **${etiket.username}**, **${afkSebep}** sebebiyle AFK!\n⌛ **AFK Süresi:** \`${zaman.hours} saat ${zaman.minutes} dakika ${zaman.seconds} saniye\`` 
});
}
}

// 2. AFK Modundan Çıkma Kontrolü
if (!message.content.startsWith(prefix + "afk")) {
let kullanıcıAfk = db.get(`afk_${message.author.id}`);
if (kullanıcıAfk) {
db.delete(`afk_${message.author.id}`);
db.delete(`afk_süre_${message.author.id}`);

message.reply({ content: `👋 Hoş geldin **${message.author.username}**! Bir mesaj yazdığın için AFK modundan çıkarıldın.` });
}
}
});

// Reklam Kick Sistemi komutu komutlar/reklamkick.js dosyasında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve reklam kick sistemini yönetir.

client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    // Sistemin açık olup olmadığını kontrol et
    let reklamKickDurum = db.get(`reklamkick_${message.guild.id}`);
    if (reklamKickDurum !== "acik") return;

    // Yetki kontrolü (Yöneticiler muaftır)
    if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const reklamLinkleri = [
        "discord.app", "discord.gg", "invite", "discordapp", "discordgg", ".com", ".net", ".xyz", ".tk", ".pw",
        ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", ".party", ".rf.gd", ".az"
    ];

    if (reklamLinkleri.some(word => message.content.toLowerCase().includes(word))) {
        // Mesajı anında sil
        await message.delete().catch(() => { });

        // Uyarı puanını ekle ve güncel puanı al
        db.add(`reklamuyari_${message.author.id}`, 1);
        let guncelUyari = db.get(`reklamuyari_${message.author.id}`);

        const embedBase = () => new EmbedBuilder()
            .setColor("Random")
            .setFooter({ text: "Legends Never Die Reklam Sistemi", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        // 1. Uyarı
        if (guncelUyari === 1) {
            const embed1 = embedBase()
                .setDescription(`${message.author} **Reklam sistemine yakalandın!** \nReklam yapmaya devam edersen kickleneceksin. (1/3)`);
            return message.channel.send({ embeds: [embed1] });
        }

        // 2. Uyarı
        if (guncelUyari === 2) {
            const embed2 = embedBase()
                .setDescription(`${message.author} **Son uyarın!** \nReklam yapmaya devam edersen sunucudan kickleneceksin. (2/3)`);
            return message.channel.send({ embeds: [embed2] });
        }

        // 3. Kick İşlemi
        if (guncelUyari === 3) {
            if (message.member.kickable) {
                await message.member.kick({ reason: "Reklam Kick Sistemi (3/3 Uyarı)" }).catch(() => { });
                const embed3 = embedBase()
                    .setDescription(`${message.author} **3 adet reklam uyarısı aldığı için kicklendi.** \nBir kez daha yaparsa banlanacak!`);
                return message.channel.send({ embeds: [embed3] });
            }
        }

        // 4. Ban İşlemi (Kick yedikten sonra tekrar yaparsa)
        if (guncelUyari >= 4) {
            if (message.member.bannable) {
                await message.member.ban({ reason: "Reklam Ban Sistemi (Kick sonrası devam)" }).catch(() => { });
                db.delete(`reklamuyari_${message.author.id}`); // Banlandığı için puanı sıfırla
                const embed4 = embedBase()
                    .setDescription(`${message.author} **Kick yedikten sonra reklam yapmaya devam ettiği için sunucudan banlandı!**`);
                return message.channel.send({ embeds: [embed4] });
            }
        }
    }
});

// --- Log Fonksiyonu ---
const log = message => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};

// --- Komut ve Alias Yükleme ---
client.commands = new Collection();
client.aliases = new Collection();

fs.readdir("./komutlar/", (err, files) => {
    if (err) return console.error(err);
    log(`${files.length} komut kontrol ediliyor...`);

    files.forEach(f => {
        try {
            if (!f.endsWith(".js")) return;

            delete require.cache[require.resolve(`./komutlar/${f}`)];
            let props = require(`./komutlar/${f}`);

            if (!props || !props.help || !props.help.name) {
                console.log(`\x1b[31m[HATA]\x1b[0m ${f} dosyasında 'exports.help.name' eksik! Bu dosya atlandı.`);
                return; 
            }

            client.commands.set(props.help.name, props);

            if (props.conf && props.conf.aliases) {
                props.conf.aliases.forEach(alias => {
                    client.aliases.set(alias, props.help.name);
                });
            }
            log(`Yüklenen komut: ${props.help.name}.`);

        } catch (e) {
            console.log(`\x1b[31m[KRİTİK HATA]\x1b[0m ${f} yüklenirken hata oluştu: ${e.message}`);
        }
    });
});

// --- Komut Yönetim Fonksiyonları (Reload, Load, Unload) ---
client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}.js`)];
            let cmd = require(`./komutlar/${command}.js`);
            client.commands.delete(command);
            client.aliases.forEach((cmdName, alias) => {
                if (cmdName === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}.js`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

// --- Snipe Sistemi (Son Silinen Mesajı Kaydetme) ---
client.on("messageDelete", async message => {
  if (!message.guild || !message.content) return; // İçerik yoksa direkt iptal et, uğraşma.
  
  db.set(`snipe.${message.guild.id}.${message.channel.id}`, {
    icerik: message.content,
    yazar: message.author.id,
    tarih: Date.now()
  });
});

// KOMUT YÜKLEYİCİ (v14 Uyumlu)
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  files.forEach(f => {
    try {
      if (!f.endsWith(".js")) return;
      let props = require(`./komutlar/${f}`);
      let commandName = (props.help && props.help.name) ? props.help.name : f.split('.')[0];
      client.commands.set(commandName, props);
      if (props.conf && props.conf.aliases) {
        props.conf.aliases.forEach(alias => client.aliases.set(alias, commandName));
      }
    } catch (e) { console.error(`❌ ${f} yüklenemedi: ${e.message}`); }
  });
});

// Resimli Güvenlik Sistemi komutu komutlar/resimliguvenlik.js dosyasında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve resimli güvenlik sistemini yönetir.

client.on("guildMemberAdd", async member => {
    // Güvenlik kanalını veritabanından çek
    const kanalId = db.get(`guvenlik${member.guild.id}`);
    const chan = member.guild.channels.cache.get(kanalId);
    if (!chan) return;

    // Canvas hazırlığı
    const canvas = Canvas.createCanvas(360, 100);
    const ctx = canvas.getContext("2d");

    // Resim linkleri
    const guvenliResim = "https://cdn.discordapp.com/attachments/591299755976425493/614164419768877056/yhosgeldirrn.png";
    const supheliResim = "https://cdn.discordapp.com/attachments/591299755976425493/614151181752860672/yhosgeldirrn.png";
    const arkaPlanResim = "https://cdn.discordapp.com/attachments/591299755976425493/614164413318168606/Adsz.png";

    // Hesap yaşı kontrolü (1 Ay = 2629800000 ms)
    const kurulus = Date.now() - member.user.createdTimestamp;
    let kontrolResimLink = kurulus > 2629800000 ? guvenliResim : supheliResim;

    // Resimleri yükle
    const background = await Canvas.loadImage(arkaPlanResim);
    const kontrolKatmani = await Canvas.loadImage(kontrolResimLink);
    // Avatarı PNG formatında ve 128px boyutunda alıyoruz
    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png', size: 128 }));

    // Arka planı çiz
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
    // Güvenlik durum katmanını (Yeşil/Kırmızı filtre) çiz
    ctx.drawImage(kontrolKatmani, 0, 0, canvas.width, canvas.height);

    // Avatarı daire içine alma ve çizme
    ctx.save(); // Mevcut durumu kaydet
    ctx.beginPath();
    ctx.arc(180, 46, 36, 0, Math.PI * 2, true); // Daire koordinatları
    ctx.closePath();
    ctx.clip(); // Çizim alanını bu daireyle sınırla
    ctx.drawImage(avatar, 143, 10, 73, 72);
    ctx.restore(); // Sınırlandırmayı kaldır

    // Attachment oluşturma (v14 Standartı)
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'lnd-guvenlik.png' });

    // Kanala gönder
    const durumMesaji = kurulus > 2629800000 ? "✅ Güvenli" : "⚠️ Şüpheli (Yeni Hesap)";
    chan.send({ 
        content: `📥 **${member.user.tag}** sunucuya katıldı. \n**Güvenlik Durumu:** ${durumMesaji}`, 
        files: [attachment] 
    });
});

// Bot Eklendim Atıldım Mesajı komutu komutlar/eklendigim.js dosyasında yer almaktadır, bu kod bloğu sadece botun sunucuya eklendiği olayını dinleyerek çalışır ve eklenme mesajını yönetir.

// --- SUNUCUYA EKLENDİM LOG ---
client.on("guildCreate", async guild => {
    const logKanal = client.channels.cache.get("1496894443322740837");
    if (!logKanal) return;

    // v14'te sunucu sahibini çekmek için fetchOwner gerekir
    const owner = await guild.fetchOwner().catch(() => null);

    const eklendimEmbed = new EmbedBuilder()
        .setTitle("✅ SUNUCUYA EKLENDİM")
        .setColor("Green")
        .setThumbnail(guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
        .addFields(
            { name: '🏰 Sunucu İsmi', value: `\`${guild.name}\``, inline: true },
            { name: '🆔 Sunucu ID', value: `\`${guild.id}\``, inline: true },
            { name: '👥 Üye Sayısı', value: `\`${guild.memberCount}\``, inline: true },
            { name: '👑 Kurucu', value: `\`${owner ? owner.user.tag : "Bulunamadı"}\``, inline: true },
            { name: '👤 Kurucu ID', value: `\`${owner ? owner.id : "Bulunamadı"}\``, inline: true }
        )
        .setFooter({ text: "Legends Never Die", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    logKanal.send({ embeds: [eklendimEmbed] });
});

// --- SUNUCUDAN ATILDIM LOG ---
client.on("guildDelete", async guild => {
    const logKanal = client.channels.cache.get("1496894443322740837");
    if (!logKanal) return;

    const atildimEmbed = new EmbedBuilder()
        .setTitle("❌ SUNUCUDAN ATILDIM")
        .setColor("Red")
        .setThumbnail(guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
        .addFields(
            { name: '🏰 Sunucu İsmi', value: `\`${guild.name}\``, inline: true },
            { name: '🆔 Sunucu ID', value: `\`${guild.id}\``, inline: true },
            { name: '👥 Üye Sayısı', value: `\`${guild.memberCount}\``, inline: true }
        )
        .setFooter({ text: "Legends Never Die", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    logKanal.send({ embeds: [atildimEmbed] });
});

// Mod Log Sistemi komutu komutlar/modlog.js dosyasında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve mod log sistemini yönetir.

const botadi = "Legends Never Die";

// --- Mesaj Silme ---
client.on('messageDelete', async message => {
    if (message.author?.bot || !message.guild) return;
    let modlogs = db.get(`modlogkanaly_${message.guild.id}`);
    const modlogkanal = message.guild.channels.cache.get(modlogs);
    if (!modlogkanal) return;

    const embed = new EmbedBuilder()
        .setColor("#080000")
        .setAuthor({ name: `${message.author.tag} tarafından bir mesaj silindi`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp()
        .setFooter({ text: `${botadi} | Mod-Log Sistemi`, iconURL: message.author.displayAvatarURL() });

    if (message.content.length > 1024) {
        embed.addFields({ name: "Silinen Mesaj", value: "```Mesaj 1024 karakterden uzun olduğu için gösterilemiyor...```" });
    } else {
        embed.addFields({ name: "Silinen Mesaj:", value: `\`\`\`${message.content || "Mesaj içeriği bulunamadı (Resim vb.)"}\`\`\`` });
    }
    
    modlogkanal.send({ embeds: [embed] });
});

// --- Ban Ekleme ---
client.on('guildBanAdd', async (ban) => {
    let modlogs = db.get(`modlogkanaly_${ban.guild.id}`);
    const modlogkanal = ban.guild.channels.cache.get(modlogs);
    if (!modlogkanal) return;

    const embed = new EmbedBuilder()
        .setColor("#080000")
        .setAuthor({ name: "Bir kişi sunucudan yasaklandı" })
        .setThumbnail(ban.user.displayAvatarURL())
        .addFields({ name: `Yasaklanan kişi`, value: `\`\`\`${ban.user.tag}\`\`\`` })
        .setFooter({ text: `${botadi} | Mod-Log Sistemi` })
        .setTimestamp();

    modlogkanal.send({ embeds: [embed] });
});

// --- Ban Kaldırma ---
client.on('guildBanRemove', async (ban) => {
    let modlogs = db.get(`modlogkanaly_${ban.guild.id}`);
    const modlogkanal = ban.guild.channels.cache.get(modlogs);
    if (!modlogkanal) return;

    const embed = new EmbedBuilder()
        .setColor("#080000")
        .setAuthor({ name: "Bir kişinin yasağı kaldırıldı" })
        .setThumbnail(ban.user.displayAvatarURL())
        .addFields({ name: `Yasağı kaldırılan kişi`, value: `\`\`\`${ban.user.tag}\`\`\`` })
        .setFooter({ text: `${botadi} | Mod-Log Sistemi` })
        .setTimestamp();

    modlogkanal.send({ embeds: [embed] });
});

// --- Kanal Oluşturma ---
client.on('channelCreate', async channel => {
    if (!channel.guild) return;
    let modlogs = db.get(`modlogkanaly_${channel.guild.id}`);
    const modlogkanal = channel.guild.channels.cache.get(modlogs);
    if (!modlogkanal) return;

    const tur = channel.type === ChannelType.GuildText ? "Metin Kanalı" : channel.type === ChannelType.GuildVoice ? "Ses Kanalı" : "Kategori/Diğer";

    const embed = new EmbedBuilder()
        .setColor("#080000")
        .addFields(
            { name: `Bir Kanal Oluşturuldu`, value: `\`\`\`${channel.name}\`\`\`` },
            { name: `Kanal Türü`, value: `\`\`\`${tur}\`\`\`` }
        )
        .setTimestamp()
        .setFooter({ text: `${botadi} | Mod-Log Sistemi` });

    modlogkanal.send({ embeds: [embed] });
});

// --- Kanal Silme ---
client.on('channelDelete', async channel => {
    if (!channel.guild) return;
    let modlogs = db.get(`modlogkanaly_${channel.guild.id}`);
    const modlogkanal = channel.guild.channels.cache.get(modlogs);
    if (!modlogkanal) return;

    const tur = channel.type === ChannelType.GuildText ? "Metin Kanalı" : channel.type === ChannelType.GuildVoice ? "Ses Kanalı" : "Kategori/Diğer";

    const embed = new EmbedBuilder()
        .setColor("#080000")
        .addFields(
            { name: `Bir Kanal Silindi`, value: `\`\`\`${channel.name}\`\`\`` },
            { name: `Kanal Türü`, value: `\`\`\`${tur}\`\`\`` }
        )
        .setTimestamp()
        .setFooter({ text: `${botadi} | Mod-Log Sistemi` });

    modlogkanal.send({ embeds: [embed] });
});

// --- Mesaj Düzenleme ---
client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author?.bot || !oldMessage.guild || oldMessage.content === newMessage.content) return;
    
    let modlogs = db.get(`modlogkanaly_${oldMessage.guild.id}`);
    const modlogkanal = oldMessage.guild.channels.cache.get(modlogs);
    if (!modlogkanal) return;

    const embed = new EmbedBuilder()
        .setColor("#080000")
        .setAuthor({ name: `${oldMessage.author.tag} mesajını düzenledi`, iconURL: oldMessage.author.displayAvatarURL() })
        .addFields(
            { name: `Eski mesaj:`, value: `\`\`\`${oldMessage.content || "İçerik Yok"}\`\`\`` },
            { name: `Yeni Mesaj:`, value: `\`\`\`${newMessage.content || "İçerik Yok"}\`\`\`` }
        )
        .setTimestamp()
        .setFooter({ text: `${botadi} | Mod-Log Sistemi`, iconURL: oldMessage.author.displayAvatarURL() });

    modlogkanal.send({ embeds: [embed] });
});

// --- Rol/Emoji Oluşturma ve Silme (Özet) ---
const events = [
    { event: 'roleCreate', title: 'Yeni Bir Rol Oluşturuldu', field: 'Rol İsmi' },
    { event: 'roleDelete', title: 'Bir Rol Silindi', field: 'Silinen Rol' },
    { event: 'emojiCreate', title: 'Yeni Bir Emoji Eklendi', field: 'Emoji İsmi' },
    { event: 'emojiDelete', title: 'Bir Emoji Silindi', field: 'Silinen Emoji' }
];

events.forEach(e => {
    client.on(e.event, async item => {
        let modlogs = db.get(`modlogkanaly_${item.guild.id}`);
        const modlogkanal = item.guild.channels.cache.get(modlogs);
        if (!modlogkanal) return;

        const embed = new EmbedBuilder()
            .setColor("#080000")
            .addFields({ name: e.title, value: `\`\`\`${item.name}\`\`\`` })
            .setTimestamp()
            .setFooter({ text: `${botadi} | Mod-Log Sistemi` });

        modlogkanal.send({ embeds: [embed] });
    });
});

// Bot Eklendiği Zaman Sunucu Sahibine Özel Mesaj


client.on("guildCreate", async guild => {
    // Sunucu sahibini fetch ediyoruz (v14'te bu işlem asenkrondur)
    const owner = await guild.fetchOwner().catch(() => null);
    if (!owner) return;

    const hosgeldinEmbed = new EmbedBuilder()
        .setColor("Random")
        .setTitle("Hoş Buldum!")
        .setDescription(
            "Hey, ben **Legends Never Die**. Az önce sunucunuza eklendim.\n\n" +
            "📌 `&yardım` yazarak komutlarım hakkında bilgi alabilirsin.\n" +
            "🔗 Daha fazla destek ve bilgi için sunucumuza gelebilirsin.\n" +
            "**Davet Linkimiz:** https://discord.gg/7T2FNXaUZx"
        )
        .setFooter({ text: "Sunucu kurucusu olduğunuzdan dolayı bu mesaj sadece size gönderildi." })
        .setTimestamp();

    // Sahibine DM gönderiyoruz
    owner.send({ embeds: [hosgeldinEmbed] }).catch(err => {
        console.log(`${guild.name} sunucusunun sahibine DM gönderilemedi, kapalı olabilir.`);
    });
});

// Fake Katıl Ayrıl Sistemi


// --- Fake Katıl Komutu ---
client.on('messageCreate', async message => {
    if (message.content === '&fakekatıl') {
        // Sadece yöneticiler test edebilsin (Güvenlik için)
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        // guildMemberAdd olayını tetikler
        client.emit('guildMemberAdd', message.member);
        
        message.reply("✅ `Fakekatıl` olayı senin için tetiklendi! Hoş geldin sistemini kontrol et.");
    }
});

// --- Fake Ayrıl Komutu ---
client.on('messageCreate', async message => {
    if (message.content === '&fakeayrıl') {
        // Sadece yöneticiler test edebilsin
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        // guildMemberRemove olayını tetikler
        client.emit('guildMemberRemove', message.member);
        
        message.reply("✅ `Fakeayrıl` olayı senin için tetiklendi! Ayrılma sistemini kontrol et.");
    }
});

// Hoşgeldin Seninle X Kişiyiz Sistemi komutu komutlar/hosgeldinseninlex.js dosyasında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve hoşgeldin seninle x kişiyiz sistemini yönetir.

require('moment-duration-format');

client.on("guildMemberAdd", async member => {
    // Sunucu ID Kontrolü
    if (member.guild.id !== "374894897917853707") return;

    // Üye sayısını emojili hale getirme
    let üyeSayısı = member.guild.memberCount.toString();
    const emojiSayılar = {
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

    let emojiliSayi = üyeSayısı.split('').map(rakam => emojiSayılar[rakam] || rakam).join('');

    // Zaman ve Güvenlik Ayarları
    const aylartoplam = {
        "01": "Ocak", "02": "Şubat", "03": "Mart", "04": "Nisan", "05": "Mayıs", "06": "Haziran",
        "07": "Temmuz", "08": "Ağustos", "09": "Eylül", "10": "Ekim", "11": "Kasım", "12": "Aralık"
    };

    const kanalId = "1496393085679173672";
    const channel = member.guild.channels.cache.get(kanalId);
    if (!channel) return;

    const kurulus = Date.now() - member.user.createdTimestamp;
    const gun = Math.floor(kurulus / (1000 * 60 * 60 * 24)); // Gün hesaplama

    let kontrol;
    if (gun < 7) {
        kontrol = "<a:tehlikeli:727665292058296402> **Şüpheli Kullanıcı!** <a:tehlikeli:727665292058296402>";
    } else {
        kontrol = "<a:guvenli:727665294285209630> **Güvenilir Kullanıcı!** <a:guvenli:727665294285209630>";
    }

    // GIF Attachment (v14 Standartı)
    const gifUrl = "https://cdn.discordapp.com/attachments/1496393085679173672/1496895238093012992/hosgeldin.gif?ex=69f617d3&is=69f4c653&hm=6b2dd4e2fb81a960839f3f22d3994a7b2ef656f4f4f82c82627fb07f95cf30c7&";
    const attachment = new AttachmentBuilder(gifUrl, { name: 'hosgeldin.gif' });

    // Mesaj Gönderimi
    const tarih = `${moment(member.user.createdAt).format("DD")} ${aylartoplam[moment(member.user.createdAt).format("MM")]} ${moment(member.user.createdAt).format("YYYY HH:mm:ss")}`;

    channel.send({
        content: `<a:hgg:729628053789081610> **Hoş geldin** ${member}, seninle beraber ${emojiliSayi} kişiyiz!

**<a:galp:729628104007614504> Sunucumuz Klimalıdır.**

**<a:saril:729272950712303628> Hesap Kuruluş Zamanı: \`${tarih}\`**

**<a:patis:729628087574200360> Bu Kullanıcı:** ${kontrol}

**<a:tac:729628071417741354> <#828939840916946944> kanalından emojiye tıklayarak rolünüzü alabilirsiniz.**`,
        files: [attachment]
    });
});

// Kanalda Emojili Online Gösterme

client.on("messageCreate", async message => {
    // Sadece belirli bir kanalda veya prefix ile çalışmasını istiyorsan buraya kontrol ekleyebilirsin.
    if (message.author.bot || !message.guild) return;
    if (message.content !== "&istatistik-güncelle") return; // Örnek tetikleyici

    const braveKanal = client.channels.cache.get("702624607072682054");
    if (!braveKanal) return;

    let tag = "TAG"; // Buraya sunucu tagını yaz reis

    // 1. Ses Sayısı Hesaplama
    const sestekiÜyeler = message.guild.channels.cache
        .filter(c => c.type === ChannelType.GuildVoice)
        .reduce((acc, channel) => acc + channel.members.size, 0);

    // 2. Taglı Üye Sayısı
    const taglıÜyeler = message.guild.members.cache.filter(m => m.user.username.includes(tag)).size;

    // 3. Online Üye Sayısı (Presence Intent Gerektirir)
    const onlineÜyeler = message.guild.members.cache.filter(m => m.presence && m.presence.status !== "offline").size;

    // 4. Toplam Üye Sayısı
    const toplamÜye = message.guild.memberCount;

    // Emojilere Dönüştürme Fonksiyonu (Daha temiz bir yol)
    const emojiSayılar = {
        "0": "<a:sfr:729286531818192956>",
        "1": "<a:bir:729286555050442822>",
        "2": "<a:iki:729286572859588660>",
        "3": "<a:uc:729286583290691605>",
        "4": "<a:drt:729286597820022804>",
        "5": "<a:be:729286611803570246>",
        "6": "<a:alt:729286629381898301>",
        "7": "<a:yedi:729286654753505290>",
        "8": "<a:sekiz:729286667374166066>",
        "9": "<a:dokuz:729286681760497674>"
    };

    const convertToEmoji = (num) => num.toString().split('').map(d => emojiSayılar[d] || d).join('');

    // Konuyu Güncelle (Rate limit'e dikkat!)
    braveKanal.setTopic(
        `**Toplam Üye: __${convertToEmoji(toplamÜye)}__**\n` +
        `**Toplam Online: __${convertToEmoji(onlineÜyeler)}__**\n` +
        `**Sesteki Üye: __${convertToEmoji(sestekiÜyeler)}__**\n` +
        `**Taglı Üye: __${convertToEmoji(taglıÜyeler)}__**`
    ).then(() => {
        message.reply("✅ Kanal konusu başarıyla güncellendi!");
    }).catch(err => {
        console.error("Konu güncellenirken hata oluştu:", err.message);
    });
});

// Bakım modu kontrolü

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  // Bakım Modu Kontrolü
  const bakimSebep = await db.get('bakim_modu');
  if (bakimSebep && message.author.id !== ayarlar.sahip) {
    const bakimEmbed = new EmbedBuilder()
      .setTitle("🛠️ Bot Bakımda!")
      .setDescription(`Şu an size hizmet veremiyoruz. \n\n**Bakım Sebebi:** \`${bakimSebep}\``)
      .setColor("Red")
      .setFooter({ text: "LND Bot Bakım Sistemi" });
    return message.channel.send({ embeds: [bakimEmbed] });
  }
});

// Komut yükleme fonksiyonu (v14 Uyumlu)

fs.readdir("./komutlar/", (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut kontrol ediliyor...`);
    
    files.forEach(f => {
        try {
            // Sadece .js dosyalarını oku
            if (!f.endsWith(".js")) return;

            let props = require(`./komutlar/${f}`);

            // help veya name objesi eksikse botun çökmesini engelle
            if (!props || !props.help || !props.help.name) {
                console.log(`[HATA] ${f} dosyasının help.name kısmı eksik veya hatalı! Bu komut atlandı.`);
                return; 
            }

            log(`Yüklenen komut: ${props.help.name}.`);
            client.commands.set(props.help.name, props);
            
            if (props.conf && props.conf.aliases) {
                props.conf.aliases.forEach(alias => {
                    client.aliases.set(alias, props.help.name);
                });
            }
        } catch (e) {
            console.log(`[KRİTİK HATA] ${f} dosyası yüklenirken teknik bir hata oluştu: ${e.message}`);
        }
    });
});

// Otomatik tag sistemi ve ototag log kanalı komutları komutlar/ototagsistemi.js ve komutlar/ototagkanal.js dosyalarında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve otomatik tag sistemini yönetir.
client.on('guildMemberAdd', async member => {
    let tag = db.get(`ototag_${member.guild.id}`);
    if (tag) {
        // Üyenin adının başına tagı ekler
        await member.setNickname(`${tag} ${member.user.username}`).catch(() => {});
    }
});

// --- JAİL SİSTEMİ (v14) ---

// --- 1. Jail Koruması (Sunucuya Gireni Tekrar Jail'e Atar) ---
client.on('guildMemberAdd', async member => {
    // Kullanıcı jailde mi kontrol et
    const jailKontrol = db.get(`${member.guild.id}.jail.${member.user.id}`);
    if (jailKontrol) {
        // Ayarlı jail rolünü al
        let jailRolId = db.get(`jailrol_${member.guild.id}`);
        let rol = member.guild.roles.cache.get(jailRolId);
        if (!rol) return;

        // Kullanıcının rollerini temizle ve jail rolünü ver
        try {
            // v14'te tüm rolleri tek seferde set etmek daha sağlıklıdır
            await member.roles.set([rol.id]);

            const wasted = new EmbedBuilder()
                .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                .setColor(`#f3c7e1`)
                .setDescription(`⚠️ **Aa, beni kandıramazsın!** Jail cezan bitmeden sunucudan kaçamazsın.`)
                .setTimestamp()
                .setFooter({ text: "Legends Never Die Jail Sistemi" });

            // Kullanıcıya DM gönder (DM kapalıysa hata vermemesi için catch ekledik)
            member.send({ embeds: [wasted] }).catch(() => {});
            
            console.log(`[JAIL] ${member.user.tag} kaçmaya çalıştı ama tekrar yakalandı.`);
        } catch (err) {
            console.error("Jail işlemi sırasında hata:", err);
        }
    }
});

// --- 2. Resim Kanalında Sadece Görsel Paylaşım Kontrolü ---
client.on("messageCreate", async m => {
    // Sadece belirli bir kanal için çalışır
    if (m.channel.id !== "728927050701996113") return;
    
    // Botları ve sunucu sahibini muaf tutarız
    if (m.author.bot) return;
    if (m.author.id === m.guild.ownerId) return;

    // Eğer mesajda dosya/ek (attachment) yoksa mesajı siler
    if (m.attachments.size < 1) {
        try {
            await m.delete();
            // İsteğe bağlı: Kullanıcıya uyarı mesajı atıp 3 saniye sonra silebilirsin
            const uyari = await m.channel.send(`⚠️ **${m.author}**, bu kanalda sadece fotoğraf paylaşabilirsin!`);
            setTimeout(() => uyari.delete().catch(() => {}), 3000);
        } catch (err) {
            console.log("Mesaj silinemedi, yetki yetersiz olabilir.");
        }
    }
});


// --- RELOAD KOMUTU (v14) ---

client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}.js`)];
            let cmd = require(`./komutlar/${command}.js`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};


// --- SAYAÇ SİSTEMİ (v14) ---

// --- 1. Mesaj Kontrolü (Hedefe Ulaşıldı mı?) ---
client.on("messageCreate", async message => {
    if (!message.guild || message.author.bot) return;

    let sayac = JSON.parse(fs.readFileSync("./ayarlar/sayac.json", "utf8"));
    
    if (sayac[message.guild.id]) {
        const hedef = sayac[message.guild.id].sayi;
        const mevcut = message.guild.memberCount;

        if (hedef <= mevcut) {
            const basariEmbed = new EmbedBuilder()
                .setDescription(`🎉 **Tebrikler!** Başarılı bir şekilde **${hedef}** kullanıcı hedefine ulaştık!`)
                .setColor("Grey")
                .setTimestamp()
                .setFooter({ text: "LND Bot | Sayaç Sistemi" });

            message.channel.send({ embeds: [basariEmbed] });

            // Hedefe ulaşıldığı için veriyi temizle
            delete sayac[message.guild.id];
            fs.writeFile("./ayarlar/sayac.json", JSON.stringify(sayac, null, 2), (err) => {
                if (err) console.error("Sayaç dosyası yazılırken hata oluştu:", err);
            });
        }
    }
});

// --- 2. Üye Ayrılma (Güle Güle) ---
client.on("guildMemberRemove", async member => {
    let sayac = JSON.parse(fs.readFileSync("./ayarlar/sayac.json", "utf8"));
    
    if (!sayac[member.guild.id] || !sayac[member.guild.id].kanal) return;

    try {
        const kanalId = sayac[member.guild.id].kanal;
        const hedef = sayac[member.guild.id].sayi;
        const kanal = member.guild.channels.cache.get(kanalId);
        
        if (kanal) {
            kanal.send(`📤 **${member.user.tag}** aramızdan ayrıldı! **${hedef}** kişi olmamıza **${hedef - member.guild.memberCount}** kişi kaldı!`);
        }
    } catch (e) {
        console.log("Sayaç çıkış mesajı hatası:", e);
    }
});

// --- 3. Üye Katılma (Hoş Geldin) ---
client.on("guildMemberAdd", async member => {
    let sayac = JSON.parse(fs.readFileSync("./ayarlar/sayac.json", "utf8"));
    
    if (!sayac[member.guild.id] || !sayac[member.guild.id].kanal) return;

    try {
        const kanalId = sayac[member.guild.id].kanal;
        const hedef = sayac[member.guild.id].sayi;
        const kanal = member.guild.channels.cache.get(kanalId);
        
        if (kanal) {
            kanal.send(`📥 **${member.user.tag}** aramıza katıldı! **${hedef}** kişi olmamıza **${hedef - member.guild.memberCount}** kişi kaldı!`);
        }
    } catch (e) {
        console.log("Sayaç giriş mesajı hatası:", e);
    }
});

// --- OTOROL V2 (v14) ---


client.on("guildMemberAdd", async member => {
    // JSON dosyasını oku
    let otorolData;
    try {
        otorolData = JSON.parse(fs.readFileSync("./jsonlar/otorol.json", "utf8"));
    } catch (err) {
        return console.error("Otorol dosyası okunamadı:", err);
    }

    // Sunucuya özel ayar var mı kontrol et
    const ayar = otorolData[member.guild.id];
    if (!ayar) return;

    const rolId = ayar.sayi; // Veritabanında rol ID'si 'sayi' olarak kayıtlı
    const kanalId = ayar.kanal;

    // 1. Rolü Verme İşlemi
    const verilecekRol = member.guild.roles.cache.get(rolId);
    if (verilecekRol) {
        member.roles.add(verilecekRol).catch(e => console.error("Otorol verilirken hata oluştu (Yetki yetersiz olabilir):", e.message));
    }

    // 2. Log Kanalına Bilgi Gönderme
    const logKanali = member.guild.channels.cache.get(kanalId);
    if (logKanali) {
        const otorolEmbed = new EmbedBuilder()
            .setTitle("🦁 Otorol Sistemi")
            .setDescription(`📢 **${member.user.tag}** sunucuya katıldı ve **${verilecekRol ? verilecekRol.name : "Bilinmeyen Rol"}** rolü başarıyla verildi.`)
            .setColor("Green")
            .setFooter({ text: "Legends Never Die", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        logKanali.send({ 
            content: `✅ Hoş geldin **${member.user.tag}**, rolün başarıyla tanımlandı.`,
            embeds: [otorolEmbed] 
        }).catch(() => {});
    }
});

// Level Sistemi komutu komutlar/level.js dosyasında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve level sistemini yönetir.

client.on("messageCreate", async message => {
    // Temel Kontroller
    if (message.author.bot || !message.guild) return;
    
    let prefix = ayarlar.prefix;
    if (message.content.startsWith(prefix)) return;

    const gid = message.guild.id;
    const uid = message.author.id;

    // Sistemin açık olup olmadığını kontrol et
    let hm = db.get(`seviyeacik_${gid}`);
    if (!hm) return;

    // Ayarları çek
    let logKanalId = db.get(`svlog_${gid}`);
    let verilecekXP = db.get(`verilecekxp_${gid}`) || 4; // Eğer ayarlanmamışsa varsayılan 4
    let seviyeRolId = db.get(`svrol_${gid}`);
    let rolSeviyeSiniri = db.get(`rollevel_${gid}`);

    // Kullanıcı verilerini çek
    let xp = db.get(`xp_${uid}_${gid}`) || 0;
    let lvl = db.get(`lvl_${uid}_${gid}`) || 1;
    let xpToLvl = db.get(`xpToLvl_${uid}_${gid}`) || 100;

    // XP Ekleme
    db.add(`xp_${uid}_${gid}`, verilecekXP);
    let yeniXP = xp + verilecekXP;

    // Seviye Atlama Kontrolü
    if (yeniXP >= xpToLvl) {
        let yeniLvl = lvl + 1;
        let yeniXpToLvl = yeniLvl * 100;

        db.set(`lvl_${uid}_${gid}`, yeniLvl);
        db.set(`xpToLvl_${uid}_${gid}`, yeniXpToLvl);
        db.set(`xp_${uid}_${gid}`, 0); // Seviye atlayınca XP'yi sıfırlıyoruz

        // Log Kanalına Bilgi Gönder
        const logKanal = message.guild.channels.cache.get(logKanalId);
        if (logKanal) {
            logKanal.send(`🎉 **${message.author.username}** Seviye Atladı! Yeni seviyesi: \`${yeniLvl}\` Tebrikler!`);
        }

        // Seviye Rolü Ödülü Kontrolü
        if (seviyeRolId && rolSeviyeSiniri) {
            if (yeniLvl >= rolSeviyeSiniri) {
                const rol = message.guild.roles.cache.get(seviyeRolId);
                if (rol && !message.member.roles.cache.has(rol.id)) {
                    await message.member.roles.add(rol.id).catch(e => console.log("Rol verilirken hata oluştu."));
                    
                    if (logKanal) {
                        logKanal.send(`🎭 **${message.author.username}**, \`${rolSeviyeSiniri}\` seviyeye ulaştığı için **${rol.name}** rolünü kazandı!`);
                    }
                }
            }
        }
    }
});

// Büyük harf engelleme sistemi komutu komutlar/büyükharfengel.js dosyasında yer almaktadır, bu kod bloğu sadece mesaj oluşturma olayını dinleyerek çalışır ve büyük harf kullanımını engeller.
client.on("messageCreate", async msg => {
    if (msg.channel.type === 1) return; // DM kutusunu atla
    if (msg.author.bot) return;
    
    if (msg.content.length > 4) {
        const capsDurum = await db.get(`capslock_${msg.guild.id}`);
        if (capsDurum === 'acik') {
            // Mesajın %50'den fazlası büyük harfse veya tamamen büyükse
            let capsCount = (msg.content.match(/[A-ZĞÜŞİÖÇ]/g) || []).length;
            if (capsCount > msg.content.length / 2) {
                if (!msg.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                    msg.delete().catch(() => {});
                    return msg.channel.send(`✋ ${msg.author}, bu sunucuda büyük harf kullanımı engelleniyor!`).then(m => {
                        setTimeout(() => m.delete(), 5000);
                    });
                }
            }
        }
    }
});

// --- SA-AS SİSTEMİ ---
client.on("messageCreate", async msg => {
    // Botların mesajlarını ve DM'leri görmezden gel
    if (msg.author.bot || !msg.guild) return;

    // Veritabanından sistemin açık olup olmadığını kontrol et
    const durum = await db.get(`ssaass_${msg.guild.id}`);
    
    if (durum === 'acik') {
        // Mesaj içeriğini küçük harfe çevirip selam varyasyonlarını kontrol et
        const selamlar = ['sa', 's.a', 'selamun aleyküm', 'selamün aleyküm', 'sea'];
        
        if (selamlar.includes(msg.content.toLowerCase())) {
            try {
                // v14 reply sistemi mesajı etiketleyerek cevap verir
                return msg.reply({ 
                    content: '<a:sevgi:729692496359194624> __***Aleyküm Selam, Hoşgeldin***__ <a:yanak:729692486401785906> ^^',
                    allowedMentions: { repliedUser: true } // Cevap verirken kullanıcıyı etiketler
                });
            } catch (err) {
                console.log("Selam verme hatası:", err);
            }
        }
    }
});


// --- BOT EVENTLERİ ---
const { Events, ActivityType } = require('discord.js');

client.on(Events.ClientReady, () => {
    const prefix = ayarlar.prefix;
    const zaman = moment().format("YYYY-MM-DD HH:mm:ss");
    const sunucuSayisi = client.guilds.cache.size.toLocaleString();
    const kullaniciSayisi = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString();
    const kanalSayisi = client.channels.cache.size.toLocaleString();

    // --- 1. DURUM LİSTESİ ---
const durumlar = [
    `🌐 http://lndbot.duckdns.org/ | ${sunucuSayisi} Sunuc | ${kullaniciSayisi} Kullanıcı`,
    `http://lndbot.duckdns.org/ - Otorol Güncellendi🔥`,
    `http://lndbot.duckdns.org/ - V14 Güncellemesi 🔥`,
    `http://lndbot.duckdns.org/ - Rol-Kanal Koruma Aktif⚠️`,
    `http://lndbot.duckdns.org/ - Reklam Engel Aktif⭐️`,
    `http://lndbot.duckdns.org/ 🔥 &davet 🔥 &otorol 🔥 &reklamk 🔥 &yardım`
];

    // --- 2. OTOMATİK DURUM DEĞİŞTİRME ---
    setInterval(() => {
        const randomDurum = durumlar[Math.floor(Math.random() * durumlar.length)];
        client.user.setActivity(randomDurum, { type: ActivityType.Playing });
    }, 5000); // 5 saniyede bir değişir (Discord sınırları için ideal)

    // --- 3. KONSOL LOGLARI ---
    console.log(chalk.green(`✅ [GİRİŞ] ${client.user.tag} olarak giriş yapıldı!`));
    console.log(chalk.yellow(`Legends Never Die bot kullanıma hazır!`));
    console.log(chalk.magenta(`[${zaman}] BOT: Şu an ${kanalSayisi} kanala, ${sunucuSayisi} sunucuya ve ${kullaniciSayisi} kullanıcıya hizmet veriliyor!`));
});

client.on("messageDelete", async (message) => {
    if (message.author?.bot || !message.guild || !message.content) return;
    db.set(`snipe.id.${message.guild.id}`, {
        icerik: message.content,
        yazar: message.author.id,
        kanal: message.channel.id,
        tarih: Date.now()
    });
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const content = message.content.toLowerCase();
    const prefix = ayarlar.prefix;

    // --- 1. ÖZEL KELİME CEVAPLARI ---
    const otoCevaplar = {
        "günaydın": "<a:saril:729272950712303628> __***Günaydın Güzellik***__ <a:galp:727665292976586895> ^^",
        "iyi geceler": "<a:saril:729272950712303628> __***İyi Geceler Güzellik***__ <a:galp:727665292976586895> ^^",
        "görüşürüz": "<a:saril:729272950712303628> __***Görüşürüz Güzellik***__ <a:galp:727665292976586895> ^^",
        "dc": "Sunucumuza bu linkten katılabilirsiniz: https://discord.gg/7T2FNXaUZx"
    };

    if (otoCevaplar[content]) {
        return message.reply({ content: otoCevaplar[content] }).then(sentMsg => {
            if (content !== "dc") setTimeout(() => sentMsg.delete().catch(() => {}), 5000);
        });
    }

    // --- 2. YAPIMCI ETİKETLEME ---
    if (content === `<@${ayarlar.sahip}>` || content === "<@351695051962843136>") {
        return message.channel.send("👑 **Yapımcım senuzulme Aramızda!**").then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // --- 3. KOMUT SİSTEMİ ---
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

        if (cmd) {
            const durum = db.get(`komut_durum_${cmd.help.name}_${message.guild.id}`) || 'acik';
            if (durum === 'kapali') return message.reply("Bu sunucuda bu komut panel üzerinden deaktif edilmiş!");
            return cmd.run(client, message, args);
        }
    }

    // --- 4. BAKIM MODU ---
    const bakimSebep = db.get('bakim_modu');
    if (bakimSebep && message.author.id !== ayarlar.sahip) {
        const bakimEmbed = new EmbedBuilder()
            .setTitle("🛠️ Bot Bakımda!")
            .setDescription(`Şu an size hizmet veremiyoruz. \n**Bakım Sebebi:** \`${bakimSebep}\``)
            .setColor("Red");
        return message.channel.send({ embeds: [bakimEmbed] });
    }

    // --- 6. GOLD ÜYE DUYURUSU ---
    let goldlar = db.get("gold_uyeler") || [];
    if (goldlar.includes(message.author.id)) {
        let sonDuyuru = db.get(`goldsure_${message.author.id}`);
        if (!sonDuyuru || (Date.now() - sonDuyuru) > 5000) {
            const goldEmbed = new EmbedBuilder()
                .setColor("Blue")
                .setDescription("<a:golduye:729966557119381559> **Hizaya Geçin! Burada Bir Gold Üye Belirdi!**")
                .setFooter({ text: `Gold Üye: ${message.author.tag}` });
            message.channel.send({ embeds: [goldEmbed] }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
            db.set(`goldsure_${message.author.id}`, Date.now());
        }
    }
});

// --- KOMUT YÜKLEYİCİ ---

fs.readdir("./komutlar/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(f => {
        if (!f.endsWith(".js")) return;
        try {
            let props = require(`./komutlar/${f}`);
            client.commands.set(props.help.name, props);
            if (props.conf && props.conf.aliases) {
                props.conf.aliases.forEach(alias => client.aliases.set(alias, props.help.name));
            }
        } catch (e) {
            console.log(chalk.red(`❌ ${f} yüklenirken hata oluştu: ${e.message}`));
        }
    });
    log(`${client.commands.size} komut yüklendi.`);
});

// --- KRİTİK HATA YAKALAYICILAR ---
process.on("unhandledRejection", (reason, p) => {
    console.log(chalk.red("[HATA] Yakalanamayan Reddetme:"), reason);
});

// --- BAŞLATMA ---
client.login(ayarlar.token);
