function getTag() {

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
            'https://en.wikipedia.org/wiki/JoJo%27s_Bizarre_Adventure'
        ),

        createImgTextTag(
            'Lucky Star',
            'imgs/luckyStar.jpg',
            'https://en.wikipedia.org/wiki/Lucky_Star_(manga)'
        ),

        createImgTextTag(
            'My Little Pony',
            'imgs/mlp.webp',
            'https://en.wikipedia.org/wiki/My_Little_Pony'
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
            'Overwatch',
            'imgs/overwatch.webp',
            'https://overwatch.blizzard.com/'
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

        createImgTextTag(
            'P maru / P丸様',
            'imgs/pmaru.webp',
            'https://www.youtube.com/@Pmarusama'
        ),

        createImgTextTag(
            'Oshi no Ko / 推しの子',
            'imgs/oshinoko.jpg',
            'https://ja.wikipedia.org/wiki/%E3%80%90%E6%8E%A8%E3%81%97%E3%81%AE%E5%AD%90%E3%80%91'
        ),

        createImgTextTag(
            'EVA',
            'imgs/nerv.webp',
            'https://ja.wikipedia.org/wiki/%E6%96%B0%E4%B8%96%E7%B4%80%E3%82%A8%E3%83%B4%E3%82%A1%E3%83%B3%E3%82%B2%E3%83%AA%E3%82%AA%E3%83%B3'
        ),

        createImgTextTag(
            'Made In Abyss',
            'imgs/Nanachi.webp',
            'https://en.wikipedia.org/wiki/Made_in_Abyss'
        ),

        createImgTextTag(
            'Pantheon',
            'imgs/Laurie.jpg',
            'https://www.imdb.com/title/tt11680642/'
        ),

        createImgTextTag(
            '1984',
            'imgs/1984.jpg',
            'https://en.wikipedia.org/wiki/Nineteen_Eighty-Four'
        ),

        createImgTextTag(
            'Penguin Drum<br>(輪るピングドラム)',
            'imgs/penguindrum.webp',
            'http://penguindrum.jp/'
        ),

        createImgTextTag(
            'FL Studio',
            'imgs/flstudio.jpg',
            'https://www.image-line.com/'
        ),

        createImgTextTag(
            'Baki the Grappler / 刃牙',
            'imgs/baki.webp',
            'https://www.netflix.com/title/80204451'
        ),

        createImgTextTag(
            'Guilty Crown<br>(ギルティクラウン)',
            'imgs/egoist.webp',
            'https://ja.wikipedia.org/wiki/%E3%82%AE%E3%83%AB%E3%83%86%E3%82%A3%E3%82%AF%E3%83%A9%E3%82%A6%E3%83%B3'
        ),

        createImgTextTag(
            'Nyaruko: Crawling with Love<br>(ニャル子さん)',
            'imgs/nyaruko.webp',
            'https://ja.wikipedia.org/wiki/%E9%80%99%E3%81%84%E3%82%88%E3%82%8C!_%E3%83%8B%E3%83%A3%E3%83%AB%E5%AD%90%E3%81%95%E3%82%93'
        ),

        createImgTextTag(
            'Parasyte / 寄生獣',
            'imgs/migi.webp',
            'https://ja.wikipedia.org/wiki/%E5%AF%84%E7%94%9F%E7%8D%A3'
        ),

        createImgTextTag(
            'ハカイジュウ / 破壊獣',
            'imgs/hakaijuu.jpg',
            'https://ja.wikipedia.org/wiki/%E3%83%8F%E3%82%AB%E3%82%A4%E3%82%B8%E3%83%A5%E3%82%A6'
        ),

        createImgTextTag(
            'Attack on Titan<br>(進撃の巨人)',
            'imgs/attackOnTitan.webp',
            'https://ja.wikipedia.org/wiki/%E9%80%B2%E6%92%83%E3%81%AE%E5%B7%A8%E4%BA%BA'
        ),

        createImgTextTag(
            'MiSide',
            'imgs/mila.webp',
            'https://store.steampowered.com/app/2527500/_MiSide/'
        ),

        createImgTextTag(
            'The Familiar of Zero<br>(ゼロの使い魔)',
            'imgs/0.jpg',
            'https://ja.wikipedia.org/wiki/%E3%82%BC%E3%83%AD%E3%81%AE%E4%BD%BF%E3%81%84%E9%AD%94'
        ),

        createImgTextTag(
            'Toradora / とらドラ!',
            'imgs/Toradora.jpg  ',
            'https://ja.wikipedia.org/wiki/%E3%81%A8%E3%82%89%E3%83%89%E3%83%A9!'
        ),

        createImgTextTag(
            'HimeHina',
            'imgs/himehina.webp',
            'https://www.youtube.com/channel/UCFv2z4iM5vHrS8bZPq4fHQQ'
        ),
        
        createImgTextTag(
            'FX戦士くるみちゃん',
            'imgs/FX戦士.webp',
            'https://comic-walker.com/detail/KC_003160_S?episodeType=first'
        ),

    ];
}