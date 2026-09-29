export type GoogleSopsBlock =
  | { type: 'paragraph'; text: string; style: string; list: boolean }
  | { type: 'image'; src: string; alt: string }

export type GoogleSopsSection = {
  id: string
  title: string
  parentId: string | null
  level: number
  index: number
  iconEmoji: string | null
  blocks: GoogleSopsBlock[]
}

export const GOOGLE_SOPS = {
  "documentId": "1rswadBoCPbwO-_lHAS7Rc7SId_4QLRaVQMqI9yDip-A",
  "title": "LADP System|   SOPs Police",
  "revisionId": "ANLCKQnve3omkafONslTTD3QngtX2pzl7rD60xqzn7Z457jTS5z9pfqpvbNwssg5xr_k8kUGxzQ0-LRF2ZR55LeqkEEcPLghj994bh97tQ",
  "sourceUrl": "https://docs.google.com/document/d/1rswadBoCPbwO-_lHAS7Rc7SId_4QLRaVQMqI9yDip-A/edit?tab=t.0",
  "importedAt": "2026-09-29T16:41:52.654Z",
  "sections": [
    {
      "id": "t.0",
      "title": "Police Rules",
      "parentId": null,
      "level": 0,
      "index": 0,
      "iconEmoji": "👮",
      "blocks": [
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXfeBrm-QOSm6o_u7iZWPO4-W7N2xCZ6fvlhMai21YuIhQknur4AuE5OAh4zEaQp0rdsqbLBflz2OfaMYvElQf1lqClmWWnCTnUUhtyoYGqXYBbFddoXWBwDIUJ5urEkN4qqQl2lNHeixkipK2LMHm1GPgxSeDU69ntrxtQU1vEz2cx9Gng=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "paragraph",
          "text": "{ Los Santos Police Department }\nStandard Operating Procedures",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "SOPs\nBy : Ofc. - Jonathan L.Kennedy",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.7eqi867rbzdf",
      "title": "1. قواعد وسلوكيات التعامل",
      "parentId": "t.0",
      "level": 1,
      "index": 0,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "[ قواعد الشرطة Police Department Rules ]\n\nشرطة الولاية :\n\n تهدف لحماية النظام الأمن القومي و النظام العام وممتلكات الولاية، و حماية المواطنين هي أولى اهتماماتها\n\nوعلى الشرطي تنبؤ التعامل مع الحالات بالشكل الذي يناسب هيئته كشرطي و تبعاً لكتيب بروتوكولات الشرطة.",
          "style": "HEADING_1",
          "list": false
        }
      ]
    },
    {
      "id": "t.trw0n7bxk1ki",
      "title": "1.1 قواعد و سلوكيات التعامل مع المواطنين",
      "parentId": "t.7eqi867rbzdf",
      "level": 2,
      "index": 0,
      "iconEmoji": "🔸",
      "blocks": [
        {
          "type": "paragraph",
          "text": "1.1 قواعد و سلوكيات التعامل مع المواطنين :",
          "style": "HEADING_2",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "1 - التعامل مع المواطنين يكون بحدود العمل فقط، و يكون بشكل إحترافي و رسمي دون التطرق إلى الأشياء الشخصية إذا لم يكن لها سبب كافي",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2 - يحق للشرطي أخذ أي إجراء تجاه المواطن بعد وجود أدلة و أسباب كافية لفعل ذلك",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "وتكون من ضمن الإجراءات ( التفتيش - إلقاء القبض - الحجز ..إلخ ) وهذا يعني انه لايحق الكلبشه في حاله الإستيقاف المروري, ( الا في حال تحول الاستيقاف من مروري الى جنائي ويكون بالحالات التالية )\nأ:- في حال كان المواطن لابس قناع او تظليل المركبة\nب:- في حال قام المواطن بحركات غير طبيعية كتحت تأثير المخدرات او الكحول (DUI)\nج:- في حال قام المواطن  تهديد العسكري او المواطنين للخطر او على حياته",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "3 - طريقة التعامل مع بلاغات المواطنين من القسم تكون بعد اخذ الهوية من المواطن ومن ثم استلام البلاغ  داخل مكاتب قسم مشن روو و تدوينها كـ Report فالـ MDT",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "4 - طريقة التعامل مع بلاغات المواطنين خارج قسم الشرطة، تكون بعد التأكد من نوع حالة البلاغ، إذا لم يكن طارئ يتم إرسال المواطن لاستقبال مركز PD- و في حال كان البلاغ طارئ يتم أخذه مباشرةً و التعامل بشكل مباشره مع  البلاغ ,  وإبلاغ الدسباتش بالحالة.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "5 - عند التعامل مع مجرم. يتم إلقاء حقوق المواطن عليه، ويكفي الشرطي أن يقول أعلى تهمة ضد المواطن مثل (سرقة سيارة) ، بعد ذلك يتم اتخاذ إجراءات السلامة ، حتى لو احتاج إلى رعاية طبية قبل دخوله إلى مركز الشرطة ، وبعد ذلك عند دخوله إلى المركز يتم تصويره وأخذ بصماته ، ثم تعاد الأصفاد وبعد ذلك يدخل إلى الزنزانات يتم تفتيش الشخص بشكل كامل وتسحب منه جميع الأدوات الممنوعة ثم يتم التعامل معه.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "6- عند الإستيقاف المروري للمواطن يجب أن يكون الموقع آمن و تتأكد من أمانك قبل نزولك من المركبة، و من ثم إبلاغ الدسباتش و فحص المواطن و مركبته ( لا يقصد بها تفتيش المواطن ) و بعد ذلك تعرف عن نفسك\n\n7 - قبل التعامل مع أي موقف أو الإشتباك مع المواطن يجب عليك ذكر أنك شرطي مثل\n( معاك الشرطة، سلم نفسك! )",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "8- عند وجود حالة خطف لرهينة يجب على جميع العناصر المتواجدين في الحالة محاصرة الموقع وطلب سوبرفايزر لإستلام القيادة الميدانية للحالة وتعيين مفاوض الشرطة والتأكد من صحة الرهينة قبل استكمال التفاوض وأخذ مطالب المجرمين. وبعد ذلك طلب وحدة اسعافية في حال حدث أي شي خارج الحسبان وإبعاد الوحدة عن الموقع لحين يتم احتياجها.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "9 - في حال حدوث عملية اختطاف أمام الشرطي يتم تبليغ مركز العمليات بالحالة وطلب وحدة دعم ومتابعة الأشخاص مع مراعاة الحفاظ على حياة الرهينة وعدم اعتراض الأشخاص بأي شكل من الأشكال يحق للشرطي\nالطلب من الأشخاص تحديد موقع للتفاوض وفي حال عدم تجاوب الأشخاص مع أفراد الشرطة لمدة أقصاها 10 دقائق يتم إيقاف الأشخاص بالقوة الجبرية بالتنسيق مع مركز العمليات.",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.1hyieceg4d7o",
      "title": "2.1 قواعد و سلوكيات التعامل مع أفراد الشرطة",
      "parentId": "t.7eqi867rbzdf",
      "level": 2,
      "index": 1,
      "iconEmoji": "🔸",
      "blocks": [
        {
          "type": "paragraph",
          "text": "2.1 قواعد و سلوكيات التعامل مع أفراد الشرطة :",
          "style": "HEADING_2",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "1 - الإحترام بين أفراد الشرطة واجب مهما كانت الرتبة، و التحية لرتبة سارجنت وأعلى تكون بموجب إبداء الإحترام",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2 - يمنع منعاً باتاًّ الإعتداء على عناصر الشرطة مهما كانت الرتبة و الأسباب، وأيضاً يمنع إستخدام الأسلحة الموجعة أو النارية أو الكهربائية تجاه أي عنصر من عناصر الشرطة بأي شكل من الأشكال",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "3 - يحق لمن هم برتبة Sergeant وفوق إقامة نقاط تفتيش بعد أخذ الإذن من الـ Supervisor.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "4 - يعتبر الـ Dispatch، عنصر مستقبل و موصل للمعلومات و هو وسيلة تواصل بين أفراد الشرطة بالميدان و لا يسمح للأفراد بتجاوزه إلا للضرورة أو أن تكون مشرف (Supervisor) على الميدان",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "5 - الـ Supervisor هو أعلى رتبة بالميدان و تبدأ رتبة الـ Supervisor من  Senior Officer .. و يهدف إلى تنظيم و مراقبة الحالات والوحدات بالميدان بهدف اتزان الوحدات وكذلك مراقبة Dispatch ويحق له منع قرارات  Dispatch وهدفه تقليل نسبة الخطأ.",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.whsdzxj809df",
      "title": "أنواع الإستيقاف 3.1",
      "parentId": "t.7eqi867rbzdf",
      "level": 2,
      "index": 2,
      "iconEmoji": "🔸",
      "blocks": [
        {
          "type": "paragraph",
          "text": "3.1 أنواع الاستيقاف :",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "1- الاستيقاف المروري : يكون الاستيقاف المروري عند المخالفات المرورية فقط, مثل قطع الاشارة والقيادة المتهورة وغيرها من المخالفات المرورية. لا يحق للعسكري كلبشتك وسجنك عند استيقافك مروريًا. يحق لـه تحويل الاستيقاف الى اشتباه عـنـدما يتضح أن المواطن لابس القناع. ويحق له تفتيشه واتخاذ الإجراءات المناسبة.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2- استيقاف الاشتباه : يكون استيقاف الاشتباه عندما يشتبه فرد الشرطة بالمواطن في الحالات الأتية : عند تظليل المركبة تظليل كامل يمنع رؤية أي شخص داخل المركبة. عند رؤية أحد المواطنين لابس ما يعيق رؤية وجهه والتعرف عليه. عندما يكون المواطن بقرب المناطق الجنائية. الإجراء المتخذ : يتم استيقافه وطلب المواطن رفع يديه ليتم تفتيشه وتفتيش مركبته, يتخذ فرد الشرطة الإجراء بعد التفتيش سواءً السجن أو انصراف المواطن.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "3- الاستيقاف الجنائي : يكون الاستيقاف الجنائي بعد ارتكاب المواطن لإحدى الجرائم الجنائية مثل السرقة أو القتل والخطف أو أن يكون عليه تعميم جنائي من قبل الـ Dispatch. الإجراء المتخذ : يستوقفون أفراد الشرطة مركبة المجرم من جميع الاتجاهات بحيث لا يستطيع الفرار. ويتم إلقاء القبض عليه فورًا.",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.cm53w06z1inp",
      "title": "4.1 قواعد و سلوكيات التعامل مع أفراد الطاقم الطبي",
      "parentId": "t.7eqi867rbzdf",
      "level": 2,
      "index": 3,
      "iconEmoji": "🔸",
      "blocks": [
        {
          "type": "paragraph",
          "text": "3.1 قواعد و سلوكيات التعامل مع أفراد الطاقم الطبي :\n\n1 - يكون التعامل بين عناصر الشرطة و أفراد الطاقم الطبي تعامل إحترافي بحدود المهنة، و يجب على الشرطي الإمتثال لأاومر الطاقم الطبي في الحالات التي تستدعي إلى تدخلهم",
          "style": "HEADING_2",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2- يسمح بدخول مسؤول الحالة او مسؤول الفترة بالتوجه الى موجة الاسعاف الأساسية وطلب اسعاف",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "3 - عند إحتياج الطاقم الطبي إلى الشرطة، يقوم الـ Dispatch بإرسال البلاغ لاقرب وحدة من الموقع و تقوم الوحدة بتأمين الموقع و المحافظة على النظام.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "4 - يجب على الشرطي الإمتثال لجميع أوامر وقواعد أفراد الطاقم الطبي داخل المستشفى وإحترامها",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "5 - في حال وجود طاقم إسعاف على رأس العمل، يتم جلبهم عن طريق 911 emc/ لمساعدة الأشخاص المسقطين، و لا يحق للشرطي نقل الحالات بنفسه إلى المستشفى",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.34sbgubmar4",
      "title": "5.1 قواعد و سلوكيات التعامل مع حالات المطاردة",
      "parentId": "t.7eqi867rbzdf",
      "level": 2,
      "index": 4,
      "iconEmoji": "🔸",
      "blocks": [
        {
          "type": "paragraph",
          "text": "4.1 قواعد و سلوكيات التعامل مع حالات المطاردة :\n\n1 - إستجابة أي حالة مطاردة تكون كحد أقصى 3 دوريات في المطادرة، و يمكن إضافة دورية رابعة إن لزم\nالأمر ويحق للـ Supervisor التدخل بزيادة العدد إن لزم الأمر مع تحمل كامل المسؤولية.\n\n2 - يحق للشرطي صدم المركبة فقط في ثلاث حالات :\n       أ-  أن تصطدم مركبة المواطن بشكل متكرر بالممتلكات العامة و مركبات المواطنين مما يشكل خطر\n    ب- في حال حاول أشخاص من خارج المطاردة بتعطيل مركبة الشرطة او تهريب المواطن الهارب\n   ج- عند الصدم يفضل ان تكون السرعة اقل من 150km/H وخلو الشارع من المركبات والمواطنين لتقليل الأضرار\n\n3- يحق للشرطة إطلاق النار على مركبة المواطن فقط في الحالات الاتية\nأ- إذا قام المواطن بإطلاق النار على مركبات الشرطة أو المواطنين\nب- إذا حاول الشخص أو قام بدهس أحد عناصر الشرطة وتسبب بضرر لعناصر الشرطة\nج- في حال يوجد تدخل خارجي في المطاردة ولا تستطيع إرسال وحدات للمطاردة تقوم بإطلاق النار 3 طلقات على كفر واحد على مركبة التدخل الخارجي\nد - في حال فشل الخروج الآمن في المطاردة تقوم بإطلاق النار 3 طلقات على كفر واحد وتكون بعد كل صدمة احترافية بـ 30 ثانية ويجب أخذ الاذن من الدسباتش أولاً",
          "style": "HEADING_2",
          "list": false
        }
      ]
    },
    {
      "id": "t.n6qa1sqfulgp",
      "title": "6.1 قواعد و سلوكيات التعامل في حالات الإجرام",
      "parentId": "t.7eqi867rbzdf",
      "level": 2,
      "index": 5,
      "iconEmoji": "🔸",
      "blocks": [
        {
          "type": "paragraph",
          "text": "5.1 قواعد و سلوكيات التعامل في حالات الإجرام :\n[ في أي حالة سرقة يجب أخذ الحيطة والحذر والتعامل بكل حذر مع السارقين لخطورتهم، و اخذ افضل المواقع الإستراتيجية من ناحية الرؤية و التغطية و محاصرة الموقع بشكل كامل ]\n\n1 - سرقة بقالة : عدد العناصر المتوجهة كحد أقصى 4 (2 كعدد لدوريات) مع إمكانية طلب موتر سايكل\n\n2 - سرقة المنزل - ContaIner  : عدد العناصر المتوجهة كحد أقصى 5 (3 كعدد لدوريات) مع إمكانية طلب موتر سايكل + وحدة ايرشب كذالك وحدة رابعة إن لزم الأمر\n\n3- Cash Exchange Robbery - Fleeca Robbery: عدد العناصر المتوجهة كحد اقصى 7 (4 دوريات) مع إمكانية طلب موتر سايكل + وحدة ايرشب كذالك وحدة خامسة إن لزم الأمر",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "5- Laundromat Robbery : عدد العناصر المتوجهة 6 (5 دوريات) مع إمكانية طلب موتر سايكل + وحدة ايرشب او يدبل العدد إن كان يوجد مركبتين في الموقع\n\n6 -  Art Artylusem Robbery - Bobcat Robbery : عدد العناصر المتوجهة 8 (5 دوريات) مع إمكانية طلب موتر سايكل + وحدة ايرشب او يدبل العدد إن كان يوجد مركبتين في الموقع",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "7 - Paleto bay Banks Robbery : عدد العناصر المتوجهة 10 (6 دوريات) مع إمكانية طلب وحدتين موتر سايكل و 2 ارشيب إن لزم او يدبل العدد إن كان يوجد مركبتين في الموقع",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "8 - Maze Bank : عدد العناصر 11 ( 7 دوريات) مع إمكانية طلب وحدتين موتر سايكل و 2 ارشيب إن لزم او يدبل العدد ان كان يوجد مركبتين في الموقع",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "9 - Casino Robbery : عدد العناصر 14 (  7 دوريات) مع إمكانية طلب وحدتين موتر سايكل و 2 ارشيب إن لزم او يدبل العدد ان كان يوجد مركبتين في الموقع\n\nملاحظة : في حال كانت الرهينة عسكري يسمح زيادة عدد الوحدات الى وحدتين اضافية و يضاف طلب من المتفاوض من جهة المجرمين",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.17v181d5wmf4",
      "title": "7.1 قواعد وسلوكيات عامّة",
      "parentId": "t.7eqi867rbzdf",
      "level": 2,
      "index": 6,
      "iconEmoji": "🔸",
      "blocks": [
        {
          "type": "paragraph",
          "text": "6.1 قواعد وسلوكيات عامّة :",
          "style": "HEADING_2",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "1- عند بداية دوامك يجب ان تتأكد من معداتك بشكل كامل و تفحص جاهزية مركبتك",
          "style": "HEADING_2",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2 - قبل نزولك للميدان تأكد من جميع الـ Warrants لتذكرهم أثناء دوامك عند تعاملك مع أي مواطن\n\n3 - ترك الحالات الأقل اهمية إذا تم نداءك لحالة أكثر أهمية",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "4 - عدم التعرض بسرقة او إستعارة مركبات المواطنين لأي سبب كان",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "5 - تبليغ الدسباتش عند مباشرة اي حالة او عند التعامل مع أي حالة\n\n6 - عند مباشرتك لحالة يجب عليك جمع الأدلة و توثيقها ومسح المتبقي منها،\n\n7 - الـ Reports، هي تقارير لحوادث قد حصلت و لكن نجهل من هو فاعلها، و يتم جمع الأدلةللتحقيق فيها",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "8 - الـ Incidents، هي تقارير لحوادث قد حدثت و تم إلقاء القبض على فاعلها",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "9 - الـ BOLOs، هي تقارير تختص بالمركبات ( المسروقة/المطلوبة )\n\n10 - يجب عليك كتابة التقارير بعد كل حالة وفي حال تجاهل ذلك يتم المحاسبة بأشد العقوبات",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "11 - يمنع منعاً باتاًّ تخفيف العقوبة على المواطن أكثر من 25% من المخالفات و مدة السجن",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "12 - يجب الإلتزام بمعداتك و مركباتك المخصصة برتبتك",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "13 - يحق للشرطي طلب إجازة مدة أقصاها أسبوع ، و زيادة عن ذلك قد ينتقل الموضوع لإدارة الشؤون الداخلية\n\n14 - إذا لم يكن عنصر الشرطة فعّال لمدة شهر متواصل دون عذر، يحق لإدارة الشؤون أخذ الإجراءات تجاهه و قد تؤدي إلى الإخطار أو الفصل النهائي من قسم الشرطة.",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.ur6ruyqpjx9l",
      "title": "2. حــقــوق الــمــواطــن",
      "parentId": "t.0",
      "level": 1,
      "index": 1,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "[ حــقــوق الــمــواطــن]\n\nوهي من اهم الاشياء بالشرطة وتحريفها او الإخلال بها أو عدم قولها بشكل جدي قد يعرضك لمحاسبة شديدة",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "الحقوق اللفظية التي تنطق للمواطن",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "يحق للمواطن التزام الصمت",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "كذلك توكيل محامي ان وجد",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "والحقوق التي تلتزم فيها كعسكري لكن ما تذكرها للمواطن وهي",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "عدم إهانته أو استفزازه بأي شكل من الأشكال",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "يمنع التصيد على المواطن من غير سبب واضح\n\n شرح كتابي لطريقة نطق الحقوق:-",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "تم القبض عليك من شرطة لوس سانتوس / الشيريف بتهمة سرقة منزل\n { تكتفي بقول اعلى تهمة للمواطن }\nيحق لك التزام الصمت اي شي بتقوله بيستخدم ضدك في المحكمة كذلك\nيحق لك توكيل محامي وفي حال ماعندك المقدرة على توكيل محامي بتوفرلك الولاية محامي ان وجد",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.nrty097lzqr8",
      "title": "3. الــصــدم الاحــتــرافــي",
      "parentId": "t.0",
      "level": 1,
      "index": 2,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "الصدم الاحترافي\n\n يحقلك صدم الشخص بعد مرور 3 دقائق من المطاردة بعد اخذ اذن من مسؤول الحالة\n { قانون ال 3 دقائق لا يشمل من لديه هروب امن }\n\nيحقلك صدم الشخص بشكل فوري في حال قام\n\n أ- بصدم مركبات الشرطة بشكل عمد\n\n ب:- في حال مضايقتك من قبل التدخل الخارجي كذلك تقديم اهانات لشرطة\n\n تنبيه!! بين كل صدمة وصدمة 30 ثانية\n\nيمنع الصدم الاحترافي في مكانين فقط وهم :-\n\n 1- الصدم بالجبال\n2- الصدم بالمحطات",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.p99jsx97g6wu",
      "title": "4. استخدام السلاح",
      "parentId": "t.0",
      "level": 1,
      "index": 3,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "شــروط اســتــخــدام الــســلاح :\n\n1- اخذ اذن من الدسباش",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2- دهس الشرطي",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "3- تهديد الشرطي",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "4- إشهار السلاح على الشرطي\n\n- طــلــق الــنــار عــلــى مــجــرم :",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "في حال أخرج الشخص سلاحه الناري بموقع اطلاق نار",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "في حال مشاهده شخص يحمل سلاح ناري تقوم بتنبيه الشخص بإدخال",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "السلاح وبعد 5 ثواني من عدم الاستجابه يتم اطلاق النار على اطرافه",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "في حال الشخص دخل سلاحه بعد التنبيه واخرجه مره اخرى اسقاط مباشر",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "- طــلــق الــنــار عــلــى مــركــبــة مــجــرم",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "في حال قام الشخص بدهس أحد عناصر الشرطة",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "في حال قام الشخص بإطلاق النار على الشرطة { يحقلك كذلك اطلاق النار عليه }",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "في حال كان يوجد تدخل خارجي يحقلك إطلاق النار ثلاث طلقات على كفر واحد فقط على مركبة التدخل الخارجي",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "في حال فشل الخروج الأمن في المطاردة وتكون بعد الصدمة الاحترافية الأولى بـ 30 ثانية على الكفر بـثلاث طلقات فقط ومن بعدها تكون بعد كل صدمة احترافية بـ 30 ثانية وأخذ الإذن من الديسباتش او مسؤول الحالة",
          "style": "NORMAL_TEXT",
          "list": true
        }
      ]
    },
    {
      "id": "t.iuiot19dhhrq",
      "title": "5. سحب بصمات المواطن",
      "parentId": "t.0",
      "level": 1,
      "index": 4,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "5.أخذ بصمات المواطن",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "متى يحق لك تبصيم المواطن",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "ارتباط المواطن بتهمة جنائية",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "وجود بصمات في موقع جنائي",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "اشتباه المواطن في حالة جنائية",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "عدم حمل المواطن لهوية",
          "style": "NORMAL_TEXT",
          "list": true
        }
      ]
    },
    {
      "id": "t.cb989jl2bbs",
      "title": "6. الهروب على الاقدام",
      "parentId": "t.0",
      "level": 1,
      "index": 5,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "6. قواعد التعامل مع الهروب على الاقدام",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "يتم تمرير 3 طلقات تيزر وتكون أول طلقة تيزر بعد 10 ثانية وبين تيزر وتيزر 5 ثانية وبعدها يحقلك كلبشته على الفور",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "يحق لك تيزرت الشخص تيزر فوري بالحالات أدناه\n\nأ- الاعتداء عليك\nب- هروبه داخل مبنى حكومي مثل قسم الشرطة او المستشفى\n ج- تقديم اهانة واضحة وصريحة\n د- استخراج سلاح أبيض\nو- في حال توجه الشخص ك تدخل خارجي",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "يمنع: تيزرة شخص يحمل سلاح ناري او اثناء جو ممطر او حتى\n داخل الماء",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "يمنع: تدبيل النطحات يجب الالتزام بال 10 ثواني",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "يحق لك: اطلاق النار على الشخص في حال اخرج سلاحه الابيض\n\nتم تمرير 3 نطحات أول نطحة تكون بعد 10 ثانية وبين كل نطحه .7\n 10 ثواني وبعدها يحقلك كلبشته على الفور",
          "style": "NORMAL_TEXT",
          "list": true
        }
      ]
    },
    {
      "id": "t.z7slh57pz4kg",
      "title": "7. مفشلات الهروب الامن",
      "parentId": "t.0",
      "level": 1,
      "index": 6,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "7. مـفــشــلات الـهـروب الامــن هــي كالأتي:",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "1 - الـــتـــوجـه لــلــبــحـر",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2 - الــتــدخــل الـخــارجــي",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "3 - دخـول امـاكـن ضـيـقـه",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "4 - عـكـس سـيـر 3 مـــرات او اكــــثــــر\n[ فـي حـال عـكـس تـحـسـب 3 ثـوانـي اذا مـاعـدل مـسـاره  تـحـسـب عـكـسـه واحـده ]",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "5 - طــلـوع الارصــفـه اكــثـر مــن 3 مــرات",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "6 - تـعـريـض حـيـاه الـمـواطـنـيـن لـلـخـطـر [ مـثـل تـصــديمـهـم عـمـد اكـثـر مـن مـره ]",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "7 - دهـس عـسـكـري بـعــمـد[ يـتـم اطـلاق الـنـار عـلـيـه ]",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.m6sc7whfrys8",
      "title": "8. شروط التفاوض",
      "parentId": "t.0",
      "level": 1,
      "index": 7,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "8.شروط التفاوض",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "1 - عـدم اخـراج الـسـلاح اثـنـاء الـتـفـاوض مـن الـطـرفـيـن",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "[ خـصـم 1 دقـيـقـه فـي حـال طـلـعـه مـرتـيـن او رفـضـه لانـزال الـسـلاح ] فـي حـال الـمـخـالـفـه",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2 - الاحـتـرام الـمـتـبـادل مـن الـطـرفـيـن[ خـصـم 1 دقـيـقـه ] فـي حـال الـمـخـالـفـه",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "3 - عـدم الـتـحـدث بـاي مـوضـوع خـارج نـطـاق الـتـفـاوض [ خـصـم 1 دقـيـقـه فــي حــال كــررهـا ] فـي حـال الـمـخـالـفـه",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "4 - عـدم الـتـحـدث مـع اي شـخـص غـيـر مـفـاوض الـحـالـه لـلـطـرفـيـن",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "[ خـصـم 1 دقـيـقـه فــي حــال كــررهـا ] فـي حـال الـمـخـالـفـه",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "5 - عـدم الـجـديـه مـن طـرف الـمـجـرمـيـن [ خـصـم نــص الــوقــت ] فـي حـال الـمـخـالـفـه",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "6 - عـدم خـروج اي شـخـص غـيـر الـمـفـاوض [ يـحـق لـك كـلـبــشـتـه والــقـاء الـقـبـض عـلـيـه ] فـي حـال الـمـخـالـفـه",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "7 - عــدم الـتـاخـيـر او الـمـمـاطـلـه بـالــتـفـاوض  مـن دون سـبـب [ الخصم تقديري ] مــن الـطـرفـيـن فـي حـال الـمـخـالـفـه",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "يـمـنـع مـنـعـاً بـاتـاً تـفـشـيـل الـتـفـاوض لاي سـبـب كـان حـتـى لـو اخـل جـمـيـع الـشـروط الـمذكـوره اعـلاه",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.d0o51o7t11r4",
      "title": "9. أولوية التعامل مع الحالات",
      "parentId": "t.0",
      "level": 1,
      "index": 8,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "[ أولوية التعامل مع الحالات ]\n\nPriority 1 (Highest Priority Transport",
          "style": "HEADING_2",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "أولويه عالية للتعامل مع الحالات التاليه:",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "1- قتل شرطي أو إعتداء مسلح على احد الأفراد.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "2 - خطف أو احتجاز أحد افراد الشرطة.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "3- الاستنفار الأمني.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "Priority 2 (Medium Priority Transport)",
          "style": "HEADING_2",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "أولويه متوسطة للتعامل مع الحالات التاليه:",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "سرقة البنك المركزي",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "سرقة بنك بوليتو",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "سرقه محل المجوهرات",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "سرقة البوبكات",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "سرقة بنك فليكا",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "إختطاف المواطن",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "Priority 3  (Low Priority Transport)",
          "style": "HEADING_2",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "أولويه عادية للتعامل مع الحالات التاليه:",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "سرقة منزل",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "سرقة بقالة",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "سرقة سيارة",
          "style": "NORMAL_TEXT",
          "list": true
        },
        {
          "type": "paragraph",
          "text": "بلاغات 911",
          "style": "NORMAL_TEXT",
          "list": true
        }
      ]
    },
    {
      "id": "t.b6akqpo520ow",
      "title": "10. مسميات الرتب",
      "parentId": "t.0",
      "level": 1,
      "index": 9,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "ينادى بـ Cadet / Officer\n\nCadet\nOfficer One",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "Officer Two",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "Officer Three (رتبة اختيارية يمكن إضافتها ويمكن لا)",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "Senior Officer\n\nينادى بـ Senior Lead / Sergeant / Lieutenant",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "Senior Lead Officer\nSergeant\nSergeant ll\nLieutenant\nLieutenant ll\n\nينادى بـ Captain\n\nCaptain\nCaptain II\nCaptain III\nينادى بـ Commander / Chief\n\nGENERAL\nCOMMANDER\nDeputy Chief Of Police\nAssistant Chief of Police\n Chief Of Police",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.s3ktoh9jmdqp",
      "title": "11.مهام الرتب",
      "parentId": "t.0",
      "level": 1,
      "index": 10,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "10. يتم ذكر الآن مهام وتعريف الرتب  والتسلسل الشرطي لدى كل رتبة\n\nCadet -\n\nتعريف الرتبتين-\nهي الرتب الأولى في الجهاز، ويُعتبر حاملها تحت التدريب المباشر. يتلقى أساسيات العمل الشرطي من انضباط، التزام بالقوانين، وأساليب التعامل مع المواطنين. لا يمتلك كامل الصلاحيات الميدانية ويعمل دائمًا تحت إشراف مباشر من TO.\n\nمهام الرتبة:-",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- يمثل المرحلة الأولى للانضمام إلى جهاز الشرطة.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- يخضع المتدرب لبرامج تدريب مكثفة تشمل القوانين، النظام،وأساليب التعامل مع المواطنين.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- لا يُسمح له بالقيام بمهام رسمية ميدانية دون إشراف مباشر.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- الهدف من هذه المرحلة هو ترسيخ الانضباط وفهم أساسيات العمل الشرطي.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- يتم تقييم المتدرب بدقة قبل انتقاله إلى المرحلة التالية وبعد ذلك يختار القسم الذي يباشر العمل فيه .\n\nOfficer I -\n\nتعريف الرتبة :-\nبداية العمل الرسمي بعد التخرج من مرحلة التدريب. يباشر المهام الميدانية الأساسية مثل الدوريات، الاستجابة للبلاغات، وتطبيق القوانين تحت إشراف.\n\nمهام الرتبة:-\n\n- أول رتبة ميدانية رسمية بعد التخرج من الأكاديمية.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- مسؤول عن الاستجابة الفورية للبلاغات والدوريات الاعتيادية وممكن.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- يتعامل مع المخالفات البسيطة، ويكتب تقارير رسمية عن الحوادث.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- يظل تحت توجيه الرتب الأعلى لضمان الالتزام بالمعايير.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- Officer II\n\nتعريف الرتبة:-\nيكتسب خبرة عملية أكبر ويُسمح له بتولي بعض المسؤوليات الميدانية بشكل مستقل، مثل كتابة التقارير الكاملة والتحقيق في المخالفات البسيطة\n\nمهام الرتبة:-",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "- يملك خبرة عملية أكبر من Officer I.\n- يُكلَّف بمهام أكثر تعقيدًا مثل التحقيقات المبدئية وجمع الأدلة.\n- يُعتمد عليه بشكل أكبر في الميدان، ويُقيّم على دقته في إنجاز المهام.\n- يسمح مشاركته في اقسام متقدمة مثل (SWAT، PA).\n\nOfficer III -\n\nتعريف الرتبة:-\nيُعتبر شرطي ذا خبرة ميدانية واسعة، مؤهل للقيام بالتحقيقات الأكثر تعقيدًا، ويبدأ بمساعدة العساكر الجدد وتوجيههم في العمل اليومي.\n\nمهام الرتبة:-\n- ضابط متمرس وذو خبرة طويلة.\n- يسمح مشاركته في اقسام متقدمة مثل (SWAT، PA).\n- يُعتمد عليه في المواقف الحرجة التي تتطلب سرعة اتخاذ القرار.\n- (رتبة اختيارية يمكن إضافتها ويمكن لا)\n\n Senior Officer-\n\nتعريف الرتبة:- يُعد من الكفاءات المتمرسة في الجهاز، مسؤول عن متابعة الضباط الجدد وتقديم الإرشاد لهم. يمتلك خبرة عملية تؤهله للتعامل مع الحالات الميدانية عالية الخطورة، وله دور في التنسيق بين الضباط وضمان تطبيق السياسات العامة للجهاز.\n\nمهام الرتبة:-\n- شرطي أثبت كفاءته وخبرته من الخدمة.\n- مسؤول عن توجيه وتدريب الشرطة الجديدين في الميدان.\n- يُكلف بإدارة البلاغات المعقدة حتى وصول الرتب العليا.\n- يُعتبر مرجعًا للعساكر الأقل رتبة في الميدان.\n- يجمع بين الخبرة العملية والمعرفة بالقوانين والإجراءات.\n\nSenior Lead Officer-\nتعريف الرتبة :-\nرتبة قيادية ميدانية مسؤولة عن الإشراف على الوحدات الصغيرة. يقوم بمتابعة تنفيذ الأوامر والتأكد من الجاهزية التامة لعناصره. السينيور ليد أوفيسر هو المرجع المباشر للضباط الأقل رتبة ويُعتبر أساس الانضباط العسكري داخل الفريق.\nمهام الرتبة :-\n- أول رتبة إشرافية رسمية في السلك الشرطي.\n- يقود وحدة ميدانية ويشرف على جميع أنشطتها.\n- مسؤول عن مراقبة التقارير، مراجعة الأداء، وتطبيق اللوائح.\n- يتدخل مباشرةً في حال وقوع أي خلل أو تجاوز في حال كان مسؤول الفترة.\n- يمثل الرابط المباشر بين العساكر و الرتب العليا.\n\n Sergeant-\n\nتعريف الرتبة :-\nيمتلك صلاحيات أكبر من السينيور ليد أوفيسر العادي، ويُكلف عادةً بالإشراف على أكثر من وحدة ميدانية. دوره الأساسي متابعة الأداء الإداري والميداني معًا وضمان جاهزية الأفراد للتدخل في مختلف السيناريوهات.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "مهام الرتبة :-\nيمتلك خبرة قيادية أوسع من السينيور ليد أوفيسر العادي.\nيشرف على أكثر من وحدة ميدانية ويضمن التزامها بالخطة الأمنية.\nيتابع الانضباط العام، ويحل المشاكل الميدانية فورًا.يشارك في وضع الجداول الزمنية للمناوبات وتنظيم الموارد.\nيرفع تقاريره مباشرةً إلى الملازمين أو القادة الميدانيين",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "Sergeant ll -\nتعريف الرتبة :-\nيُعتبر من أبرز ضباط الصف، إذ يجمع بين الخبرة الميدانية الطويلة والقدرة على إدارة\nالمجموعات الكبيرة. يُناط به رفع تقارير تفصيلية للقيادات العليا، وتنسيق العمليات بين\nالوحدات المختلفة.\n\nمهام الرتبة :-\n- يركز على الجوانب الإدارية والتنظيمية داخل القسم.\n- ينسق بين الوحدات الميدانية والإدارة لضمان سير العمل بسلاسة.\n- يُعنى بمتابعة الشؤون الإدارية كالتقارير، الشكاوى، والانضباط الداخلي.\n- يلعب دورًا مهمًا في إدارة الموارد البشرية داخل القسم.\n- يُعتبر العمود الفقري الإداري للوحدات الشرطية.\n\nLieutenant -\nتعريف الرتبة :-\nأول رتبة في سلم الضباط الأعلى. مسؤول عن قيادة قسم محدد مثل قسم الدوريات أو التحقيقات. يشرف بشكل مباشر على الرقباء وضباط الصف ويعمل كحلقة وصل بين القيادة العليا والميدان.\nمهام الرتبة\n- بداية المسار القيادي في الجهاز.\n- يجب عليه قيادة اي قسم\n- يشرف على سير العمل ويراجع التقارير النهائية للوحدات.\n- يمثل نقطة اتصال مباشرة بين القيادة العليا وضباط الميدان.\n\nLieutenant ll -\nتعريف الرتبة:-\nرتبة قيادية متقدمة تتولى مسؤوليات إدارية وميدانية أوسع. يقوم بمتابعة عمل الضباط والرقباء بشكل شامل، ويُكلف بقيادة العمليات الميدانية متوسطة الحجم والتأكد من سيرها وفق المعايير النظامية.\n\nمهام الرتبة :-\n\n- رتبة قيادية متقدمة بخبرة أكبر من Lieutenant .\n- يُشرف على عدة وحدات أو أقسام ميدانية في وقت واحد.\n- يقود العمليات الميدانية الكبرى مثل المداهمات والمطاردات.\n- يتابع نتائج التحقيقات المعقدة ويرفعها للإدارة.\n- مسؤول عن تدريب وتأهيل الضباط المرشحين للقيادة.\n\nCaptain -\n\nتعريف الرتبة :-\nيعتبر المسؤول الأول لضباط الشرطة وله الصلاحيات الإشرافية الكاملة على كل الاقسام.\nمهام الرتبة:-\n- في بعض الاحيان يتم تعيينه كـ مسؤول ضباط .\n- يشرف على الموارد البشرية، التدريب، والإجراءات التنظيمية.\n- يتابع التنسيق بين الوحدات المختلفة داخل القسم.\n- يُعتبر حلقة الوصل الرئيسية بين الإدارة العليا والوحدات الميدانية.\n\nCaptain II\nتعريف الرتبة:-\nمن الرتب العليا، يتولى الإشراف على أكثر من قسم، وله دور في صياغة القرارات الاستراتيجية ومتابعة تنفيذها. يتعاون بشكل مباشر مع القيادة العليا لضمان كفاءة العمل الشرطي وتحقيق الأهداف الأمنية.\n\nمهام الرتبة :-\n- يشرف على عدة أقسام تخصصية داخل الشرطة.\n- يضع الخطط التكتيكية طويلة المدى.\n- يشارك في إدارة الأزمات والعمليات الأمنية الكبرى.\n- يمثل الشرطة في الاجتماعات التنسيقية مع السلطات الأخرى.\n- يُعتبر من القيادات الاستراتيجية التي تضع التوجيهات المستقبلية.\n\nCaptain III -\nتعريف الرتبة :-\nمن أعلى الرتب القيادية في الشرطة. مسؤول عن الإشراف العام على الإدارات والوحدات، وضمان التنسيق الكامل بينها. لهُ صلاحية إصدار التوجيهات الكبرى ورسم السياسات الأمنية على مستوى الشرطة ككل.\nمهام الرتبة :-\n- من أعلى المناصب القيادية في الجهاز الشرطي المحلي.\n- مسؤول عن إدارة قسم شرطة كامل بما فيه من موارد وأفراد.\n- يضع السياسات العامة ويشرف على تنفيذها بدقة.\n- يمثل الجهاز أمام السلطات المدنية والحكومية.\n- يملك الصلاحيات النهائية في القرارات الأمنية والتنظيمية.",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.kza78m3gn96w",
      "title": "12.شرح المسؤوليات",
      "parentId": "t.0",
      "level": 1,
      "index": 11,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "11.شرح المسؤوليات\nلكل جزء بالشرطة يوجد مسؤول له ويتم توضيح بعض المسؤوليات الميدانية ومن مخول له بالصلاحيات فيها.\nInternal Affairs :-\nوهو المسؤول عن أخطاء الميدان والمحاسبة فقط، وغير مخوّل بتغيير الديسباتش أو تعديل الوحدات الميدانية في حال وجود مسؤول الفترة أو الواتش كوماند.\nSupervisor:-\nيُعتبر المسؤول الثاني عن الأفراد في حال غياب الواتش كوماند، ويُسمح له بتعديل أخطاء الميدان. كما تكون له الأولوية في استلام الحالات الكبرى، والتأكد من توزيع الميدان بشكل صحيح، ومتابعة توزيع الحالات، إضافةً إلى الإشراف على صحة محاسبات المواطنين.ويُمنع عليه تعديل أخطاء الميدان في حال تواجد الواتش كوماند .\nWatch Commanders:-\nهو المسؤول الأول عن جميع أفراد الشرطة، كما يُعتبر المسؤول المباشر عن ضباط الصف، ويشمل ذلك تدريبهم ومحاسبتهم، ويُعد المرجع الأساسي في ترقياتهم. يتولى كذلك اختبار السوبرفايزر والتأكد من انضباط الميدان وسير العمل بالشكل المطلوب وهو من رتبة ستاف سارجنت .\n\nPU.Commander :-\nهو مسؤول الضباط وصاحب القرار في محاسبتهم، ويُعد المشرف الثاني على أقسام الشرطة.يملك الصلاحيات\nالكاملة داخل الأقسام، ويُعتبر المسؤول الأول عن صرف نقاط الضباط، وكذلك رفع قرارات\nالترقيات إلى إدارة الشرطة قبل اعتمادها النهائي.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "paragraph",
          "text": "Police Administration:-\nهي اللجنة القيادة العليا في رئاسة الشرطة، وتمثل القيادة الرسمية في أغلب القرارات. تملك الصلاحية الكاملة\nلمحاسبة من هم أدنى رتبة، ولا تُحاسَب لجنة القيادة العليا إلا بقرار من\nرئاسة الشرطة، حتى في حال اختلاف الرتب.\n\nPolice Presidency:-\nتتكون من:\n1.sheriff\n2.Police Commissioner\n3.CHP Commissioner\nوتتمثل مهامها في الإشراف العام على الجهاز الشرطي، واتخاذ القرارات المصيرية، واعتماد القوانين\nواللوائح النهائية، إضافة إلى ضمان سير العمل بأعلى كفاءة ممكنة.",
          "style": "NORMAL_TEXT",
          "list": false
        }
      ]
    },
    {
      "id": "t.ebf422g0qcz7",
      "title": "13. شارات الخدمة (Service Stripes)",
      "parentId": null,
      "level": 0,
      "index": 1,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "12.شارات الخدمة (Service Stripes)\n تُعتبر شارات الخدمة وساماً تقديرياً يُدرج ضمن الزي الميداني والإداري لرجال الشرطة المدنية، ليعكس الكفاءة، الالتزام، والخبرة الميدانية التي اكتسبها الضابط أو المنتسب خلال فترة خدمته في قطاع الشرطة. تُمنح هذه الشارات بناءً على الأقدمية، السجل الانضباطي الخالي من المخالفات، والمشاركة في القطاعات والعمليات الشرطية المختلفة، وتُعد مقياساً مهنياً للتميز والخبرة داخل الجهاز.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXeQJ_bkn6icovv0dEXgPSqP6-LwoBoXcJ7Mhz2gWgiOnI_73XPac_pFQ46cl5QNngme6DKStiCOF5ryiHO7_6LZT2tzgFvQT8nfC8hZLptYiwo9YeJfN4N4D5MkBGvNXhnXSr5EXj2o_6SMSd7PSyEX4Gvqvdt8zqfRFIDX4lqM1IXAEv0=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXdQR_HBF1aJhEPmdc8ORTV5wjQvMCrHDhqYEHxz2Wtw6U0TSYu1-kxCXJn4bt_Vst6_jy5pAsgLhsKATp960eZOLPXZEzISRVi-mlqc_yAILn8YYHucduIcOGQze-WfgPpM5ozZxAaNAWGj3oVoum-su1VOdIE-b2zLq-29Ne4kWI0A=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXda4625Ad2Mk5XOmnizc837Mthx00RF1uySLm0TFeCJ7M-OLD-D61YMTUEn98GQKDE1948dtItDoSZcMa4jgCNJKsi-HEg08q_32JaAFougvltsWIKNg3lfig7-cbFhDqQn_BVkhxF4Jk62tXkqo14BIXl9tyob8Vz1hoqs28DsgHwfAPA=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXduyDyuKsqufI6hVY5xEWS_R5Vhx0UgJXSMqQh-SXYaCCXMy_ayNQ_oQRVcvTjDjnOp4ayW-lWJ0Lt0Vic_TMu-W6QQmD-Qm4iawGm6u97JWPBWzq0lUEbkesXhvnzdv-QnACtXO2JaFYeiYCmMa6r-cNVf-VZ2IAh_J_Tjvl8O6qoypN0=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXeyi7B0boBy-GmwQV1eLa5Vdvf6xE1zVBJ2bN-v08Gl3SsktJIh85gabUsqw7DTaereFmsculNK6d_9U9isZzy-7pUHeFNFiyO6oFvG97pmKYLKSqU0RdZ6ZOJqL6XlDW_UcVTOpHduGLEpD3dlwkqgN1OPuvoIgZQQKbNS2VRcYCYRRQE=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXeMyzF0vEwpfxtNf_s4eHEisInxzTc7atjtcq1cqgB_kARRPhTgd6QyJX2Dgiq_NsHJIPkZ3euDBvpRZdpbkO1rZa9OZ9pRjdKtP1duPAafON0orb1KDxFKYZC4KEf7LkMl8Tbd3qEDvNCICBohTOTKtv3OlYgthjUUTDM7XBl3mBpD4-I=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXeshUzz5xX-DBuosOBLaIVqbkJG8Fbyt4p82cOgH2ERj_gS_S2PfDtUkAOEo198qQIFhZws8iDOcQmCr0DZzj8YJngyVrpqj8NBOkWj8DJSUVNRvJDzp2YGBhIebyZJpN5k3kTh6CZe205oOnXmc0sAqqJBRf19SPSRJCchAnlf9uIxfvY=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة"
        }
      ]
    },
    {
      "id": "t.p26dgauq9whc",
      "title": "14 . شريحة التفوق والالتزام الميداني",
      "parentId": null,
      "level": 0,
      "index": 2,
      "iconEmoji": "⛔",
      "blocks": [
        {
          "type": "paragraph",
          "text": "14. الميداليات والأوسمة (Medals & Ribbons)\nتُعد الميداليات والأوسمة الشرطية استحقاقاً تقديرياً يُدرج ضمن السجل المهني والزي الرسمي لرجال الشرطة المدنية، لتعكس الشجاعة، التفاني، والخبرة الميدانية التي اكتسبها الضابط أو المنتسب أثناء أداء الواجب. تُمنح هذه الأوسمة بناءً على الإنجازات الميدانية الاستثنائية، إنقاذ الأرواح، والأقدمية في الخدمة، وتُعد مقياساً أساسياً للتميز والانضباط داخل الجهاز.",
          "style": "NORMAL_TEXT",
          "list": false
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXehcW2ZqpmnrPxRt3fma3eAh7HvjdRKvHA54b283UsS_6sg7d7jVkHeEUx0zYQzj4U1xOYqXToZRh6SMT21TwQciEjQgtf7FBErS8rrCt5bdtQXLKqvBOE7vl6aiiQw4wUWdoPWlCs1uS5fPeZC_ZMRVfVIUgfgHYHFP1U8BHfgjBQDkTw=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXfXnw1mDpCqp5Ky1C-XGIf6Mf4bEv4bB3giJERq-JV0ZT_AEOytwg_GI2jmFnQ5Qx4vC_853qz5udgY6PCjJ6P3vDHv_8PPjCC6LVjb4cAhhAZFbX46PcqlVqzAg54ehNSLLECRMfgxcovt3YgzU5EjGsNjCxFwTBQ-AraSi9Hz-YEH=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXdXhEf0KVc17F0rKNCCGHA-m90ceEVqRCYKPv0XODk8Uxn-7R897lgtuURNwKjuaorwG_bNwnAK1f2CRiUaLwRjW6Ib_H2xRpHdvWB1xEWjSj-GTah2I9zR4zosYc3IqEfcIq8CLGelRpx52Igdu-ORPnY7FrsEJ-fzpe7IT2MmsDjm=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXcqK0O5rOZtTKZ425QI7qKPk_HYJWp9v_Rb8f0CpxOmYi57SvNz_FzBYqGxGjZgp2EBXVOU3htmt9kYguX1hW_SMZShK40gssiDWYyzs9pMFMtraWiJrKOx4-bdSvudDqbSkVj-EWaPVt02vECWjb0d92rxutsTWZtsSbBaeZLwbk-P3Es=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXeM-LQCO8bmdV9jmaQdp6ZlfUnkAzluBmJ9sGUxprjOXEuDJigQXQbpy6wwrfffyLQOTIue38qud2Yci-zFC1qWsDpcPUxpKTwG2J8wV0C6zz2_nYDiFUzxjPnySPG6mivtg64Hzq5P6v9WSTFeL6wWipK_UqpHd26wusTt5dbj9HTBW_o=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXd0sSwjrisbbxAaQFDuSFd8zKO3VIAporX9Y4IaRfuuckZ6tFfKCg4V3NKP-GZZiKbESIG0shCgrOG3boaC7uH9xIbYqM0vIKmoyZ5CFwbvrcAOukPgsVuzZ_N2p_FKOmwlXIV7kzqPMiIgXL5192YsqQcwCFfROt_r3XB-U6qt--ArSek=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXfcju-PeQmy1YoPSeH7jgsKd8PmP8j3NheJ3PZzgjIsIoRJLvuW-3DAUh30as85_d6BGUWaZjyp5WrhRFq7zQnQrWFleI7rL0ufueYiW1mH_59Gh_86Ar0A6PaV-yBpniTf9PYnt58f658e1DqxTyr3JEMc5HtMAjOONQm1BDH1yH7S=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXfUh-8CA4xIOuW7wea4BuCMy0J95V3hvZHxrsdZZSb98h1rb35ohACUP-S_da9v0Jm5WKZ3hFkPmeXwRb30exiind_wKmssl6QgRcw_KwFWVwu4G7BsW897hc64uvCDReSOySK6dYqZhSJA91uQpTEdr8vUdRauJAZw2-gOu8y6_ozl8ZU=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        },
        {
          "type": "image",
          "src": "https://lh7-rt.googleusercontent.com/docsz/AD_4nXduVIZS0bMfp9mQAHlVKUkgTU2LQCMHWaDSIc6cZIjT38Tq5Moz3watcO-e-S2VYSj4ha2GuXNuVvTNJJALF_gteHwdcBg09IJo_lBPz5dG4yYprXeP4DexjJ1kCtURqiGz6gy9hGNMx_PBr_UacvcLEDc9K6Wc1Pko2UPby5LwemZWUd0=s2048?key=pW1uRbgD1-FOebYBD6MBHA",
          "alt": "صورة من مستند SOPs"
        }
      ]
    }
  ]
} as const
