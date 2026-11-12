/*
 * 拼讀大冒險 - 單元資料
 * 想新增單字：在對應單元的 raw 陣列加一行，格式為
 *   '單字|中文|圖示emoji(可留空)|拼法規則(可留空)'
 * 拼法規則 p：
 *   'sh'    一般字母組合（用在「補上缺少拼法」題型）
 *   'a_e'   魔法 e（母音＋字尾 e）
 *   'un-'   字首；'-ful' 字尾
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
  {
    id: 'short', name: '短母音', en: 'Short Vowels', icon: '🐱', stage: 1,
    tip: '短母音：a 像 cat、e 像 pen、i 像 sit、o 像 dog、u 像 sun。先聽，再唸，把三個聲音「黏」起來：/k/ /æ/ /t/ → cat。',
    raw: [
      'cat|貓|🐱|a', 'hat|帽子|🎩|a', 'bag|袋子|👜|a', 'map|地圖|🗺️|a', 'pan|平底鍋|🍳|a',
      'pen|筆|🖊️|e', 'bed|床|🛏️|e', 'net|網子|🥅|e', 'leg|腿|🦵|e', 'hen|母雞|🐔|e',
      'pig|豬|🐷|i', 'pin|別針|📌|i', 'lip|嘴唇|👄|i', 'zip|拉鍊||i', 'six|六|6️⃣|i',
      'dog|狗|🐶|o', 'box|盒子|📦|o', 'pot|鍋子|🍲|o', 'mop|拖把||o', 'fox|狐狸|🦊|o',
      'sun|太陽|☀️|u', 'cup|杯子|☕|u', 'bus|公車|🚌|u', 'bug|小蟲|🐞|u', 'nut|堅果|🥜|u'
    ]
  },
  {
    id: 'blends', name: '子音組合', en: 'Consonant Blends', icon: '🧩', stage: 1,
    tip: '子音組合（blends）：兩個子音連在一起，每個聲音都要聽得到，例如 bl-ack、st-op、fr-og。',
    raw: [
      'black|黑色|⬛|bl', 'blue|藍色|🟦|bl', 'clap|拍手|👏|cl', 'cloud|雲|☁️|cl', 'flag|旗子|🚩|fl',
      'flower|花|🌸|fl', 'frog|青蛙|🐸|fr', 'green|綠色|🟩|gr', 'grass|草|🌱|gr', 'plant|植物|🪴|pl',
      'plane|飛機|✈️|pl', 'sleep|睡覺|😴|sl', 'smile|微笑|😊|sm', 'snake|蛇|🐍|sn', 'spoon|湯匙|🥄|sp',
      'star|星星|⭐|st', 'stop|停止|🛑|st', 'swim|游泳|🏊|sw', 'train|火車|🚆|tr', 'truck|卡車|🚚|tr',
      'drum|鼓|🥁|dr', 'brush|刷子|🪥|br'
    ]
  },
  {
    id: 'digraphs', name: '雙字母音', en: 'Digraphs', icon: '🐚', stage: 1,
    tip: '雙字母音（digraphs）：兩個字母合起來只發一個新聲音。sh（安靜的噓聲）、ch（火車聲）、th（舌尖輕咬）、wh、ck。',
    raw: [
      'ship|船|🚢|sh', 'shell|貝殼|🐚|sh', 'fish|魚|🐟|sh', 'chair|椅子|🪑|ch', 'cheese|起司|🧀|ch',
      'chip|洋芋片|🍟|ch', 'lunch|午餐|🍱|ch', 'three|三|3️⃣|th', 'thumb|大拇指|👍|th', 'bath|洗澡||th',
      'this|這個||th', 'that|那個||th', 'whale|鯨魚|🐋|wh', 'wheel|輪子|🛞|wh', 'white|白色|⬜|wh',
      'duck|鴨子|🦆|ck', 'clock|時鐘|🕐|ck', 'sock|襪子|🧦|ck'
    ]
  },
  {
    id: 'magice', name: '魔法 e', en: 'Magic E', icon: '🪄', stage: 2,
    tip: '魔法 e（magic e）：字尾的 e 不發音，但會讓前面的母音唸它自己的「名字」。cap → cape、kit → kite、hop → hope。',
    raw: [
      'cake|蛋糕|🍰|a_e', 'game|遊戲|🎮|a_e', 'name|名字||a_e', 'lake|湖|🏞️|a_e', 'gate|大門|🚪|a_e',
      'bike|腳踏車|🚲|i_e', 'kite|風箏|🪁|i_e', 'five|五|5️⃣|i_e', 'ride|騎||i_e', 'nine|九|9️⃣|i_e',
      'home|家|🏠|o_e', 'bone|骨頭|🦴|o_e', 'nose|鼻子|👃|o_e', 'rope|繩子|🪢|o_e', 'rose|玫瑰|🌹|o_e',
      'cube|立方體|🧊|u_e', 'tube|管子||u_e', 'flute|長笛|🪈|u_e', 'huge|巨大的||u_e', 'these|這些||e_e'
    ]
  },
  {
    id: 'teams', name: '母音組合', en: 'Vowel Teams', icon: '🌧️', stage: 2,
    tip: '母音組合：兩個母音一起出現，通常第一個唸名字、第二個不發音。ai/ay 唸 /eɪ/、ee/ea 唸 /iː/、oa/ow 唸 /oʊ/、igh 唸 /aɪ/。',
    raw: [
      'mail|信件|✉️|ai', 'snail|蝸牛|🐌|ai', 'rain|雨|🌧️|ai', 'tail|尾巴||ai',
      'day|天||ay', 'play|玩|🤸|ay', 'tray|托盤||ay', 'gray|灰色|🩶|ay',
      'tree|樹|🌳|ee', 'sheep|綿羊|🐑|ee', 'queen|女王|👸|ee', 'jeep|吉普車|🚙|ee',
      'dream|夢|💭|ea', 'clean|乾淨的|🧼|ea', 'peach|桃子|🍑|ea', 'leaf|葉子|🍃|ea',
      'boat|船|⛵|oa', 'goat|山羊|🐐|oa', 'coat|外套|🧥|oa', 'road|道路|🛣️|oa',
      'snow|雪|❄️|ow', 'yellow|黃色|💛|ow', 'window|窗戶|🪟|ow', 'slow|慢的|🐢|ow',
      'night|夜晚|🌙|igh', 'light|燈|💡|igh', 'high|高的||igh', 'right|對的||igh'
    ]
  },
  {
    id: 'rctrl', name: 'r 控制母音', en: 'R-Controlled Vowels', icon: '🚗', stage: 2,
    tip: 'r 控制母音：母音後面接 r，聲音會改變。ar 像 car、or 像 corn；er、ir、ur 聽起來都一樣，像 bird、her、turn。',
    raw: [
      'car|車|🚗|ar', 'star|星星|⭐|ar', 'farm|農場|🚜|ar', 'shark|鯊魚|🦈|ar',
      'corn|玉米|🌽|or', 'fork|叉子|🍴|or', 'horse|馬|🐴|or', 'storm|暴風雨|⛈️|or',
      'her|她的||er', 'fern|蕨類|🌿|er', 'sister|姐妹|👧|er', 'butter|奶油|🧈|er',
      'bird|鳥|🐦|ir', 'girl|女孩|👧|ir', 'shirt|襯衫|👕|ir', 'dirt|泥土||ir',
      'turn|轉||ur', 'nurse|護理師|🧑‍⚕️|ur', 'purple|紫色|🟣|ur', 'burn|燒|🔥|ur'
    ]
  },
  {
    id: 'diph', name: '特殊母音', en: 'OO, OU, OI, AW', icon: '🏠', stage: 2,
    tip: '特殊母音：oo（moon 長音／book 短音）、ou 與 ow 唸 /aʊ/（house、cow）、oi 與 oy 唸 /ɔɪ/（coin、boy）、aw 唸 /ɔ/（saw）。',
    raw: [
      'moon|月亮|🌙|oo', 'food|食物|🍔|oo', 'cool|酷|😎|oo', 'book|書|📖|oo', 'foot|腳|🦶|oo', 'cook|煮|🍳|oo',
      'house|房子|🏠|ou', 'mouse|老鼠|🐭|ou', 'mouth|嘴巴|👄|ou', 'out|外面||ou',
      'cow|牛|🐮|ow', 'owl|貓頭鷹|🦉|ow', 'town|城鎮|🏘️|ow', 'brown|棕色|🟫|ow', 'down|向下|⬇️|ow',
      'coin|硬幣|🪙|oi', 'oil|油||oi', 'soil|泥土||oi',
      'boy|男孩|👦|oy', 'toy|玩具|🧸|oy', 'joy|喜悅|😄|oy',
      'paw|爪子|🐾|aw', 'draw|畫畫|🎨|aw', 'straw|吸管|🥤|aw'
    ]
  },
  {
    id: 'silent', name: '不發音字母', en: 'Silent Letters', icon: '🤫', stage: 3,
    tip: '有些字母「看得到、聽不到」：kn 的 k 不唸（knee）、wr 的 w 不唸（write）、mb 的 b 不唸（lamb）、gn 的 g 不唸（sign）。',
    raw: [
      'knee|膝蓋||kn', 'knife|刀子|🔪|kn', 'knock|敲門|🚪|kn', 'know|知道||kn', 'knot|結|🪢|kn',
      'write|寫|✍️|wr', 'wrong|錯的|❌|wr', 'wrap|包裹|🎁|wr', 'wrist|手腕||wr', 'wrinkle|皺紋||wr',
      'lamb|小羊|🐑|mb', 'comb|梳子|🪮|mb', 'climb|爬|🧗|mb', 'sign|標誌|🪧|gn'
    ]
  },
  {
    id: 'sight', name: '高頻字', en: 'Sight Words', icon: '👀', stage: 3,
    tip: '高頻字（sight words）：很常出現、但不太照規則拼的字，要靠「看到就認得」。多聽、多唸，也要會拼。',
    raw: [
      'said|說（過去式）|', 'were|是（複數過去式）|', 'because|因為|', 'friend|朋友|🧑‍🤝‍🧑', 'again|再一次|',
      'there|那裡|', 'their|他們的|', 'would|會、願意|', 'could|能夠|', 'should|應該|',
      'through|穿過|', 'enough|足夠的|', 'together|一起|', 'people|人們|👥', 'answer|答案|',
      'always|總是|', 'every|每一個|', 'thought|想（過去式）|💭', 'whole|整個的|', 'favorite|最愛的|❤️', 'different|不同的|'
    ]
  },
  {
    id: 'affix', name: '字首與字尾', en: 'Prefix & Suffix', icon: '🧱', stage: 3,
    tip: '字首字尾像積木：un-（不）、re-（再一次）、-ful（充滿）、-less（沒有）、-ing（正在）、-ed（過去）。看懂積木，就能猜出新單字的意思。',
    raw: [
      'unhappy|不開心的|😞|un-', 'unlock|解鎖|🔓|un-', 'undo|復原||un-', 'unfair|不公平的||un-',
      'replay|重播|🔁|re-', 'redo|重做||re-', 'retell|重述||re-', 'rewrite|改寫|✏️|re-',
      'helpful|有幫助的||-ful', 'careful|小心的||-ful', 'colorful|多彩的|🌈|-ful', 'wonderful|很棒的||-ful',
      'hopeless|絕望的||-less', 'careless|粗心的||-less', 'homeless|無家可歸的||-less',
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
