function getTag() {
    return [

        // '<div> \
        //     <img src=\'imgs/test.jpg\' style=\"width: 100px; height: 100px;\"/> \
        //     <center> \
        //         test \
        //     </center> \
        // </div>',

        // ['Hello World!', function () {
        //     console.log(this);
        //     $(this).css("color", randomColor);
        //     setInterval(() => $(this).css("color", randomColor), 1000);
        // }],

        // '<a href="somepage" style="font-size: 4em">Click Me!</a>',
        
        // [
        //     'Google',
        //     function () { $(this).click(e => window.open('https://www.google.com')) }
        // ]

        createImgTextTag(
            'KAFU / 可不',
            'imgs/kafu.jpg',
            'https://ja.wikipedia.org/wiki/%E5%8F%AF%E4%B8%8D(KAFU)'
        ),

        createImgTextTag(
            'Rabi-Ribi',
            'imgs/cocoa.jpg',
            'https://store.steampowered.com/app/400910/RabiRibi/'
        ),

        createImgTextTag(
            'TeamFortress 2',
            'imgs/tf2.webp',
            'https://store.steampowered.com/app/440/Team_Fortress_2/'
        ),

        createImgTextTag(
            'Portal',
            '../../img/ApertureScienceLogo.png',
            'https://store.steampowered.com/app/620/Portal_2/'
        ),

        createImgTextTag(
            'Psycho-Pass',
            'imgs/PsychoPass.jpg',
            'https://en.wikipedia.org/wiki/Psycho-Pass'
        ),

        createImgTextTag(
            'Half-Life',
            'imgs/hl2.jpg',
            'https://store.steampowered.com/app/220/HalfLife_2/'
        ),

        createImgTextTag(
            'Overlord',
            'imgs/overlord.jpg',
            'https://en.wikipedia.org/wiki/Overlord_(novel_series)'
        ),

        createImgTextTag(
            'JoJo',
            'imgs/jojo.jpg',
        ),

        createImgTextTag(
            'Lucky Star',
            'imgs/luckyStar.jpg',
            'https://en.wikipedia.org/wiki/Lucky_Star_(manga)'
        ),

        createImgTextTag(
            'My Little Pony',
            'imgs/mlp.webp',
        ),

        createImgTextTag(
            'Tanya / 幼女戦記',
            'imgs/tanya.jpg',
            'https://ja.wikipedia.org/wiki/%E5%B9%BC%E5%A5%B3%E6%88%A6%E8%A8%98'
        ),

        createImgTextTag(
            'Mahjong',
            'imgs/mahjong.jpg',
            'https://en.wikipedia.org/wiki/Japanese_mahjong'
        ),

        createImgTextTag(
            'Apex',
            'imgs/apex.webp',
            'https://www.ea.com/games/apex-legends'
        ),

        createImgTextTag(
            'Warframe',
            'imgs/warframe.webp',
            'https://www.warframe.com/'
        ),

        createImgTextTag(
            'Terraria',
            'imgs/terraria.jpg',
            'https://terraria.org/'
        ),

        createImgTextTag(
            'Kaguya Luna<br>(輝夜月)',
            'imgs/kaguya_luna.jpg',
            'https://www.youtube.com/@kaguyaluna'
        ),

        createImgTextTag(
            'The Elder Scrolls',
            'imgs/skyrim.jpg',
            'https://elderscrolls.bethesda.net/'
        ),

        createImgTextTag(
            'Minecraft',
            'imgs/mc.jpg',
            'https://www.minecraft.net/'
        ),

        createImgTextTag(
            'OneShot',
            'imgs/oneshot.jpg',
            'https://store.steampowered.com/app/420530/OneShot/'
        ),

        createImgTextTag(
            'Houshou Marine<br>(宝鐘マリン)',
            'imgs/houshou_marine.webp',
            'https://www.youtube.com/channel/UCCzUftO8KOVkV4wQG1vkUvg'
        ),

        createImgTextTag(
            'Monstercat',
            'imgs/monstercat.jpg',
            'https://www.monstercat.com/'
        ),

        createImgTextTag(
            'Overwatch 1',
            'imgs/overwatch.webp',
        ),

        createImgTextTag(
            'KonoSuba<br><small>(この素晴らしい世界に祝福を)</small>',
            'imgs/konosuba.jpg',
            'https://en.wikipedia.org/wiki/KonoSuba'
        ),

        createImgTextTag(
            'PayDay 2',
            'imgs/payday2.jpg',
            'https://www.paydaythegame.com/payday2/'
        ),

        createImgTextTag(
            'Celeste',
            'imgs/celeste.jpg',
            'https://www.celestegame.com/'
        ),

        createImgTextTag(
            'Mirror\'s Edge',
            'imgs/mirrors_edge.jpg',
            'https://store.steampowered.com/app/17410/Mirrors_Edge/'
        ),

        createImgTextTag(
            'Dishonored',
            'imgs/dishonored.jpg',
            'https://bethesda.net/en/game/dishonored'
        ),

    ];
}

function createImgTextTag(text, img, link = null) {
    let tag = '<div>';
    if (link) {
        tag += '<a href="' + link + '">';
    }
    tag += '<img src="' + img + '"/>';
    tag += '<center>' + text + '</center></div>';
    if (link) {
        tag += '</a>';
    }
    return tag;
}