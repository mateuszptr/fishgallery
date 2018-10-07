const {Client, RichEmbed} = require('discord.js');
const fs = require('fs');
let config;
let prefix;
let galleries;

const client = new Client();

const reload = () => {
    config = JSON.parse(fs.readFileSync('galleryconf.json', "utf8"));
    prefix = config.prefix;
    galleries = new Map();

    config.galleries.forEach((gallery) => {
        let urls = [];
        if(gallery.hasOwnProperty("files")) gallery.files.forEach((file) => {
            const content = fs.readFileSync(config.folder+file, "utf8");
            urls = urls.concat(content.split('\n'));
        });
        if(gallery.hasOwnProperty("subgalleries")) gallery.subgalleries.forEach((subgallery) => {
            urls = urls.concat(galleries.get(subgallery).urls);
        });
        galleries.set(gallery.name, {urls: urls, title: gallery.title});
    });
    console.log("Reloaded");
};

const displayImage = (gallery, channel) => {
    if(!galleries.has(gallery)) {
        channel.send('Brak galerii ' + gallery);
        return;
    }

    //console.log('Gallery '+gallery);
    const urls = galleries.get(gallery).urls;
    //console.log(galleries.get(gallery));
    const url = urls[Math.floor(Math.random()*urls.length)];

    //console.log('Url: ' + url);
    const embed = new RichEmbed()
        .setTitle(galleries.get(gallery).title)
        .setImage(url)
        .setURL(url);

    channel.send(embed);
};

client.on('ready', () => {
    console.log('Ready');
});

client.on('message', (message) => {
    if(!message.content.startsWith(prefix)) return;
    const gallery = message.content.replace(new RegExp("^" + prefix), '');
    if(gallery === '$reload')
        reload();
    else
        displayImage(gallery, message.channel);
});

reload();
client.login(process.env.DISCORD_TOKEN);