import type { TagId } from "@/lib/friend-mirror/constants";
import type { FMLocaleBundle } from "@/src/i18n/types";

const R = (lines: TemplateStringsArray) =>
  lines[0].trim().split("\n---\n") as unknown as readonly string[];

const roastLove = R`You say love isn’t a big deal—\nyet if they reply 3 minutes late,\nyou’re already reading sad quotes.
---
You: totally fine.\nYour brain: screenshotting chats at pixel level.
---
Other people date for butterflies;\nyou date like doing risk control—\nonly on “will they text back”.
---
You claim you’re rational;\none voice note and you bring your phone into the shower.
---
Your persona: calm adult.\nYour notes: “Did that period mean they don’t love me?”
---
Friends say chill;\nyou nod—then analyze punctuation three minutes later.
---
You insist you’re not jealous—\nuntil they like someone’s post and you archaeology that profile.
---
You say “whatever happens”;\n“whatever” means: follow your script.`;

const roastBoss = R`You’re not here to hang out—\nyou run stand-ups;\neven dinner needs goals aligned.
---
Others chat to relax;\nyou chat like OKRs: feelings, progress, risks.
---
You act humble,\nbut your eyes default to “founder + group admin”.
---
“Anything’s fine”—\nuntil the menu hits your hands and becomes strategy.
---
Friends want to lie flat;\nyou reframes it as “tactical rest”.
---
You’re not bossy—\nyou just pronounce “suggestions” as “decisions”.
---
Your meetings feel like concerts:\neveryone follows your tempo.
---
They tell a joke;\nyou add: “Let’s distill the methodology here.”`;

const roastMoney = R`You cry poor—\nyour checkout hand never rests.
---
Mouth: save money this year.\nBody: calculator already open for discounts.
---
You don’t love money—\nyou just make bills feel safe at your place.
---
Friends talk dreams;\nyou talk expected return.
---
You say zen—\nbut red packets make you devout.
---
“Moonlight spender”?\nMore like “the moon moved into your cart”.
---
Others wish for love;\nyou wish: no price hikes, no stock-outs, low fees.
---
Your comfort line:\n“It’s fine—money first.”\nThen a finance link.`;

const roastEmo = R`Daytime: normal human.\nAfter 23:00: inner essays—starring you.
---
You say early sleep;\nNetEase knows you better.
---
Others binge shows;\nyou binge feelings—more addictive.
---
Day feed: peaceful.\nNight feed: sadness filter batch mode.
---
You say it’s fine—\nbut shuffle is “whoever plays, whoever cries”.
---
Not emo—\nyou’re pulling emotional night shifts.
---
You’ll sleep once you “get it”—\n“get it” means more emo.
---
Others count sheep;\nyou count “why am I like this”.`;

const roastSlack = R`Your plan is perfect:\nstarting tomorrow.\nTomorrow: starting the day after.
---
You’re not lazy—\nyou outsourced effort to “future you”.
---
They hustle;\nyou hustle the blanket.
---
You want discipline—\ndiscipline means staying undisciplined daily.
---
Life motto:\nif you can lie, never sit;\nif tomorrow exists, never today.
---
Not procrastination—\nyou’re giving deadlines emotional support.
---
They spiral;\nyou spiral lying down first.
---
Meeting notes look full—\nzoom in: “mm-hmm okay”.`;

const roastSocial = R`You’re not extroverted—\nyou treat socializing like an extreme sport;\nothers’ hearts can’t keep up.
---
Awkward silence?\nYou fix it with one line that silences everyone—then louder chaos.
---
You say social anxiety—\nyour version: society feels anxious around you.
---
Others break ice with small talk;\nyou break ice with “let me tell you something wilder”.
---
Three minutes in the group—\nrules may need an update.
---
You don’t love chat—\nyou do calisthenics: loud moves, big gestures, call-and-response.
---
Friends want low profile;\nyour entrance is the spotlight.
---
Comfort style:\n“Don’t cry—I’ll tell a worse story so you laugh.”`;

const dareLove = R`Everyone thinks you’re “too clingy”—nobody dares say it—afraid of screenshots drama.
---
Friends want to say: don’t put all feelings on one person.
---
Some feel you change personality in love—they stay polite and quiet.
---
You ask “does he still love me?”—everyone thinks: put the phone down.
---
In group chats your name often trails “…here we go again”.
---
Nobody says: your negativity density is high—people need air.
---
Someone wants to say “don’t self-dramatize”—afraid you’ll read it as jealousy.
---
Everyone fears your 3am essays—there is no correct reply.`;

const dareBoss = R`People want small talk sometimes—not a retrospective.
---
Some feel you control the room—but only nod “mhmm you go”.
---
Friends want to refuse your plan—you talk too fast to interrupt.
---
Nobody says your “suggestions” sound like orders.
---
Someone is tired: every hangout feels like a kickoff.
---
In their head: we’re not your reports—really.
---
They want to say you interrupt—but fear structured feedback on the spot.
---
Someone muted you—but nobody will tell you.`;

const dareMoney = R`Nobody says splitting bills with you feels tense sometimes.
---
Some think you talk money too bluntly—too “real” to say out loud.
---
Friends want to borrow—but fear your ledger is too clear.
---
Secret wish: not everything needs a RMB conversion.
---
Some find your gifts too practical—not romantic—but won’t say it.
---
Group chat: your coupon links are a bit dense.
---
“Can we talk about non-money things sometimes?”
---
Some call you stingy in their head—but praise you as “smart” aloud.`;

const dareEmo = R`Nobody says bluntly: long emo streaks exhaust others too.
---
Someone wants you to stop self-attacking—afraid you’ll hear “you don’t get me”.
---
Friends need sleep—not a 3am feelings radio.
---
Secretly: your emotional tsunamis are frequent.
---
Someone wants to say “overthinking”—sends a sticker instead.
---
Friends won’t say: small things become epics with you.
---
Everyone fears: “do you hate me too?” out of nowhere.
---
Some quietly reduce contact—to miss the midnight theater.`;

const dareSlack = R`Nobody says: when you slack, the team feels it.
---
Someone wants to nudge you—afraid of “slack bounce-back”.
---
In their head: your “soon” basically means “next life”.
---
They want reliability once more than jokes.
---
Some feel your promises are light—delivery is heavy—but won’t poke it.
---
The group knows your disappearance reasons—nobody dismantles the joke.
---
Nobody hands you critical tasks—mouth still says “no rush”.
---
Some are disappointed—choose humor to move on.`;

const dareSocial = R`Nobody says: sometimes you genuinely trigger social fear.
---
Someone wants you quieter—afraid you’ll say “loosen up”.
---
Friends need boundaries—don’t know how to draw them for you.
---
Secretly: not every dinner needs a hype captain.
---
Some jokes land too hard—only awkward laughs remain.
---
Friends can’t decline your plans—you’ll schedule round two.
---
They want to say: calm down—it’s just food.
---
Someone’s contact note silently becomes “high energy alert”.`;

const hidLove = R`Hidden trait: independent on the lips,\n80-episode romance in the heart.
---
Hidden trait: rational is a skin;\nlove-brain is the body.
---
Hidden trait: “whatever” always means “guess what I want”.
---
Hidden trait: emotional radar only powers on for crushes.
---
Hidden trait: self-soothe level S;\nreplay level S+.
---
Hidden trait: looks chill—\nsecretly treats chat logs as evidence chains.
---
Hidden trait: PhD on “read but no reply”.
---
Hidden trait: love is a side gig;\nimagining the main storyline is the job.`;

const hidBoss = R`Hidden trait: life as project management—sometimes forgetting you’re human.
---
Hidden trait: strong leadership;\nlistening mode occasionally offline.
---
Hidden trait: loves efficiency;\ndefines “waste” as anything you didn’t label.
---
Hidden trait: says “I’ll delegate”—eyes still on the progress bar.
---
Hidden trait: meeting-note personality—even dating wants aligned wording.
---
Hidden trait: born main character—supporting roles get tired.
---
Hidden trait: when you say “anything goes”, nobody dares truly random.
---
Hidden trait: team soul—and sometimes team pressure.`;

const hidMoney = R`Hidden trait: balance digits are part of your safety blanket.
---
Hidden trait: romance can be priced as “value for money”.
---
Hidden trait: zero immunity to the word “free”.
---
Hidden trait: spending hurts—not buying hurts more.
---
Hidden trait: “stingy” on the surface—generous when it’s “worth it”.
---
Hidden trait: financial freedom shows up too often on dream lists.
---
Hidden trait: shows care with coupons.
---
Hidden trait: mood stabilizer might be payment notifications.`;

const hidEmo = R`Hidden trait: fine by day—floodgates at night.
---
Hidden trait: playlists know you better than therapy.
---
Hidden trait: turns small cuts into epic inner wounds.
---
Hidden trait: huge empathy—except toward yourself (sharper).
---
Hidden trait: wants to be seen—afraid to be fully read.
---
Hidden trait: “last 3 days visible”—emotional cache is longer.
---
Hidden trait: heals with time—and with chewing it over again.
---
Hidden trait: gentle to others—keeps the sharp for yourself.`;

const hidSlack = R`Hidden trait: procrastination is the UI—avoiding choices is the OS.
---
Hidden trait: actually scared to fail—so first claim you don’t want it.
---
Hidden trait: professional at lying flat—still panics inside sometimes.
---
Hidden trait: uses humor to cover “I’m not ready yet”.
---
Hidden trait: not unable to hustle—just rests until it becomes habit.
---
Hidden trait: deadline is the only productivity faith.
---
Hidden trait: plans always beautiful—execution always “tomorrow”.
---
Hidden trait: zen shell—anxious core.`;

const hidSocial = R`Hidden trait: energy outward—still needs solo recharge.
---
Hidden trait: uses hype to cover awkward—then louder hype.
---
Hidden trait: “not afraid of cringe” used as a superpower.
---
Hidden trait: actually scared of being ignored—so you occupy the room first.
---
Hidden trait: comedian mode—serious mode surprises people.
---
Hidden trait: boundaries need reminders—you do adjust.
---
Hidden trait: many friends—few can hold your voltage.`;

const tag = (id: TagId, label: string) => [id, label] as const;

export const enUSBundle: FMLocaleBundle = {
  locale: "en-US",
  tags: Object.fromEntries([
    tag("love_brain", "Love brain"),
    tag("born_boss", "Born boss"),
    tag("money_magnet", "Money magnet"),
    tag("midnight_emperor", "Midnight emo"),
    tag("master_slack", "Master of slack"),
    tag("social_terror", "Social chaos"),
  ]) as FMLocaleBundle["tags"],
  roasts: {
    love_brain: roastLove,
    born_boss: roastBoss,
    money_magnet: roastMoney,
    midnight_emperor: roastEmo,
    master_slack: roastSlack,
    social_terror: roastSocial,
  },
  dare: {
    love_brain: dareLove,
    born_boss: dareBoss,
    money_magnet: dareMoney,
    midnight_emperor: dareEmo,
    master_slack: dareSlack,
    social_terror: dareSocial,
  },
  hidden: {
    love_brain: hidLove,
    born_boss: hidBoss,
    money_magnet: hidMoney,
    midnight_emperor: hidEmo,
    master_slack: hidSlack,
    social_terror: hidSocial,
  },
  fallbackRoasts: [
    "In friends’ eyes,\nyou’re sharper than you think.\nTags are jokes—impression is real.",
    "Don’t believe all of it—\nbelieve half—\nleave the rest to life.",
  ],
  mock: {
    names: ["Azi", "Kobayashi", "Zalo user", "Minh", "Lan", "Kai"],
    anonymous: "Anonymous friend",
    minutesAgo: "{{n}} min ago",
  },
  ui: {
    common: {
      user: "User",
      mysteriousUser: "Mystery user",
      ta: "them",
      close: "Close",
      viewLargeImage: "View full image",
      closeLightboxHint: "Tap outside to close · Esc",
      fm: "FriendMirror",
      mock: "Demo",
    },
    header: {
      title: "How friends see you",
      subtitle: "Invite · Vote · Results (demo)",
    },
    participation: {
      liveHot: "Trending",
      liveCountLine: "{{count}} joins (live)",
      demoLabel: "Demo data",
      demoCountLine: "{{count}} interactions (mock)",
    },
    fab: { start: "Start", copy: "Copy", submit: "Submit", share: "Share" },
    loading: {
      footerLine: "SYNC · MOCK · NO BACKEND",
      mirror: {
        title: "Building your mirror…",
        tips: [
          "Writing growth seeds…",
          "Generating your share link…",
          "Warming up the vote pool…",
        ],
      },
      invite: {
        title: "Opening invite card…",
        tips: ["Applying template…", "Adding spicy copy…", "Almost there."],
      },
      friendView: {
        title: "Entering friend view…",
        tips: ["Switching anonymous mode…", "Loading their meme tags…"],
      },
      vote: {
        title: "Friends are voting…",
        tips: [
          "Collecting spicy takes…",
          "Calculating who’s the roast MVP…",
          "Building the TOP board…",
        ],
      },
      aggregate: {
        title: "Summarizing votes…",
        tips: ["Pulling mock stats…", "Rendering results…"],
      },
    },
    home: {
      kicker: "FriendMirror",
      titleLine1: "See how friends",
      titleLine2: "roast you (nicely)",
      sub: "Create a link, friends pick tags anonymously, get a fun card.",
      subMock: "Frontend mock only—no real backend.",
      photoTitle: "Photo",
      photoAlt: "Profile photo",
      photoHint: "Friends vote while looking at this photo · stays in this browser only",
      removePhoto: "Remove",
      uploadCta: "Tap to upload",
      uploadAreaAria: "Upload profile photo",
      cameraAria: "Choose from gallery or take a photo",
      photoHelpWith:
        "Tap photo for fullscreen · camera button to ",
      photoHelpChange: "replace",
      photoHelpWithout: "Gallery or quick snap · saved locally only",
      nicknameLabel: "Your nickname",
      nicknamePh: "Alex / Minh",
      startCta: "Start now",
      flowPreview: "Flow preview",
      navHome: "① Home",
      navInvite: "② Invite",
      navVote: "③ Vote",
      navResult: "④ Result",
    },
    invite: {
      subtitle: "Invite friends to rate me",
      shareLink: "Share link",
      copyLink: "Copy link",
      simulateShare: "Demo: share to group (toast only)",
      simulateFriend: "Simulate friend opening link",
    },
    vote: {
      banner: "Vote for {{name}}",
      titleLine1: "Who do you think",
      titleLine2: "they are?",
      hint: "Multi-select · anonymous submit",
      submit: "Submit vote",
    },
    result: {
      shareLink: "Share link",
      again: "Again",
    },
    footer: { line: "FriendMirror · demo" },
    nav: {
      homeShort: "Home",
      inviteShort: "Invite",
      voteShort: "Vote",
      resultShort: "Result",
    },
    toast: {
      imageTooBig: "Please use an image under 12MB",
      imageReadFail: "Can’t read this image—try JPG / PNG",
      createFailed: "Couldn’t create profile",
      needLinkFirst: "Start from home to generate a link",
      copied: "Link copied",
      copyFail: "Copy failed—long-press the link",
      demoShareRecorded: "Demo share recorded",
      posterSaved: "Poster saved",
      posterFail: "Save failed—you can screenshot",
      storySaved: "Image saved",
      storyFail: "Save failed—try screenshot",
      trackedCopied: "Tracked link copied",
    },
    votePage: {
      notConfiguredTitle: "Can’t load vote page",
      notConfiguredBody:
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and retry.",
    },
    errors: {
      invalidLink: "Invalid link",
      submitFail: "Submit failed",
    },
    language: {
      label: "Language",
      zh: "中文",
      vi: "Tiếng Việt",
      en: "English",
      ja: "日本語",
    },
    resultPoster: {
      tagEmphasis: "「{{tag}}」",
      posterDownloadName: "FriendMirror-Report-{{name}}.png",
      downloadNameFallback: "User",
      friendMatch: "Friend match",
      friendSeesYou: "How friends see you",
      moreTags: "+{{n}} tags hidden",
      roast: "Roast",
      dare: "Unsaid",
      hidden: "Hidden mode",
      livePlaying: "{{count}} playing",
      demoCount: "Demo {{count}} joins",
      friendsActed: "{{n}} friends voted",
      disclaimer: "For fun · story-ready screenshot",
      savePoster: "Save HD poster",
      savingPoster: "Exporting…",
    },
    story: {
      sectionKicker: "Story card",
      sectionTitle: "Portrait mode, one tap",
      sectionSub: "Save for stories · links include source stats",
      primaryLabel: "Main tag",
      matchBadge: "Match",
      downloadBasename: "FriendMirror-{{name}}",
      saveImage: "Save image",
      generating: "Working…",
      copyLink: "Copy link",
      preview: "Preview (no tracking):",
    },
  },
};
