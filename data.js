/*
 * 拼讀大冒險 - 單元資料
 * 想新增單字：在對應單元的 raw 陣列加一行，格式為
 *   '單字|中文|圖示emoji(可留空)|拼法規則(可留空)'
 * 拼法規則 p（用在「補上缺少拼法」與「找出不一樣的字」題型）：
 *   短母音單元：p 是押韻字尾，例如 cat → at、sock → ock
 *   'sh'    一般字母組合
 *   'a_e'   魔法 e（母音＋字尾 e）
 *   'un-'   字首；'-ful' 字尾
 * 綜合單元（有 from）：會從指定的單元抽字，題庫是這些單元的全部單字
 * 音節單元(syl:true)的單字用 - 分隔音節，例如 'ba-na-na|香蕉|🍌'
 */
const STAGES = {
  1: { name: '第一階段：基礎拼讀', sub: 'Phonics Basics' },
  2: { name: '第二階段：長母音與母音組合', sub: 'Vowel Sounds' },
  3: { name: '第三階段：進階拼寫（銜接中高年級）', sub: 'Advanced Spelling' }
};

const UNITS = [
  {
    id: 'letters', name: '字母聲音', en: 'Letter Sounds', icon: '🔤', stage: 1,
    tip: '先快速複習 26 個字母的「聲音」。每個字母想一個代表單字，例如 B 就是 ball 開頭的 /b/ 聲音。',
    raw: [
      'apple|蘋果|🍎|a', 'ball|球|⚽|b', 'cat|貓|🐱|c', 'dog|狗|🐶|d', 'egg|蛋|🥚|e',
      'fish|魚|🐟|f', 'goat|山羊|🐐|g', 'hat|帽子|🎩|h', 'insect|昆蟲|🐛|i', 'jam|果醬|🍓|j',
      'kite|風箏|🪁|k', 'lion|獅子|🦁|l', 'moon|月亮|🌙|m', 'nest|鳥巢|🪺|n', 'orange|柳橙|🍊|o',
      'pig|豬|🐷|p', 'queen|女王|👸|q', 'rabbit|兔子|🐰|r', 'sun|太陽|☀️|s', 'tiger|老虎|🐯|t',
      'umbrella|雨傘|☂️|u', 'van|廂型車|🚐|v', 'water|水|💧|w', 'fox|狐狸|🦊|x', 'yellow|黃色|💛|y', 'zebra|斑馬|🦓|z'
    ]
  },

  /* ---------- 短母音：五個母音各一關，最後一關綜合 ---------- */
  {
    id: 'short-a', name: '短母音 a', en: 'Short A', icon: '🐱', stage: 1,
    tip: '短母音 a 唸 /æ/，像 cat。找出「押韻」的字：cat、hat、bat 都有 -at，唸起來尾巴一樣！先聽，再唸，把聲音「黏」起來：/k/ /æ/ /t/ → cat。',
    raw: [
      'cat|貓|🐱|at', 'hat|帽子|🎩|at', 'bat|蝙蝠|🦇|at', 'rat|老鼠|🐀|at', 'mat|墊子||at', 'chat|聊天|💬|at', 'flat|平的||at',
      'can|罐頭|🥫|an', 'fan|電風扇||an', 'man|男人|👨|an', 'pan|平底鍋|🍳|an', 'van|廂型車|🚐|an', 'ran|跑（過去式）||an',
      'map|地圖|🗺️|ap', 'cap|有帽簷的帽子|🧢|ap', 'nap|小睡|😴|ap', 'tap|輕拍||ap', 'lap|大腿（坐著時）||ap', 'clap|拍手|👏|ap',
      'bag|袋子|👜|ag', 'tag|標籤|🏷️|ag', 'flag|旗子|🚩|ag', 'rag|抹布||ag',
      'sad|難過的|😢|ad', 'bad|壞的|👎|ad', 'mad|生氣的|😠|ad', 'dad|爸爸||ad', 'pad|便條本|📝|ad',
      'jam|果醬|🍓|am', 'ham|火腿|🍖|am', 'ram|公羊|🐏|am', 'yam|地瓜|🍠|am',
      'black|黑色|⬛|ack', 'back|背部||ack', 'pack|打包|🎒|ack', 'snack|點心|🍪|ack',
      'hand|手|✋|and', 'sand|沙子|🏖️|and', 'band|樂團|🎸|and', 'land|陸地||and',
      'ant|螞蟻|🐜|ant', 'crab|螃蟹|🦀|ab', 'cab|計程車|🚕|ab'
    ]
  },
  {
    id: 'short-e', name: '短母音 e', en: 'Short E', icon: '🛏️', stage: 1,
    tip: '短母音 e 唸 /ɛ/，像 pen、bed。嘴巴微微張開，不要唸成 /eɪ/（那是字母 A 的名字）。',
    raw: [
      'pet|寵物|🐾|et', 'net|網子|🥅|et', 'wet|濕的|💦|et', 'jet|噴射機|✈️|et', 'set|一組||et', 'get|得到||et', 'vet|獸醫|🩺|et',
      'pen|筆|🖊️|en', 'hen|母雞|🐔|en', 'ten|十|🔟|en', 'men|男人們||en', 'den|獸穴||en',
      'bed|床|🛏️|ed', 'red|紅色|🟥|ed', 'sled|雪橇|🛷|ed', 'fed|餵（過去式）||ed', 'shed|小棚屋||ed',
      'leg|腿|🦵|eg', 'peg|掛釘||eg', 'beg|乞求||eg',
      'bell|鈴鐺|🔔|ell', 'shell|貝殼|🐚|ell', 'well|井||ell', 'sell|賣||ell', 'tell|告訴||ell', 'smell|聞|👃|ell',
      'nest|鳥巢|🪺|est', 'best|最好的|👍|est', 'test|測驗|📝|est', 'vest|背心|🦺|est', 'rest|休息||est', 'west|西方||est',
      'tent|帳篷|⛺|ent', 'bent|彎曲的||ent', 'went|去（過去式）||ent', 'dent|凹痕||ent',
      'neck|脖子||eck', 'deck|甲板||eck', 'check|檢查|✅|eck',
      'web|蜘蛛網|🕸️|eb', 'elf|精靈|🧝|elf', 'desk|書桌||esk', 'belt|腰帶||elt', 'egg|蛋|🥚|egg'
    ]
  },
  {
    id: 'short-i', name: '短母音 i', en: 'Short I', icon: '🐷', stage: 1,
    tip: '短母音 i 唸 /ɪ/，像 pig、sit。短短的、輕輕的，不要唸成 /aɪ/（那是字母 I 的名字）。',
    raw: [
      'pig|豬|🐷|ig', 'big|大的||ig', 'dig|挖|⛏️|ig', 'wig|假髮||ig', 'fig|無花果||ig',
      'lip|嘴唇|👄|ip', 'zip|拉鍊||ip', 'tip|小費||ip', 'hip|臀部||ip', 'sip|啜飲||ip', 'dip|沾||ip', 'trip|旅行|🧳|ip', 'drip|滴落|💧|ip',
      'sit|坐||it', 'hit|打||it', 'bit|一點點||it', 'kit|工具組|🧰|it', 'fit|合身||it', 'pit|坑洞||it',
      'pin|別針|📌|in', 'bin|垃圾桶|🗑️|in', 'win|贏|🏆|in', 'fin|魚鰭||in', 'tin|錫罐||in', 'chin|下巴||in', 'spin|旋轉|🌀|in',
      'hill|小山|⛰️|ill', 'pill|藥丸|💊|ill', 'fill|裝滿||ill', 'will|將會||ill', 'bill|帳單|🧾|ill', 'drill|鑽孔||ill',
      'sick|生病的|🤒|ick', 'pick|挑選||ick', 'stick|樹枝||ick', 'chick|小雞|🐤|ick', 'brick|磚塊|🧱|ick', 'kick|踢||ick',
      'six|六|6️⃣|ix', 'mix|混合||ix', 'fix|修理|🔧|ix',
      'king|國王|🤴|ing', 'ring|戒指|💍|ing', 'sing|唱歌|🎤|ing', 'wing|翅膀||ing', 'swing|盪鞦韆||ing',
      'pink|粉紅色|🌸|ink', 'sink|水槽|🚰|ink', 'drink|喝|🥤|ink', 'wink|眨眼|😉|ink'
    ]
  },
  {
    id: 'short-o', name: '短母音 o', en: 'Short O', icon: '🐶', stage: 1,
    tip: '短母音 o 唸 /ɑ/，像 dog、hot。嘴巴張大一點，像醫生說「啊」。',
    raw: [
      'hot|熱的|🔥|ot', 'pot|鍋子|🍲|ot', 'dot|圓點|⚫|ot', 'cot|行軍床||ot', 'got|得到（過去式）||ot', 'lot|很多||ot', 'spot|斑點||ot',
      'mop|拖把||op', 'hop|單腳跳|🐇|op', 'top|頂端|🔝|op', 'pop|爆開|🍿|op', 'stop|停止|🛑|op', 'drop|掉落||op', 'shop|商店|🏪|op', 'chop|砍||op',
      'dog|狗|🐶|og', 'log|圓木|🪵|og', 'fog|霧|🌫️|og', 'frog|青蛙|🐸|og', 'jog|慢跑|🏃|og', 'hog|大豬||og',
      'box|盒子|📦|ox', 'fox|狐狸|🦊|ox', 'ox|公牛|🐂|ox',
      'clock|時鐘|🕐|ock', 'sock|襪子|🧦|ock', 'rock|岩石|🪨|ock', 'lock|鎖|🔒|ock', 'dock|碼頭||ock', 'block|積木||ock',
      'job|工作|💼|ob', 'rob|搶劫||ob', 'mob|暴民||ob', 'sob|啜泣||ob',
      'nod|點頭||od', 'rod|釣竿|🎣|od', 'cod|鱈魚|🐟|od', 'pod|豆莢||od',
      'long|長的||ong', 'song|歌曲|🎶|ong', 'strong|強壯的|💪|ong'
    ]
  },
  {
    id: 'short-u', name: '短母音 u', en: 'Short U', icon: '☀️', stage: 1,
    tip: '短母音 u 唸 /ʌ/，像 sun、bug。嘴巴放鬆，聲音短短的。',
    raw: [
      'bug|小蟲|🐞|ug', 'hug|擁抱|🤗|ug', 'mug|馬克杯||ug', 'rug|地毯||ug', 'jug|水壺||ug', 'plug|插頭|🔌|ug', 'dug|挖（過去式）||ug',
      'sun|太陽|☀️|un', 'run|跑|🏃|un', 'fun|好玩|🎉|un', 'bun|小圓麵包||un', 'spun|旋轉（過去式）||un',
      'cut|切|✂️|ut', 'nut|堅果|🥜|ut', 'shut|關上||ut', 'but|但是||ut',
      'tub|浴缸|🛁|ub', 'rub|搓揉||ub', 'cub|幼獸|🐻|ub', 'club|社團||ub',
      'jump|跳|🦘|ump', 'bump|撞到||ump', 'pump|打氣筒||ump', 'dump|倒掉||ump',
      'duck|鴨子|🦆|uck', 'truck|卡車|🚚|uck', 'luck|運氣|🍀|uck', 'stuck|卡住的||uck',
      'bus|公車|🚌|us', 'plus|加|➕|us', 'dust|灰塵||ust', 'must|必須||ust', 'rust|鏽||ust',
      'gum|口香糖||um', 'drum|鼓|🥁|um', 'sum|總和||um',
      'cup|杯子|☕|up', 'pup|小狗||up', 'up|向上|⬆️|up', 'junk|廢物||unk', 'trunk|行李箱||unk'
    ]
  },
  {
    id: 'short', name: '短母音大挑戰', en: 'Short Vowels Mix', icon: '🎯', stage: 1,
    from: ['short-a', 'short-e', 'short-i', 'short-o', 'short-u'], take: 6, raw: [],
    tip: '五個短母音混在一起！聽仔細：cat、pen、pig、dog、sun，母音的聲音都不一樣。題目會從前面五關的所有單字裡抽出來。',
  },

  /* ---------- 子音組合 ---------- */
  {
    id: 'bl-l', name: 'L 組合', en: 'L-Blends', icon: '🌸', stage: 1,
    tip: '子音組合（blends）：兩個子音連在一起，每個聲音都要聽得到。這一關是 bl、cl、fl、gl、pl、sl：bl-ack、cl-ap、fl-ag。',
    raw: [
      'black|黑色|⬛|bl', 'blue|藍色|🟦|bl', 'block|積木||bl', 'blink|眨眼|😉|bl', 'blow|吹||bl', 'blanket|毯子||bl', 'blend|混合||bl', 'blind|盲的||bl',
      'clap|拍手|👏|cl', 'clock|時鐘|🕐|cl', 'clam|蛤蜊||cl', 'class|班級|🏫|cl', 'clip|迴紋針|📎|cl', 'club|社團||cl', 'cloud|雲|☁️|cl', 'clean|乾淨的|🧼|cl',
      'flag|旗子|🚩|fl', 'flat|平的||fl', 'flip|翻轉||fl', 'flash|閃光|⚡|fl', 'flame|火焰|🔥|fl', 'flock|鳥群||fl', 'flower|花|🌸|fl', 'floor|地板||fl',
      'glad|高興的|😊|gl', 'glass|玻璃杯|🥛|gl', 'glove|手套|🧤|gl', 'glue|膠水||gl', 'glow|發光||gl', 'globe|地球儀|🌐|gl',
      'plan|計畫||pl', 'plant|植物|🪴|pl', 'plug|插頭|🔌|pl', 'plus|加|➕|pl', 'plum|李子||pl', 'plate|盤子|🍽️|pl', 'plane|飛機|✈️|pl', 'play|玩||pl',
      'slam|用力關上||sl', 'sled|雪橇|🛷|sl', 'sleep|睡覺|😴|sl', 'slide|溜滑梯||sl', 'slip|滑倒||sl', 'slow|慢的|🐢|sl', 'slim|苗條的||sl', 'slap|拍打||sl'
    ]
  },
  {
    id: 'bl-r', name: 'R 組合', en: 'R-Blends', icon: '🐸', stage: 1,
    tip: '這一關是 br、cr、dr、fr、gr、pr、tr。r 的聲音要把舌頭往後捲：br-ush、fr-og、tr-ain。',
    raw: [
      'brick|磚塊|🧱|br', 'bring|帶來||br', 'brush|刷子|🪥|br', 'brave|勇敢的||br', 'bread|麵包|🍞|br', 'break|打破||br', 'brown|棕色|🟫|br', 'branch|樹枝|🌿|br', 'bridge|橋|🌉|br',
      'crab|螃蟹|🦀|cr', 'crib|嬰兒床||cr', 'crop|農作物||cr', 'crown|皇冠|👑|cr', 'cry|哭|😭|cr', 'crash|撞擊||cr', 'crisp|酥脆的||cr', 'cream|鮮奶油||cr',
      'drum|鼓|🥁|dr', 'drop|掉落||dr', 'drip|滴落|💧|dr', 'drink|喝|🥤|dr', 'dress|洋裝|👗|dr', 'drive|開車|🚗|dr', 'dragon|龍|🐉|dr', 'draw|畫畫|🎨|dr',
      'frog|青蛙|🐸|fr', 'from|來自||fr', 'fruit|水果|🍉|fr', 'fry|油炸|🍳|fr', 'fresh|新鮮的||fr', 'free|免費的||fr', 'fridge|冰箱||fr', 'frown|皺眉||fr',
      'grab|抓住||gr', 'grass|草地|🌱|gr', 'green|綠色|🟩|gr', 'grin|咧嘴笑|😁|gr', 'grape|葡萄|🍇|gr', 'grow|生長||gr', 'gray|灰色||gr', 'grill|烤架||gr',
      'press|按壓||pr', 'prize|獎品|🏆|pr', 'print|列印|🖨️|pr', 'prince|王子|🤴|pr', 'pretty|漂亮的||pr', 'proud|驕傲的||pr', 'price|價格|🏷️|pr',
      'trip|旅行|🧳|tr', 'track|跑道||tr', 'tree|樹|🌳|tr', 'truck|卡車|🚚|tr', 'train|火車|🚆|tr', 'trap|陷阱||tr', 'trick|把戲||tr', 'trash|垃圾|🗑️|tr'
    ]
  },
  {
    id: 'bl-s', name: 'S 與 TW 組合', en: 'S-Blends & TW', icon: '🐍', stage: 1,
    tip: '這一關是 sc、sk、sm、sn、sp、st、sw、tw。s 的聲音像蛇「嘶～」，後面的聲音要緊接著出來：s-n-ake、s-t-ar。',
    raw: [
      'scarf|圍巾|🧣|sc', 'scale|磅秤|⚖️|sc', 'school|學校|🏫|sc', 'scoop|舀||sc', 'score|得分||sc', 'scare|嚇||sc',
      'skip|跳過||sk', 'skin|皮膚||sk', 'skate|溜冰|⛸️|sk', 'sky|天空||sk', 'skunk|臭鼬||sk', 'skirt|裙子||sk', 'skull|頭骨|💀|sk',
      'smell|聞|👃|sm', 'smile|微笑|😊|sm', 'smoke|煙|💨|sm', 'smart|聰明的||sm', 'smash|砸碎||sm', 'small|小的||sm',
      'snack|點心|🍪|sn', 'snail|蝸牛|🐌|sn', 'snake|蛇|🐍|sn', 'snap|啪一聲||sn', 'snow|雪|❄️|sn', 'sneeze|打噴嚏|🤧|sn', 'snip|剪||sn',
      'spin|旋轉|🌀|sp', 'spoon|湯匙|🥄|sp', 'spot|斑點||sp', 'spell|拼字||sp', 'speed|速度||sp', 'spider|蜘蛛|🕷️|sp', 'space|太空|🚀|sp', 'spice|香料||sp',
      'star|星星|⭐|st', 'stop|停止|🛑|st', 'step|腳步|👣|st', 'stick|樹枝||st', 'stone|石頭|🪨|st', 'storm|暴風雨|⛈️|st', 'stamp|郵票||st', 'stand|站立||st',
      'swim|游泳|🏊|sw', 'swing|盪鞦韆||sw', 'sweet|甜的|🍬|sw', 'swan|天鵝|🦢|sw', 'sweep|掃||sw', 'swap|交換||sw',
      'twin|雙胞胎||tw', 'twig|細枝||tw', 'twist|扭轉||tw', 'twelve|十二||tw', 'twenty|二十||tw'
    ]
  },
  {
    id: 'blends', name: '子音組合大挑戰', en: 'Blends Mix', icon: '🧩', stage: 1,
    from: ['bl-l', 'bl-r', 'bl-s'], take: 5,
    tip: '三個子音連在一起也不怕：str-ong、spr-ing、scr-eam、spl-ash。題目會從 L、R、S 組合三關的所有單字裡抽出來。',
    raw: [
      'strong|強壯的|💪|str', 'street|街道|🛣️|str', 'straw|吸管|🥤|str', 'string|細繩||str', 'stream|小溪||str', 'strip|長條||str',
      'spring|春天|🌱|spr', 'spray|噴霧||spr', 'spread|塗抹||spr', 'sprout|發芽||spr',
      'scrub|刷洗||scr', 'screen|螢幕|🖥️|scr', 'scrap|碎片||scr', 'scream|尖叫|😱|scr',
      'splash|濺起水花|💦|spl', 'split|分開||spl', 'splat|啪嗒||spl'
    ]
  },
  {
    id: 'endbl', name: '字尾子音組合', en: 'Ending Blends', icon: '🏕️', stage: 1,
    tip: '子音組合也會出現在字的後面：hand 的 -nd、lamp 的 -mp、nest 的 -st、gift 的 -ft。字尾的兩個聲音都要唸出來，不要吞掉喔！',
    raw: [
      'hand|手|✋|nd', 'sand|沙子|🏖️|nd', 'wind|風|💨|nd', 'pond|池塘||nd', 'find|找到||nd', 'bend|彎曲||nd', 'stand|站立||nd',
      'ant|螞蟻|🐜|nt', 'tent|帳篷|⛺|nt', 'plant|植物|🪴|nt', 'mint|薄荷|🌿|nt', 'hunt|打獵||nt', 'went|去（過去式）||nt',
      'pink|粉紅色|🌸|nk', 'sink|水槽|🚰|nk', 'drink|喝|🥤|nk', 'bank|銀行|🏦|nk', 'thank|謝謝|🙏|nk', 'trunk|行李箱||nk', 'skunk|臭鼬||nk', 'wink|眨眼|😉|nk',
      'jump|跳|🦘|mp', 'lamp|檯燈|💡|mp', 'camp|露營|🏕️|mp', 'stamp|郵票||mp', 'pump|打氣筒||mp', 'bump|撞到||mp',
      'nest|鳥巢|🪺|st', 'best|最好的|👍|st', 'vest|背心|🦺|st', 'fast|快的||st', 'list|清單|📋|st', 'lost|迷路的||st', 'dust|灰塵||st',
      'gift|禮物|🎁|ft', 'lift|舉起||ft', 'left|左邊||ft', 'soft|柔軟的||ft', 'raft|木筏||ft',
      'milk|牛奶|🥛|lk', 'silk|絲綢||lk', 'belt|腰帶||lt', 'melt|融化||lt', 'felt|感覺（過去式）||lt', 'salt|鹽|🧂|lt',
      'gold|黃金|🥇|ld', 'cold|冷的|🥶|ld', 'hold|握住||ld', 'wild|野生的||ld',
      'desk|書桌||sk', 'mask|面具|😷|sk', 'task|任務||sk', 'help|幫助|🆘|lp', 'act|行動|🎭|ct', 'fact|事實||ct'
    ]
  },

  /* ---------- 雙字母音 ---------- */
  {
    id: 'digraphs', name: '雙字母音 sh ch th wh', en: 'Digraphs', icon: '🐚', stage: 1,
    tip: '雙字母音（digraphs）：兩個字母合起來只發一個新聲音。sh（安靜的噓聲）、ch（火車聲）、th（舌尖輕咬）、wh（吹蠟燭）。',
    raw: [
      'ship|船|🚢|sh', 'shell|貝殼|🐚|sh', 'fish|魚|🐟|sh', 'shop|商店|🏪|sh', 'shut|關上||sh', 'shed|小棚屋||sh', 'brush|刷子|🪥|sh', 'dish|盤子|🍽️|sh', 'wish|願望|🌠|sh', 'cash|現金|💵|sh', 'shirt|襯衫|👕|sh', 'sheep|綿羊|🐑|sh',
      'chair|椅子|🪑|ch', 'cheese|起司|🧀|ch', 'chip|洋芋片|🍟|ch', 'lunch|午餐|🍱|ch', 'chin|下巴||ch', 'chop|砍||ch', 'check|檢查|✅|ch', 'chick|小雞|🐤|ch', 'bench|長椅||ch', 'much|很多||ch', 'rich|富有的||ch', 'such|如此||ch',
      'three|三|3️⃣|th', 'thumb|大拇指|👍|th', 'bath|洗澡|🛁|th', 'this|這個||th', 'that|那個||th', 'with|和||th', 'then|然後||th', 'them|他們||th', 'thin|薄的||th', 'thick|厚的||th', 'path|小徑||th', 'moth|飛蛾||th',
      'whale|鯨魚|🐋|wh', 'wheel|輪子|🛞|wh', 'white|白色|⬜|wh', 'when|何時||wh', 'what|什麼||wh', 'which|哪一個||wh', 'whip|鞭子||wh', 'whisper|低語||wh'
    ]
  },
  {
    id: 'digraphs2', name: '雙字母音 ck ng tch ph qu', en: 'Digraphs 2', icon: '🐘', stage: 1,
    tip: 'ck 唸 /k/（duck）、ng 是鼻音（ring）、tch 唸 /tʃ/（match）、ph 唸 /f/（phone）、qu 唸 /kw/（queen）。',
    raw: [
      'duck|鴨子|🦆|ck', 'clock|時鐘|🕐|ck', 'sock|襪子|🧦|ck', 'rock|岩石|🪨|ck', 'back|背部||ck', 'neck|脖子||ck', 'kick|踢||ck', 'pick|挑選||ck', 'lock|鎖|🔒|ck', 'black|黑色|⬛|ck',
      'ring|戒指|💍|ng', 'sing|唱歌|🎤|ng', 'king|國王|🤴|ng', 'wing|翅膀||ng', 'song|歌曲|🎶|ng', 'long|長的||ng', 'hang|掛||ng', 'bang|砰||ng', 'strong|強壯的|💪|ng',
      'match|火柴||tch', 'catch|接住||tch', 'watch|手錶|⌚|tch', 'patch|補丁||tch', 'witch|女巫|🧙|tch', 'kitchen|廚房||tch', 'pitch|投球||tch', 'fetch|去取來||tch',
      'phone|手機|📱|ph', 'photo|照片|📷|ph', 'elephant|大象|🐘|ph', 'dolphin|海豚|🐬|ph', 'alphabet|字母表|🔤|ph', 'trophy|獎盃|🏆|ph',
      'queen|女王|👸|qu', 'quick|快的||qu', 'quiet|安靜的|🤫|qu', 'quiz|小考||qu', 'quilt|被子||qu', 'quack|嘎嘎叫||qu'
    ]
  },

  /* ---------- 第二階段 ---------- */
  {
    id: 'magice', name: '魔法 e', en: 'Magic E', icon: '🪄', stage: 2,
    tip: '魔法 e（magic e）：字尾的 e 不發音，但會讓前面的母音唸它自己的「名字」。cap → cape、kit → kite、hop → hope。',
    raw: [
      'cake|蛋糕|🍰|a_e', 'game|遊戲|🎮|a_e', 'name|名字||a_e', 'lake|湖|🏞️|a_e', 'gate|大門|🚪|a_e', 'make|製作||a_e', 'plane|飛機|✈️|a_e', 'snake|蛇|🐍|a_e',
      'bike|腳踏車|🚲|i_e', 'kite|風箏|🪁|i_e', 'five|五|5️⃣|i_e', 'ride|騎||i_e', 'nine|九|9️⃣|i_e', 'slide|溜滑梯||i_e', 'smile|微笑|😊|i_e', 'white|白色|⬜|i_e',
      'home|家|🏠|o_e', 'bone|骨頭|🦴|o_e', 'nose|鼻子|👃|o_e', 'rope|繩子|🪢|o_e', 'rose|玫瑰|🌹|o_e', 'stone|石頭|🪨|o_e', 'smoke|煙|💨|o_e', 'globe|地球儀|🌐|o_e',
      'cube|立方體|🧊|u_e', 'tube|管子||u_e', 'flute|長笛|🪈|u_e', 'huge|巨大的||u_e', 'rule|規則||u_e', 'cute|可愛的||u_e', 'these|這些||e_e', 'theme|主題||e_e'
    ]
  },
  {
    id: 'teams', name: '母音組合', en: 'Vowel Teams', icon: '🌧️', stage: 2,
    tip: '母音組合：兩個母音一起出現，通常第一個唸名字、第二個不發音。ai/ay 唸 /eɪ/、ee/ea 唸 /iː/、oa/ow 唸 /oʊ/、igh 唸 /aɪ/。',
    raw: [
      'mail|信件|✉️|ai', 'snail|蝸牛|🐌|ai', 'rain|雨|🌧️|ai', 'tail|尾巴||ai', 'train|火車|🚆|ai', 'paint|油漆|🎨|ai',
      'day|天||ay', 'play|玩|🤸|ay', 'tray|托盤||ay', 'gray|灰色||ay', 'stay|停留||ay', 'say|說||ay',
      'tree|樹|🌳|ee', 'sheep|綿羊|🐑|ee', 'queen|女王|👸|ee', 'jeep|吉普車|🚙|ee', 'green|綠色|🟩|ee', 'sleep|睡覺|😴|ee',
      'dream|夢|💭|ea', 'clean|乾淨的|🧼|ea', 'peach|桃子|🍑|ea', 'leaf|葉子|🍃|ea', 'beach|海灘|🏖️|ea', 'read|閱讀||ea',
      'boat|船|⛵|oa', 'goat|山羊|🐐|oa', 'coat|外套|🧥|oa', 'road|道路|🛣️|oa', 'soap|肥皂|🧼|oa', 'toast|吐司|🍞|oa',
      'snow|雪|❄️|ow', 'yellow|黃色|💛|ow', 'window|窗戶|🪟|ow', 'slow|慢的|🐢|ow', 'grow|生長||ow', 'show|展示||ow',
      'night|夜晚|🌙|igh', 'light|燈|💡|igh', 'high|高的||igh', 'right|對的||igh', 'fight|打架||igh', 'bright|明亮的||igh'
    ]
  },
  {
    id: 'rctrl', name: 'r 控制母音', en: 'R-Controlled Vowels', icon: '🚗', stage: 2,
    tip: 'r 控制母音：母音後面接 r，聲音會改變。ar 像 car、or 像 corn；er、ir、ur 聽起來都一樣，像 bird、her、turn。',
    raw: [
      'car|車|🚗|ar', 'star|星星|⭐|ar', 'farm|農場|🚜|ar', 'shark|鯊魚|🦈|ar', 'park|公園|🏞️|ar', 'card|卡片||ar',
      'corn|玉米|🌽|or', 'fork|叉子|🍴|or', 'horse|馬|🐴|or', 'storm|暴風雨|⛈️|or', 'short|短的||or', 'sport|運動||or',
      'her|她的||er', 'fern|蕨類|🌿|er', 'sister|姐妹|👧|er', 'butter|奶油|🧈|er', 'water|水|💧|er', 'letter|信||er',
      'bird|鳥|🐦|ir', 'girl|女孩|👧|ir', 'shirt|襯衫|👕|ir', 'dirt|泥土||ir', 'first|第一||ir', 'skirt|裙子||ir',
      'turn|轉||ur', 'nurse|護理師|🧑‍⚕️|ur', 'purple|紫色|🟣|ur', 'burn|燒|🔥|ur', 'hurt|受傷||ur', 'curl|捲||ur'
    ]
  },
  {
    id: 'diph', name: '特殊母音', en: 'OO, OU, OI, AW', icon: '🏠', stage: 2,
    tip: '特殊母音：oo（moon 長音／book 短音）、ou 與 ow 唸 /aʊ/（house、cow）、oi 與 oy 唸 /ɔɪ/（coin、boy）、aw 唸 /ɔ/（saw）。',
    raw: [
      'moon|月亮|🌙|oo', 'food|食物|🍔|oo', 'cool|酷|😎|oo', 'book|書|📖|oo', 'foot|腳|🦶|oo', 'cook|煮|🍳|oo', 'zoo|動物園|🦁|oo', 'tooth|牙齒|🦷|oo',
      'house|房子|🏠|ou', 'mouse|老鼠|🐭|ou', 'mouth|嘴巴|👄|ou', 'out|外面||ou', 'cloud|雲|☁️|ou', 'round|圓的||ou',
      'cow|牛|🐮|ow', 'owl|貓頭鷹|🦉|ow', 'town|城鎮|🏘️|ow', 'brown|棕色|🟫|ow', 'down|向下|⬇️|ow', 'crowd|人群||ow',
      'coin|硬幣|🪙|oi', 'oil|油||oi', 'soil|泥土||oi', 'point|指||oi',
      'boy|男孩|👦|oy', 'toy|玩具|🧸|oy', 'joy|喜悅|😄|oy', 'enjoy|享受||oy',
      'paw|爪子|🐾|aw', 'draw|畫畫|🎨|aw', 'straw|吸管|🥤|aw', 'saw|看見（過去式）||aw'
    ]
  },

  /* ---------- 第三階段 ---------- */
  {
    id: 'silent', name: '不發音字母', en: 'Silent Letters', icon: '🤫', stage: 3,
    tip: '有些字母「看得到、聽不到」：kn 的 k 不唸（knee）、wr 的 w 不唸（write）、mb 的 b 不唸（lamb）、gn 的 g 不唸（sign）。',
    raw: [
      'knee|膝蓋||kn', 'knife|刀子|🔪|kn', 'knock|敲門|🚪|kn', 'know|知道||kn', 'knot|結|🪢|kn',
      'write|寫|✍️|wr', 'wrong|錯的|❌|wr', 'wrap|包裹|🎁|wr', 'wrist|手腕||wr', 'wrinkle|皺紋||wr',
      'lamb|小羊|🐑|mb', 'comb|梳子|🪮|mb', 'climb|爬|🧗|mb', 'thumb|大拇指|👍|mb', 'sign|標誌|🪧|gn', 'gnat|小飛蟲||gn'
    ]
  },
  {
    id: 'sight', name: '高頻字', en: 'Sight Words', icon: '👀', stage: 3,
    tip: '高頻字（sight words）：很常出現、但不太照規則拼的字，要靠「看到就認得」。多聽、多唸，也要會拼。',
    raw: [
      'said|說（過去式）|', 'were|是（複數過去式）|', 'because|因為|', 'friend|朋友|🧑‍🤝‍🧑', 'again|再一次|',
      'there|那裡|', 'their|他們的|', 'would|會、願意|', 'could|能夠|', 'should|應該|',
      'through|穿過|', 'enough|足夠的|', 'together|一起|', 'people|人們|👥', 'answer|答案|',
      'always|總是|', 'every|每一個|', 'thought|想（過去式）|💭', 'whole|整個的|', 'favorite|最愛的|❤️', 'different|不同的|',
      'beautiful|美麗的|', 'friendly|友善的|', 'laugh|笑|😆', 'though|雖然|', 'important|重要的|', 'country|國家|🌏', 'special|特別的|'
    ]
  },
  {
    id: 'affix', name: '字首與字尾', en: 'Prefix & Suffix', icon: '🧱', stage: 3,
    tip: '字首字尾像積木：un-（不）、re-（再一次）、-ful（充滿）、-less（沒有）、-ing（正在）、-ed（過去）。看懂積木，就能猜出新單字的意思。',
    raw: [
      'unhappy|不開心的|😞|un-', 'unlock|解鎖|🔓|un-', 'undo|復原||un-', 'unfair|不公平的||un-', 'unkind|不友善的||un-',
      'replay|重播|🔁|re-', 'redo|重做||re-', 'retell|重述||re-', 'rewrite|改寫|✏️|re-', 'rebuild|重建||re-',
      'helpful|有幫助的||-ful', 'careful|小心的||-ful', 'colorful|多彩的|🌈|-ful', 'wonderful|很棒的||-ful', 'thankful|感謝的||-ful',
      'hopeless|絕望的||-less', 'careless|粗心的||-less', 'homeless|無家可歸的||-less', 'fearless|無畏的||-less',
      'jumping|跳躍中|🦘|-ing', 'reading|閱讀中|📖|-ing',
      'jumped|跳了||-ed', 'painted|畫了|🎨|-ed', 'walked|走了|🚶|-ed'
    ]
  },
  {
    id: 'syl', name: '音節', en: 'Syllables', icon: '👏', stage: 3, syl: true,
    tip: '音節：每個音節有一個母音聲音。可以用拍手，或感覺下巴往下掉的次數來數，例如 ba-na-na 有 3 個音節。長單字拆開唸就不難了！',
    raw: [
      'book|書|📖', 'strong|強壯的|💪', 'ap-ple|蘋果|🍎', 'ti-ger|老虎|🐯', 'pen-cil|鉛筆|✏️',
      'ba-na-na|香蕉|🍌', 'el-e-phant|大象|🐘', 'um-brel-la|雨傘|☂️', 'com-pu-ter|電腦|💻', 'di-no-saur|恐龍|🦖',
      'but-ter-fly|蝴蝶|🦋', 'yes-ter-day|昨天|', 'beau-ti-ful|美麗的|', 'ad-ven-ture|冒險|🗺️', 'im-por-tant|重要的|',
      'wa-ter-mel-on|西瓜|🍉', 'dic-tion-ar-y|字典|📕', 'in-for-ma-tion|資訊|', 'tel-e-vi-sion|電視|📺',
      'im-ag-i-na-tion|想像力|💭', 'hip-po-pot-a-mus|河馬|🦛'
    ]
  },
  {
    id: 'endings', name: '常見字尾', en: 'Word Endings', icon: '📺', stage: 3,
    tip: '常見字尾：-tion 與 -sion 唸 /ʃən/ 或 /ʒən/（nation、television），-ture 唸 /tʃər/（picture）。這些在中高年級的單字非常常見。',
    raw: [
      'nation|國家|🌍|-tion', 'station|車站|🚉|-tion', 'action|行動||-tion', 'vacation|假期|🏖️|-tion', 'question|問題|❓|-tion',
      'picture|圖畫|🖼️|-ture', 'future|未來||-ture', 'nature|自然|🌿|-ture', 'adventure|冒險|🗺️|-ture', 'creature|生物|🦎|-ture',
      'television|電視|📺|-sion', 'decision|決定||-sion', 'vision|視力|👁️|-sion', 'mission|任務|🚀|-sion'
    ]
  }
];
