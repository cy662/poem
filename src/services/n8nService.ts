// n8n集成服务
// 用于处理诗词AI助手的API请求

interface AIAssistantRequest {
  question: string;
  context?: string;
  userId?: string;
}

interface AIAssistantResponse {
  answer: string;
  sources?: string[];
  confidence: number;
  timestamp: string;
}

// 模拟n8n API端点配置
const N8N_CONFIG = {
  baseUrl: import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678',
  webhookPath: import.meta.env.VITE_N8N_WEBHOOK_PATH || '/webhook/poem-ai-assistant',
  apiKey: import.meta.env.VITE_N8N_API_KEY || 'demo-key'
};

// 扩展诗词知识库
const POEM_KNOWLEDGE_BASE: Record<string, string> = {
  // 快速问题模板
  '推荐一首经典唐诗': '我推荐李白的《静夜思》：床前明月光，疑是地上霜。举头望明月，低头思故乡。这首诗语言简练，意境深远，表达了游子思乡之情。',
  '解释"床前明月光"的含义': '"床前明月光"出自李白的《静夜思》。这里的"床"可能指井栏或坐具，月光洒在床前，营造出宁静的夜晚氛围，为后面的思乡之情做铺垫。',
  '介绍李白的主要作品': '李白是唐代伟大的浪漫主义诗人，主要作品包括：《静夜思》、《将进酒》、《蜀道难》、《望庐山瀑布》、《早发白帝城》等，他的诗风豪放飘逸，想象丰富。',
  '什么是七言绝句？': '七言绝句是中国传统诗歌的一种形式，每首诗四句，每句七个字。要求押韵严格，通常第一、二、四句押韵。代表作品有王之涣的《登鹳雀楼》等。',
  '唐诗和宋词的区别': '唐诗和宋词是中国古典诗歌的两大高峰。唐诗注重格律和意境，形式严谨；宋词更注重音乐性和抒情性，句式灵活多变。',
  '推荐宋代词人': '我推荐苏轼、李清照、辛弃疾。苏轼豪放洒脱，李清照婉约细腻，辛弃疾气势磅礴，各有特色。',
  '解释"大江东去"': '"大江东去"出自苏轼的《念奴娇·赤壁怀古》，开篇气势恢宏，借长江东流抒发对历史变迁的感慨，展现豪放词风。',
  '什么是词牌名': '词牌名是词的格式名称，规定词的句式、平仄和韵律。常见词牌有《水调歌头》、《满江红》、《蝶恋花》等。',
  '推荐婉约派诗词': '婉约派以李清照为代表，推荐《声声慢·寻寻觅觅》，情感细腻，语言优美，充分展现婉约风格。',
  '解释"人生若只如初见"': '出自纳兰性德的《木兰花·拟古决绝词柬友》，表达对美好初见的怀念和对现实变迁的感慨，情感真挚动人。',

  // 诗人介绍
  '李白': '李白（701年－762年），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。其诗豪放飘逸，想象丰富，语言流转自然，音律和谐多变。',
  '杜甫': '杜甫（712年－770年），字子美，自号少陵野老，唐代伟大的现实主义诗人，被尊为"诗圣"。其诗沉郁顿挫，反映社会现实，具有深刻的历史意义。',
  '苏轼': '苏轼（1037年－1101年），字子瞻，号东坡居士，北宋文学家、书画家，豪放派词人代表。诗词文赋皆精，风格豪放洒脱。',
  '李清照': '李清照（1084年－1155年），号易安居士，宋代女词人，婉约派代表。其词语言清丽，感情真挚，前期多写悠闲生活，后期多悲叹身世。',
  '白居易': '白居易（772年－846年），字乐天，号香山居士，唐代现实主义诗人。其诗语言通俗，反映民生疾苦，代表作《琵琶行》、《长恨歌》。',
  '王维': '王维（701年－761年），字摩诘，号摩诘居士，唐代诗人、画家。其诗清新淡远，自然脱俗，具有浓厚的禅意，被誉为"诗佛"。',
  '辛弃疾': '辛弃疾（1140年－1207年），字幼安，号稼轩，南宋豪放派词人。其词气势雄浑，慷慨悲壮，充满爱国热情。',
  '陆游': '陆游（1125年－1210年），字务观，号放翁，南宋爱国诗人。其诗风格雄浑豪放，充满爱国情怀，代表作《示儿》、《钗头凤》。',

  // 诗词体裁
  '古诗': '古诗指唐代以前的诗歌形式，包括古体诗和乐府诗。形式相对自由，不严格讲究格律，注重意境和情感表达。',
  '近体诗': '近体诗指唐代形成的格律诗，包括绝句和律诗。讲究平仄、对仗、押韵，形式严谨，格律规范。',
  '词': '词是宋代盛行的诗歌形式，又称长短句。有固定的词牌名，讲究平仄和韵律，句式灵活，适合配乐歌唱。',
  '曲': '曲是元代兴起的诗歌形式，包括散曲和剧曲。语言更加通俗，可以加入衬字，表现力丰富。',
  '赋': '赋是汉代盛行的一种文体，介于诗歌和散文之间。讲究铺陈排比，辞藻华丽，描写细致。',

  // 诗词名句解释
  '举头望明月，低头思故乡': '出自李白《静夜思》。抬头仰望明月，低头思念故乡。通过简单的动作描写，深刻表达了游子思乡之情。',
  '春风又绿江南岸': '出自王安石《泊船瓜洲》。春风再次吹绿了江南岸，既写景又抒情，表达了对家乡的思念和对时光流逝的感慨。',
  '问君能有几多愁，恰似一江春水向东流': '出自李煜《虞美人》。用春水东流比喻愁绪的绵长无尽，形象生动地表达了亡国之痛。',
  '海内存知己，天涯若比邻': '出自王勃《送杜少府之任蜀州》。只要四海之内有知心朋友，即使远在天涯也如近邻一般。表达了对友谊的珍视和乐观豁达的人生态度。',
  '人生自古谁无死，留取丹心照汗青': '出自文天祥《过零丁洋》。自古以来人终有一死，但要留下一片赤诚之心照耀史册。表达了崇高的民族气节和爱国精神。',
  '采菊东篱下，悠然见南山': '出自陶渊明《饮酒》。在东篱下采摘菊花，悠闲地抬头看见南山。描绘了隐逸生活的闲适恬淡，体现了道家自然无为的思想。',
  '大漠孤烟直，长河落日圆': '出自王维《使至塞上》。大漠中一缕孤烟笔直上升，长河上一轮落日浑圆。通过简练的笔触勾勒出边塞壮阔苍凉的景色。',
  '朱门酒肉臭，路有冻死骨': '出自杜甫《自京赴奉先县咏怀五百字》。富贵人家酒肉多得发臭，路边却有冻饿而死的尸骨。深刻揭露了社会的不平等和贫富差距。',

  // 诗词创作技巧
  '比兴': '比兴是诗词创作的重要手法。"比"即比喻，"兴"即起兴。通过比喻和联想，使抽象的情感具体化，增强作品的艺术感染力。',
  '对仗': '对仗是近体诗的重要特征，要求上下句在词性、结构、意义上相互对应。好的对仗能使诗歌更加工整优美。',
  '押韵': '押韵指诗词中相应位置的音节韵母相同或相近。合理的押韵能增强诗歌的音乐美感和节奏感。',
  '意境': '意境是诗词追求的艺术境界，通过意象的组合营造出深远悠长的艺术空间，使读者产生丰富的联想和共鸣。',
  '意象': '意象是诗词中具体的物象描写，通过这些具体的形象来表达抽象的情感和思想。如"月亮"常象征思乡，"杨柳"常象征离别。',

  // 诗词流派
  '山水田园诗派': '以王维、孟浩然为代表，主要描写自然山水和田园生活，风格清新淡雅，意境幽远，体现道家自然无为的思想。',
  '边塞诗派': '以高适、岑参为代表，主要描写边塞风光和军旅生活，风格雄浑豪放，充满爱国热情和英雄气概。',
  '婉约派': '以李清照、柳永为代表，词风婉约细腻，多写个人情感和离愁别绪，语言优美，情感真挚。',
  '豪放派': '以苏轼、辛弃疾为代表，词风豪放洒脱，题材广泛，气势磅礴，充满浪漫主义色彩和爱国情怀。',
  '现实主义': '以杜甫、白居易为代表，关注社会现实，反映民生疾苦，具有深刻的社会意义和历史价值。',

  // 诗词鉴赏
  '如何欣赏诗词': '欣赏诗词可以从以下几个方面入手：1.理解字面意思 2.分析艺术手法 3.体会情感意境 4.了解创作背景 5.感受语言美感。',
  '诗词的韵律美': '诗词的韵律美体现在平仄交替、押韵和谐、节奏分明等方面。好的诗词读起来朗朗上口，富有音乐美感。',
  '诗词的情感表达': '诗词是情感的载体，通过具体的意象和优美的语言，表达作者丰富复杂的内心世界和人生感悟。',
  '诗词的社会价值': '诗词不仅具有审美价值，还反映了特定历史时期的社会风貌和人民的生活状况，具有重要的历史和文化价值。',

  // 诗词历史
  '诗经': '《诗经》是中国最早的诗歌总集，收录了西周初年至春秋中叶的诗歌305篇，分为风、雅、颂三部分。',
  '楚辞': '楚辞是战国时期楚国诗人屈原等人创作的诗歌，以《离骚》为代表，具有浓厚的地方特色和浪漫主义色彩。',
  '汉乐府': '汉乐府是汉代设立的官方音乐机构，其收集整理的民歌称为乐府诗，真实反映了当时的社会生活和人民情感。',
  '建安文学': '建安文学指汉末建安时期的文学创作，以曹操、曹丕、曹植父子为代表，风格慷慨悲凉，史称"建安风骨"。',
  '唐诗': '唐诗是中国古典诗歌的黄金时代，分为初唐、盛唐、中唐、晚唐四个时期，产生了李白、杜甫、王维等伟大诗人。',
  '宋词': '宋词是宋代文学的代表，分为婉约派和豪放派，题材广泛，形式多样，达到了词的艺术高峰。',
  '元曲': '元曲是元代文学的代表，包括散曲和杂剧，语言通俗生动，贴近人民生活，具有鲜明的时代特色。',

  // 扩展更多诗人
  '陶渊明': '陶渊明（约365-427），字元亮，号五柳先生，东晋诗人。开创田园诗派，代表作《桃花源记》、《归去来兮辞》。',
  '孟浩然': '孟浩然（689-740），唐代山水田园诗人，与王维并称"王孟"。代表作《春晓》、《过故人庄》。',
  '王昌龄': '王昌龄（698-757），唐代边塞诗人，被誉为"七绝圣手"。代表作《出塞》、《从军行》。',
  '岑参': '岑参（约715-770），唐代边塞诗人，与高适并称"高岑"。代表作《白雪歌送武判官归京》。',
  '高适': '高适（约704-765），唐代边塞诗人，诗风雄浑豪放。代表作《燕歌行》、《别董大》。',
  '柳永': '柳永（约984-1053），北宋词人，婉约派代表。精通音律，创作大量慢词。代表作《雨霖铃》、《望海潮》。',
  '晏殊': '晏殊（991-1055），北宋词人，婉约派代表。词风婉约含蓄，语言精炼。代表作《浣溪沙》、《蝶恋花》。',
  '欧阳修': '欧阳修（1007-1072），北宋文学家，唐宋八大家之一。词风清新自然。代表作《醉翁亭记》、《生查子》。',
  '王安石': '王安石（1021-1086），北宋政治家、文学家。诗风简练深刻。代表作《泊船瓜洲》、《元日》。',
  '秦观': '秦观（1049-1100），北宋词人，婉约派代表。词风婉约细腻。代表作《鹊桥仙》、《满庭芳》。',
  '周邦彦': '周邦彦（1056-1121），北宋词人，精通音律，格律严谨。代表作《兰陵王》、《苏幕遮》。',
  '姜夔': '姜夔（1154-1221），南宋词人，精通音乐，词风清空雅致。代表作《扬州慢》、《暗香》。',
  '文天祥': '文天祥（1236-1283），南宋爱国诗人。诗风慷慨悲壮。代表作《过零丁洋》、《正气歌》。',
  '纳兰性德': '纳兰性德（1655-1685），清代词人，词风婉约凄清。代表作《木兰花》、《长相思》。',

  // 扩展诗词作品
  '静夜思': '李白《静夜思》：床前明月光，疑是地上霜。举头望明月，低头思故乡。简洁明快，思乡情深。',
  '将进酒': '李白《将进酒》：君不见黄河之水天上来，奔流到海不复回。豪放洒脱，气势磅礴。',
  '春望': '杜甫《春望》：国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。忧国忧民，沉郁顿挫。',
  '登高': '杜甫《登高》：风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。七律典范。',
  '山居秋暝': '王维《山居秋暝》：空山新雨后，天气晚来秋。明月松间照，清泉石上流。山水田园，意境幽远。',
  '相思': '王维《相思》：红豆生南国，春来发几枝。愿君多采撷，此物最相思。语言简练，情感真挚。',
  '琵琶行': '白居易《琵琶行》：浔阳江头夜送客，枫叶荻花秋瑟瑟。叙事生动，情感深沉。',
  '长恨歌': '白居易《长恨歌》：汉皇重色思倾国，御宇多年求不得。叙事长诗，爱情悲剧。',
  '水调歌头': '苏轼《水调歌头·明月几时有》：明月几时有？把酒问青天。豪放洒脱，意境开阔。',
  '念奴娇': '苏轼《念奴娇·赤壁怀古》：大江东去，浪淘尽，千古风流人物。怀古抒情，气势恢宏。',
  '声声慢': '李清照《声声慢·寻寻觅觅》：寻寻觅觅，冷冷清清，凄凄惨惨戚戚。婉约细腻，情感深沉。',
  '如梦令': '李清照《如梦令》：常记溪亭日暮，沉醉不知归路。语言优美，意境清新。',
  '青玉案': '辛弃疾《青玉案·元夕》：东风夜放花千树，更吹落、星如雨。豪放悲壮，爱国热情。',
  '破阵子': '辛弃疾《破阵子·为陈同甫赋壮词以寄之》：醉里挑灯看剑，梦回吹角连营。慷慨激昂。',
  '钗头凤': '陆游《钗头凤》：红酥手，黄縢酒，满城春色宫墙柳。爱情词，情感真挚。',
  '示儿': '陆游《示儿》：死去元知万事空，但悲不见九州同。爱国诗，临终遗言。',

  // 扩展诗词技巧和理论
  '平仄': '平仄是诗词格律的基本要素。平声指阴平、阳平，仄声指上声、去声、入声。平仄交替形成节奏美。',
  '韵律': '韵律指诗词的音韵规律，包括押韵、平仄、节奏等。好的韵律能增强诗词的音乐美感。',
  '对偶': '对偶是修辞手法，要求上下句在字数、结构、意义上对称。如"两个黄鹂鸣翠柳，一行白鹭上青天"。',
  '排比': '排比是用三个或以上结构相似的短语或句子来表达相关的内容。能增强语言气势。',
  '夸张': '夸张是为了突出事物的特征而故意言过其实。如"飞流直下三千尺，疑是银河落九天"。',
  '拟人': '拟人是将事物人格化，赋予人的情感和行为。如"感时花溅泪，恨别鸟惊心"。',
  '象征': '象征是用具体事物代表抽象概念。如"月亮"象征思乡，"杨柳"象征离别。',
  '典故': '典故是引用历史故事或前人诗文。能增加作品的文化内涵，如"周公吐哺，天下归心"。',
  '诗眼': '诗眼是诗词中最精炼传神的字词。如"春风又绿江南岸"的"绿"字就是诗眼。',
  '词眼': '词眼是词中最关键的字词，往往能点明主题或升华意境。',

  // 扩展诗词流派和风格
  '初唐四杰': '初唐四杰指王勃、杨炯、卢照邻、骆宾王。他们的诗歌开始摆脱齐梁诗风，具有革新意义。',
  '大历十才子': '大历十才子是唐代宗大历时期的十位诗人，诗风清丽淡远，代表中唐诗风转变。',
  '花间派': '花间派是晚唐五代词派，以温庭筠、韦庄为代表，词风婉约艳丽，多写闺情离愁。',
  '江西诗派': '江西诗派是宋代诗歌流派，以黄庭坚为代表，讲究"点铁成金"，风格生新瘦硬。',
  '江湖诗派': '江湖诗派是南宋诗歌流派，多为布衣文人，诗风清新自然，反映社会现实。',
  '性灵派': '性灵派是清代诗歌流派，主张直抒胸臆，反对拟古。代表诗人有袁枚、赵翼等。',
  '格调派': '格调派是清代诗歌流派，强调诗歌的格律和声调，代表诗人有沈德潜等。',
  '神韵派': '神韵派是清代诗歌流派，追求含蓄蕴藉的意境，代表诗人有王士禛等。',

  // 扩展诗词鉴赏方法
  '知人论世': '知人论世是鉴赏诗词的重要方法，通过了解诗人的生平和时代背景来理解作品。',
  '以意逆志': '以意逆志是通过分析作品的语言和意象来推测作者的真实意图和情感。',
  '文本细读': '文本细读是仔细分析诗词的语言、结构、意象等要素，深入理解作品的艺术特色。',
  '比较研究': '比较研究是通过对比不同诗人、不同时期、不同流派的作品来发现共性和个性。',
  '文化解读': '文化解读是从历史文化角度分析诗词，理解作品的文化内涵和历史意义。',
  '美学分析': '美学分析是从审美角度欣赏诗词的形式美、意境美、语言美等艺术价值。',

  // 扩展诗词创作指导
  '立意': '立意是诗词创作的第一步，要确定主题和情感基调。好的立意是诗词成功的关键。',
  '选材': '选材要围绕主题选择恰当的意象和素材，做到情景交融，虚实相生。',
  '布局': '布局要合理安排诗词的结构，做到起承转合，层次分明。',
  '炼字': '炼字要精心选择最准确、最生动的词语，做到"语不惊人死不休"。',
  '修辞': '修辞要恰当运用比喻、拟人、夸张等手法，增强作品的艺术感染力。',
  '创新': '创新要在继承传统的基础上有所突破，形成独特的艺术风格。'
};

// 智能匹配问题并生成回答
const generateSmartResponse = (question: string): string => {
  // 精确匹配
  if (POEM_KNOWLEDGE_BASE[question]) {
    return POEM_KNOWLEDGE_BASE[question];
  }

  // 关键词匹配 - 扩展更多关键词
  const keywords: Record<string, string> = {
    // 诗人关键词
    '李白': POEM_KNOWLEDGE_BASE['李白'],
    '杜甫': POEM_KNOWLEDGE_BASE['杜甫'],
    '苏轼': POEM_KNOWLEDGE_BASE['苏轼'],
    '李清照': POEM_KNOWLEDGE_BASE['李清照'],
    '白居易': POEM_KNOWLEDGE_BASE['白居易'],
    '王维': POEM_KNOWLEDGE_BASE['王维'],
    '辛弃疾': POEM_KNOWLEDGE_BASE['辛弃疾'],
    '陆游': POEM_KNOWLEDGE_BASE['陆游'],
    '陶渊明': POEM_KNOWLEDGE_BASE['陶渊明'],
    '孟浩然': POEM_KNOWLEDGE_BASE['孟浩然'],
    '王昌龄': POEM_KNOWLEDGE_BASE['王昌龄'],
    '岑参': POEM_KNOWLEDGE_BASE['岑参'],
    '高适': POEM_KNOWLEDGE_BASE['高适'],
    '柳永': POEM_KNOWLEDGE_BASE['柳永'],
    '晏殊': POEM_KNOWLEDGE_BASE['晏殊'],
    '欧阳修': POEM_KNOWLEDGE_BASE['欧阳修'],
    '王安石': POEM_KNOWLEDGE_BASE['王安石'],
    '秦观': POEM_KNOWLEDGE_BASE['秦观'],
    '周邦彦': POEM_KNOWLEDGE_BASE['周邦彦'],
    '姜夔': POEM_KNOWLEDGE_BASE['姜夔'],
    '文天祥': POEM_KNOWLEDGE_BASE['文天祥'],
    '纳兰性德': POEM_KNOWLEDGE_BASE['纳兰性德'],

    // 诗词体裁
    '唐诗': POEM_KNOWLEDGE_BASE['唐诗'],
    '宋词': POEM_KNOWLEDGE_BASE['宋词'],
    '元曲': POEM_KNOWLEDGE_BASE['元曲'],
    '诗经': POEM_KNOWLEDGE_BASE['诗经'],
    '楚辞': POEM_KNOWLEDGE_BASE['楚辞'],
    '乐府': POEM_KNOWLEDGE_BASE['汉乐府'],
    '古诗': POEM_KNOWLEDGE_BASE['古诗'],
    '近体诗': POEM_KNOWLEDGE_BASE['近体诗'],
    '词': POEM_KNOWLEDGE_BASE['词'],
    '曲': POEM_KNOWLEDGE_BASE['曲'],
    '赋': POEM_KNOWLEDGE_BASE['赋'],

    // 诗词技巧
    '格律': POEM_KNOWLEDGE_BASE['格律'],
    '意境': POEM_KNOWLEDGE_BASE['意境'],
    '押韵': POEM_KNOWLEDGE_BASE['押韵'],
    '对仗': POEM_KNOWLEDGE_BASE['对仗'],
    '比兴': POEM_KNOWLEDGE_BASE['比兴'],
    '平仄': POEM_KNOWLEDGE_BASE['平仄'],
    '韵律': POEM_KNOWLEDGE_BASE['韵律'],
    '对偶': POEM_KNOWLEDGE_BASE['对偶'],
    '排比': POEM_KNOWLEDGE_BASE['排比'],
    '夸张': POEM_KNOWLEDGE_BASE['夸张'],
    '拟人': POEM_KNOWLEDGE_BASE['拟人'],
    '象征': POEM_KNOWLEDGE_BASE['象征'],
    '典故': POEM_KNOWLEDGE_BASE['典故'],
    '诗眼': POEM_KNOWLEDGE_BASE['诗眼'],
    '词眼': POEM_KNOWLEDGE_BASE['词眼'],

    // 诗词流派
    '婉约': POEM_KNOWLEDGE_BASE['婉约派'],
    '豪放': POEM_KNOWLEDGE_BASE['豪放派'],
    '山水': POEM_KNOWLEDGE_BASE['山水田园诗派'],
    '边塞': POEM_KNOWLEDGE_BASE['边塞诗派'],
    '现实主义': POEM_KNOWLEDGE_BASE['现实主义'],
    '浪漫主义': '浪漫主义强调主观情感和想象，追求个性解放和理想境界。李白是浪漫主义的杰出代表。',
    '建安': POEM_KNOWLEDGE_BASE['建安文学'],
    '初唐四杰': POEM_KNOWLEDGE_BASE['初唐四杰'],
    '大历十才子': POEM_KNOWLEDGE_BASE['大历十才子'],
    '花间派': POEM_KNOWLEDGE_BASE['花间派'],
    '江西诗派': POEM_KNOWLEDGE_BASE['江西诗派'],
    '江湖诗派': POEM_KNOWLEDGE_BASE['江湖诗派'],
    '性灵派': POEM_KNOWLEDGE_BASE['性灵派'],
    '格调派': POEM_KNOWLEDGE_BASE['格调派'],
    '神韵派': POEM_KNOWLEDGE_BASE['神韵派'],

    // 诗词作品
    '静夜思': POEM_KNOWLEDGE_BASE['静夜思'],
    '将进酒': POEM_KNOWLEDGE_BASE['将进酒'],
    '春望': POEM_KNOWLEDGE_BASE['春望'],
    '登高': POEM_KNOWLEDGE_BASE['登高'],
    '山居秋暝': POEM_KNOWLEDGE_BASE['山居秋暝'],
    '相思': POEM_KNOWLEDGE_BASE['相思'],
    '琵琶行': POEM_KNOWLEDGE_BASE['琵琶行'],
    '长恨歌': POEM_KNOWLEDGE_BASE['长恨歌'],
    '水调歌头': POEM_KNOWLEDGE_BASE['水调歌头'],
    '念奴娇': POEM_KNOWLEDGE_BASE['念奴娇'],
    '声声慢': POEM_KNOWLEDGE_BASE['声声慢'],
    '如梦令': POEM_KNOWLEDGE_BASE['如梦令'],
    '青玉案': POEM_KNOWLEDGE_BASE['青玉案'],
    '破阵子': POEM_KNOWLEDGE_BASE['破阵子'],
    '钗头凤': POEM_KNOWLEDGE_BASE['钗头凤'],
    '示儿': POEM_KNOWLEDGE_BASE['示儿'],

    // 学习方法
    '欣赏': POEM_KNOWLEDGE_BASE['如何欣赏诗词'],
    '鉴赏': POEM_KNOWLEDGE_BASE['如何欣赏诗词'],
    '创作': POEM_KNOWLEDGE_BASE['诗词创作技巧'],
    '历史': POEM_KNOWLEDGE_BASE['诗词历史'],
    '价值': POEM_KNOWLEDGE_BASE['诗词的社会价值'],
    '知人论世': POEM_KNOWLEDGE_BASE['知人论世'],
    '以意逆志': POEM_KNOWLEDGE_BASE['以意逆志'],
    '文本细读': POEM_KNOWLEDGE_BASE['文本细读'],
    '比较研究': POEM_KNOWLEDGE_BASE['比较研究'],
    '文化解读': POEM_KNOWLEDGE_BASE['文化解读'],
    '美学分析': POEM_KNOWLEDGE_BASE['美学分析'],
    '立意': POEM_KNOWLEDGE_BASE['立意'],
    '选材': POEM_KNOWLEDGE_BASE['选材'],
    '布局': POEM_KNOWLEDGE_BASE['布局'],
    '炼字': POEM_KNOWLEDGE_BASE['炼字'],
    '修辞': POEM_KNOWLEDGE_BASE['修辞'],
    '创新': POEM_KNOWLEDGE_BASE['创新']
  };

  // 查找关键词
  for (const [keyword, answer] of Object.entries(keywords)) {
    if (question.includes(keyword)) {
      return answer;
    }
  }

  // 智能意图识别和回答
  if (question.includes('推荐') || question.includes('介绍') || question.includes('什么')) {
    return handleRecommendationQuestion(question);
  } else if (question.includes('解释') || question.includes('含义') || question.includes('意思')) {
    return handleExplanationQuestion(question);
  } else if (question.includes('区别') || question.includes('不同') || question.includes('对比')) {
    return handleComparisonQuestion(question);
  } else if (question.includes('如何') || question.includes('怎样') || question.includes('方法')) {
    return handleMethodQuestion(question);
  }

  // 默认回答 - 更详细的指导
  return `关于"${question}"，这是一个很有深度的诗词问题！中国诗词文化源远流长，涉及到丰富的文学知识和历史背景。

根据您的问题，我建议您：

📚 **查阅经典文献**
- 《唐诗三百首》、《宋词三百首》等经典选集
- 相关诗人的传记和研究著作
- 诗词鉴赏辞典和文学史

🎯 **深入理解方向**
1. 了解诗人的生平和创作背景
2. 分析诗词的艺术手法和语言特色  
3. 体会作品的情感内涵和思想境界
4. 探究诗词的历史意义和文化价值

💡 **具体建议**
如果您能提供更具体的关键词或诗人名字，我可以给出更精准的回答。比如：
- "李白的诗歌特点"
- "唐诗的格律要求" 
- "宋词婉约派的代表作品"

期待与您继续探讨诗词的奥秘！`;
};

// 处理推荐类问题
const handleRecommendationQuestion = (question: string): string => {
  if (question.includes('唐诗') || question.includes('唐代')) {
    return '我推荐以下几首经典唐诗：\n\n1. 李白《静夜思》 - 简洁明快，思乡情深\n2. 杜甫《春望》 - 忧国忧民，沉郁顿挫\n3. 王维《山居秋暝》 - 山水田园，意境幽远\n4. 白居易《琵琶行》 - 叙事生动，情感真挚\n\n您对哪首更感兴趣？我可以详细解读。';
  } else if (question.includes('宋词') || question.includes('宋代')) {
    return '我推荐以下几首经典宋词：\n\n1. 苏轼《水调歌头》 - 豪放洒脱，意境开阔\n2. 李清照《声声慢》 - 婉约细腻，情感深沉\n3. 辛弃疾《青玉案》 - 慷慨悲壮，爱国热情\n4. 柳永《雨霖铃》 - 离愁别绪，缠绵悱恻';
  } else if (question.includes('诗人') || question.includes('词人')) {
    return '根据您的兴趣，我推荐：\n\n🏔️ **豪放派**：李白、苏轼、辛弃疾\n🌸 **婉约派**：李清照、柳永、晏几道\n🌾 **现实主义**：杜甫、白居易、陆游\n🌿 **山水田园**：王维、孟浩然、陶渊明\n\n您想了解哪位诗人的具体作品？';
  }
  return POEM_KNOWLEDGE_BASE['如何欣赏诗词'];
};

// 处理解释类问题
const handleExplanationQuestion = (question: string): string => {
  // 这里可以添加更复杂的解释逻辑
  return `关于您提到的诗词内容，这涉及到诗词的深层解读。建议您：\n\n1. 提供具体的诗句或关键词\n2. 说明您想了解的具体方面（如背景、手法、情感等）\n3. 我会结合相关知识为您详细解答。\n\n比如："请解释'床前明月光'的创作背景和艺术特色"`;
};

// 处理比较类问题
const handleComparisonQuestion = (question: string): string => {
  if (question.includes('唐诗') && question.includes('宋词')) {
    return POEM_KNOWLEDGE_BASE['唐诗和宋词的区别'];
  } else if (question.includes('婉约') && question.includes('豪放')) {
    return '婉约派和豪放派是宋词的两大流派：\n\n🌸 **婉约派**：情感细腻，语言优美，多写个人情感\n🏔️ **豪放派**：气势磅礴，题材广泛，充满浪漫色彩\n\n两者各有特色，共同构成了宋词的丰富面貌。';
  }
  return '比较分析是理解诗词的重要方法。请提供具体的比较对象，我会为您详细分析它们的异同点。';
};

// 处理方法类问题
const handleMethodQuestion = (question: string): string => {
  if (question.includes('欣赏') || question.includes('鉴赏')) {
    return POEM_KNOWLEDGE_BASE['如何欣赏诗词'];
  } else if (question.includes('创作') || question.includes('写作')) {
    return POEM_KNOWLEDGE_BASE['诗词创作技巧'];
  }
  return '关于诗词的学习方法，我建议从基础入手，循序渐进：\n\n1. 多读经典作品，培养语感\n2. 学习诗词格律和创作技巧\n3. 了解历史文化背景\n4. 勤于练习和思考';
};

// 真实的n8n API调用
export const callN8NAssistant = async (request: AIAssistantRequest): Promise<AIAssistantResponse> => {
  // 检查n8n配置是否可用（只有当配置了真实URL时才调用n8n）
  const isN8NConfigured = N8N_CONFIG.baseUrl &&
    N8N_CONFIG.baseUrl !== 'http://localhost:5678' &&
    N8N_CONFIG.apiKey !== 'demo-key';

  if (!isN8NConfigured) {
    // 使用本地知识库作为降级方案
    console.log('n8n服务未配置，使用本地知识库');
    return callLocalAssistant(request);
  }

  try {
    console.log('调用n8n API:', `${N8N_CONFIG.baseUrl}${N8N_CONFIG.webhookPath}`);

    const response = await fetch(`${N8N_CONFIG.baseUrl}${N8N_CONFIG.webhookPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${N8N_CONFIG.apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`n8n API错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('n8n API响应:', data);

    return {
      answer: data.data?.answer || data.answer || '收到回复但内容为空',
      sources: data.data?.sources || data.sources || ['n8n工作流'],
      confidence: data.data?.confidence || data.confidence || 0.8,
      timestamp: data.data?.timestamp || data.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('n8n API调用失败:', error);

    // 降级到本地知识库
    console.log('n8n调用失败，切换到本地知识库');
    return callLocalAssistant(request);
  }
};

// 本地知识库调用（降级方案）
const callLocalAssistant = async (request: AIAssistantRequest): Promise<AIAssistantResponse> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  try {
    const answer = generateSmartResponse(request.question);

    return {
      answer,
      sources: ['本地诗词知识库', '文学典籍', '历史文献'],
      confidence: 0.75,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('本地知识库处理失败:', error);

    return {
      answer: `抱歉，暂时无法处理您的请求。${request.question} 是一个很好的诗词问题，建议您：\n\n1. 查阅《唐诗三百首》、《宋词三百首》等经典选集\n2. 了解相关诗人的生平和创作背景\n3. 关注诗词的格律和艺术特色\n\n或者稍后再试。`,
      confidence: 0.3,
      timestamp: new Date().toISOString()
    };
  }
};

// 获取快速问题建议
export const getQuickQuestions = (): string[] => {
  return [
    '推荐一首经典唐诗',
    '解释"床前明月光"的含义',
    '介绍李白的主要作品',
    '什么是七言绝句？',
    '唐诗和宋词的区别',
    '推荐宋代词人',
    '解释"大江东去"',
    '什么是词牌名',
    '如何欣赏诗词',
    '诗词创作技巧',
    '婉约派的特点',
    '豪放派的代表作品',
    '王维的山水诗特点',
    '李清照的婉约风格',
    '苏轼的豪放词风',
    '杜甫的现实主义',
    '陶渊明的田园诗',
    '辛弃疾的爱国词',
    '诗词格律基础知识',
    '如何创作一首诗',
    '诗词鉴赏方法',
    '古代诗人排名',
    '经典诗词名句',
    '诗词中的意象运用',
    '不同朝代的诗风'
  ];
};

// 验证n8n连接状态
export const checkN8NConnection = async (): Promise<boolean> => {
  try {
    // 在实际应用中检查n8n服务状态
    // const response = await fetch(`${N8N_CONFIG.baseUrl}/health`);
    // return response.ok;

    // 模拟连接检查
    return true;
  } catch (error) {
    console.error('n8n连接检查失败:', error);
    return false;
  }
};

export default {
  callN8NAssistant,
  getQuickQuestions,
  checkN8NConnection
};