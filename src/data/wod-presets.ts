// Builds prontas da Wheel of Destiny. Fonte: TibiaPal, Wheel of Destiny Builds (tibiapal.com/wheels), consulta em 26/09/2026.
// Cada código abre no planner oficial do tibia.com e no planejador do TibiaConsult. Descrições como no TibiaPal.

export interface WodBuild {
  points: number;
  desc: string;
  notes: string;
  code: string;
}

export const WOD_PRESETS: Record<string, { gems: string[]; builds: WodBuild[] }> = {
 "druid": {
  "gems": [
   "Hit Points",
   "Mitigation",
   "Any Elemental Resistance",
   "Mana",
   "Twin Bursts Mastery",
   "Blessing of the Grove Mastery",
   "Strong Ice Wave Base Damage"
  ],
  "builds": [
   {
    "points": 50,
    "desc": "T1 Forks",
    "notes": "",
    "code": "D0Y2DABEZo_P9IAAA"
   },
   {
    "points": 100,
    "desc": "T1 Forks + 1x Gem",
    "notes": "",
    "code": "D0Y2DABEZGqPz_SAAA"
   },
   {
    "points": 150,
    "desc": "T1 Forks + 2x Gem",
    "notes": "",
    "code": "D0Y2BABkYQ0ghFkOE_EgAA"
   },
   {
    "points": 175,
    "desc": "T1 Forks + 2x Gem",
    "notes": "",
    "code": "D0Y2DABEZGINIbzv-PBAA"
   },
   {
    "points": 225,
    "desc": "T1 Forks + 3x Gem",
    "notes": "",
    "code": "D0Y2BABkYQEkx5w0X_IwEA"
   },
   {
    "points": 250,
    "desc": "T1 Forks + T1 Ulu's",
    "notes": "",
    "code": "D0Y2DAAJJGYMobTKYA8X8kAAA"
   },
   {
    "points": 350,
    "desc": "T1 Forks + T1 Ulu's + 2x Gem",
    "notes": "",
    "code": "D0Y2BABkYgQtIITHmDRVKA-D8SAAA"
   },
   {
    "points": 500,
    "desc": "T1 Forks + T2 Ulu's + 1x Greater Gem",
    "notes": "",
    "code": "D0Y2BABykMRmDKG0hITgMx_yMBAA"
   },
   {
    "points": 725,
    "desc": "T1 Forks + T2 Ulu's + 1x Greater Gem + T2 Strong Ice Wave",
    "notes": "",
    "code": "D0Y2BAAUYMDCkgAkh5A4kT00DM_0gAAA"
   },
   {
    "points": 1075,
    "desc": "T2 Forks + T2 Ulu's + 1x Greater Gem + T2 Blessing of the Grove",
    "notes": "",
    "code": "D0Y2BgSJl2goGBwZsBBIyAXBABpEACktNAzP9IAAA"
   }
  ]
 },
 "knight": {
  "gems": [
   "Hit Points",
   "Mitigation",
   "Any Elemental Resistance",
   "Fierce Berserk Base Damage",
   "Front Sweep Base Damage",
   "Fair Wound Cleansing",
   "Combat Mastery Mastery",
   "Executioner's Throw Mastery"
  ],
  "builds": [
   {
    "points": 50,
    "desc": "T1 Front Sweep",
    "notes": "",
    "code": "K0Y2DABEZo_P9IAAA"
   },
   {
    "points": 100,
    "desc": "T1 Front Sweep + 1x Gem",
    "notes": "",
    "code": "K0Y2DABEZGqPz_SAAA"
   },
   {
    "points": 150,
    "desc": "T1 Front Sweep + 2x Gem",
    "notes": "",
    "code": "K0Y2BABkYQ0ghFkOE_EgAA"
   },
   {
    "points": 225,
    "desc": "T1 Front Sweep + 3x Gem",
    "notes": "",
    "code": "K0Y2BABkYQEkx5w0X_IwEA"
   },
   {
    "points": 250,
    "desc": "T1 Combat Mastery + T1 Front Sweep",
    "notes": "",
    "code": "K0Y2DAAN5GEApMgtj_kQAA"
   },
   {
    "points": 500,
    "desc": "T1 Combat Mastery + T1 Executioner's Throw + T1 Front Sweep",
    "notes": "",
    "code": "K0Y2BgSJFkAAJvEMFgBMSSRgwIgRQg_o8EAA"
   },
   {
    "points": 500,
    "desc": "T2 Combat Mastery + 1x Greater Gem",
    "notes": "",
    "code": "K0Y2BABykMRmDKG0hITgMx_yMBAA"
   },
   {
    "points": 500,
    "desc": "T2 Executioner's Throw + 1x Greater Gem",
    "notes": "",
    "code": "K0Y2BgYJgmCSS8U4AEgxEDmEIF_5EAAA"
   },
   {
    "points": 625,
    "desc": "T2 Executioner's Throw + T2 Exori Min",
    "notes": "",
    "code": "K0Y2BgSJl2goGBwZsBBIzgBBL4jwQA"
   },
   {
    "points": 725,
    "desc": "T2 Executioner's Throw + T2 Exori Min + 1x Greater Gem",
    "notes": "",
    "code": "K0Y2BgYJh2Akh4pwAJBiOGFBCBCv4jAQA"
   },
   {
    "points": 750,
    "desc": "T2 Executioner's Throw + T1 Combat Mastery + 1x Greater Gem",
    "notes": "",
    "code": "K0Y2BgYJgmCSS8U4AEgxFDCoOkEYjF4A0mQaL_kQAA"
   },
   {
    "points": 925,
    "desc": "T2 Executioner's Throw + T2 Exori Min + T1 Combat Mastery + 1x Greater Gem",
    "notes": "",
    "code": "K0Y2BgYJh2Akh4pwAJBiOGFAZJIxCLwRtMgkT_IwEA"
   },
   {
    "points": 1000,
    "desc": "T2 Combat Mastery + T2 Executioner's Throw + 2x Greater Gem",
    "notes": "",
    "code": "K0Y2BgYJgmCSS8U4AEgxFDSgqQAIIUbyAhOQ3E_I8EAA"
   },
   {
    "points": 1175,
    "desc": "T2 Combat Mastery + T2 Executioner's Throw + T2 Exori Min + 2x Greater Gem",
    "notes": "",
    "code": "K0Y2BgYJh2Akh4pwAJBiOGlBQgAQQp3kBCchqI-R8JAAA"
   }
  ]
 },
 "paladin": {
  "gems": [
   "Hit Points",
   "Mitigation",
   "Any Elemental Resistance",
   "Divine Caldera Base Damage",
   "Divine Empowerment Mastery",
   "Salvation Healing"
  ],
  "builds": [
   {
    "points": 50,
    "desc": "1x Gem",
    "notes": "",
    "code": "P0Y2DAAoxQuf-RAAA"
   },
   {
    "points": 100,
    "desc": "2x Gem",
    "notes": "",
    "code": "P0Y2BABkYoFAz8RwIA"
   },
   {
    "points": 175,
    "desc": "2x Gem + T1 Ethereal Barrage",
    "notes": "",
    "code": "P0Y2DABEZGINIbzv-PBAA"
   },
   {
    "points": 250,
    "desc": "T1 Divine Barrage + T1 GoL",
    "notes": "Holy Build",
    "code": "P0Y2AAA0kQkeJtxIAN_EcCAA"
   },
   {
    "points": 250,
    "desc": "T1 Ethereal Barrage + T1 Carpet",
    "notes": "Physical Build",
    "code": "P0Y2DAAJJGYMobTKYA8X8kAAA"
   },
   {
    "points": 450,
    "desc": "T2 Gran Con",
    "notes": "Base Bossing Build",
    "code": "P0Y2AAgxQw6W0E4Rl5Q_hQ8B8JAAA"
   },
   {
    "points": 450,
    "desc": "T2 Amp Res",
    "notes": "Base Ranged Spawn Build",
    "code": "P0Y2CAAu8UEGkEJ1K8YTIM_5EAAA"
   },
   {
    "points": 500,
    "desc": "T2 Divine Barrage + T1 GoL + T1 Avatar",
    "notes": "Holy Build",
    "code": "P0Y2AAA0kQkeJtBOEZeYPFUiA8hv9IAAA"
   },
   {
    "points": 500,
    "desc": "T2 Carpet + T1 Ethereal Barrage + 1x Greater Gem",
    "notes": "Physical Build",
    "code": "P0Y2BABykMRmDKG0hITgMx_yMBAA"
   },
   {
    "points": 575,
    "desc": "Ballistic Mastery",
    "notes": "Physical Resistant Build, e.g. Rosh",
    "code": "P0Y2DAAoy8U8D0NDB54j8SAAA"
   },
   {
    "points": 575,
    "desc": "Positional Tactics",
    "notes": "Holy Build",
    "code": "P0O8EAAtPAZIq3EQM28B8JAAA"
   },
   {
    "points": 600,
    "desc": "T2 Divine Barrage + T1 Empowerment",
    "notes": "Holy Build",
    "code": "P0Y2BAgBQoaQSmvL1ToOL_kQAA"
   },
   {
    "points": 725,
    "desc": "T2 Ethereal Barrage + 1x Greater Gem",
    "notes": "Physical Build",
    "code": "P0Y2BgYJh2Akh4pwAJBiOGFBCBCv4jAQA"
   },
   {
    "points": 775,
    "desc": "T2 Divine Barrage + T2 Empowerment + 1x Greater Gem",
    "notes": "Holy Build",
    "code": "P0Y2BAgBQoaQSmvL1TGCSngZj_kQAA"
   },
   {
    "points": 1000,
    "desc": "T2 Mas San + T2 Divine Barrage + T2 Empowerment + 1x Greater Gem",
    "notes": "Holy Build",
    "code": "P0Y2BAgBQGBiMQaQTmeHunMJyYBmL-RwIA"
   }
  ]
 },
 "sorcerer": {
  "gems": [
   "Hit Points",
   "Mitigation",
   "Any Elemental Resistance",
   "Mana",
   "Beam Mastery Mastery",
   "Great Energy/Death Beam Base Damage",
   "Great Fire Wave Base Damage",
   "UE Base Damage",
   "Energy Wave CD Reduction"
  ],
  "builds": [
   {
    "points": 50,
    "desc": "1x Gem",
    "notes": "",
    "code": "S0Y2DAAoxQuf-RAAA"
   },
   {
    "points": 100,
    "desc": "2x Gem",
    "notes": "",
    "code": "S0Y2BABkYoFAz8RwIA"
   },
   {
    "points": 150,
    "desc": "2x Gem + T1 Focus Spells",
    "notes": "",
    "code": "S0Y2BABkYQ0ghFkOE_EgAA"
   },
   {
    "points": 225,
    "desc": "3x Gem + T1 Focus Spells",
    "notes": "",
    "code": "S0Y2BABkYQEkx5w0X_IwEA"
   },
   {
    "points": 225,
    "desc": "T1 Death Echo",
    "notes": "",
    "code": "S0Y2DABEYgIsUbzv-PBAA"
   },
   {
    "points": 250,
    "desc": "T1 Beam Mastery + T1 Death Echo",
    "notes": "Energy",
    "code": "S0Y2BgYJAEYgbvFBBpxIAF_EcCAA"
   },
   {
    "points": 250,
    "desc": "T1 Energy Wave",
    "notes": "Energy",
    "code": "S0Y2DAAoy8QaRkCpT7HwkAAA"
   },
   {
    "points": 250,
    "desc": "T1 LoD + T1 Death Echo",
    "notes": "Fire/Death",
    "code": "S0Y2DAAJJGIDLFGy7wHwkAAA"
   },
   {
    "points": 425,
    "desc": "T1 Beam Mastery + T1 E-Wave + T1 Death Echo",
    "notes": "Energy/Death",
    "code": "S0Y2BgYJBkAIEUEGHkDWZ7I0SA4D8SAAA"
   },
   {
    "points": 425,
    "desc": "T1 Beam Mastery + T1 E-Wave",
    "notes": "Fire (TH)",
    "code": "S0Y2CAA0kgNvJOATG9wQIpUIn_SAAA"
   },
   {
    "points": 500,
    "desc": "T1 Beam Mastery + T1 E-Wave + T1 Death Echo + T1 Avatar",
    "notes": "Energy/Death",
    "code": "S0Y2BgYJAEYgbvFBBpxAAmvUGkJFgECP4jAQA"
   },
   {
    "points": 500,
    "desc": "T2 Death Echo + T1 LoD + T1 Beam Mastery",
    "notes": "Fire (Solo)/Death",
    "code": "S0Y2BgYJAEYgbvFBBpBOKCCIYUbwYY-I8EAA"
   },
   {
    "points": 650,
    "desc": "T2 E-Wave + T1 Beam Mastery",
    "notes": "Energy/Death",
    "code": "S0Y2BgYJBkAIEUhhRvIyNvMNsbKgIB_5EAAA"
   },
   {
    "points": 700,
    "desc": "T2 Beam Mastery + T1 E-Wave + 1x Greater Gem",
    "notes": "Energy/Death/Fire (TH)",
    "code": "S0Y2BgYJgmCSS8U4AEgxEDmIKQECYDw38kAAA"
   },
   {
    "points": 750,
    "desc": "T2 LoD + T2 Death Echo + 1x Greater Gem",
    "notes": "Fire (Solo)",
    "code": "S0Y2BgYJAEYgbvFBBpxMCQAiKAlDdIZhqI-R8JAAA"
   },
   {
    "points": 1000,
    "desc": "T2 Beam Mastery + T2 E-Wave + 1x Greater Gem + T1 Avatar + T1 GoL",
    "notes": "Energy/Death",
    "code": "S0Y2BgYJgmySDJ4J3CkOJtZMSQAhQw8gYSDJIgJgj8RwIA"
   },
   {
    "points": 1000,
    "desc": "T2 LoD + T2 Beam Mastery + T2 Death Echo + 2x Greater Gem",
    "notes": "Fire (Solo)",
    "code": "S0Y2BgYJgmCSS8U4AEgxFDSgqQAIIUbyAhOQ3E_I8EAA"
   }
  ]
 },
 "monk": {
  "gems": [
   "Hit Points",
   "Mitigation",
   "Any Elemental Resistance",
   "FoB Base Damage",
   "Sweeping Takedown Base Damage",
   "Ascetic Mastery",
   "SOB Mastery"
  ],
  "builds": [
   {
    "points": 50,
    "desc": "T1 Chain",
    "notes": "",
    "code": "M0Y2DABEZo_P9IAAA"
   },
   {
    "points": 100,
    "desc": "T1 Chain + 1x Gem",
    "notes": "",
    "code": "M0Y2DABEZGqPz_SAAA"
   },
   {
    "points": 150,
    "desc": "T1 Chain + 2x Gem",
    "notes": "",
    "code": "M0Y2BABkYQ0ghFkOE_EgAA"
   },
   {
    "points": 225,
    "desc": "T1 Chain + 3x Gem",
    "notes": "",
    "code": "M0Y2BABkYQEkx5w0X_IwEA"
   },
   {
    "points": 250,
    "desc": "T1 Ascetic",
    "notes": "",
    "code": "M0Y2DAAN5GEApMgtj_kQAA"
   },
   {
    "points": 500,
    "desc": "T2 Ascetic + 1x Greater Gem",
    "notes": "",
    "code": "M0Y2BABykMRmDKG0hITgMx_yMBAA"
   },
   {
    "points": 600,
    "desc": "T2 Ascetic + 1x Greater Gem + T1 FoB",
    "notes": "",
    "code": "M0Y2BAgBQoaQSmvIGE5DQQ8z8SAAA"
   },
   {
    "points": 625,
    "desc": "T2 Chain + T2 Outburst",
    "notes": "",
    "code": "M0Y2BgYJh2Akh4pwAJBiM4gQT-IwEA"
   },
   {
    "points": 725,
    "desc": "T2 Chain + T2 Outburst + 1x Greater Gem",
    "notes": "",
    "code": "M0Y2BgYJh2Akh4pwAJBiOGFBCBCv4jAQA"
   },
   {
    "points": 775,
    "desc": "T2 Ascetic + T2 FoB + 1x Greater Gem",
    "notes": "",
    "code": "M0Y2BAgBQoaQSmvL1TGCSngZj_kQAA"
   },
   {
    "points": 900,
    "desc": "Sanctuary + T2 FoB + 1x Greater Gem",
    "notes": "",
    "code": "M0Y2BAgBRvIwjDyBvCnwYiGE7I_YcCOYYgAA"
   },
   {
    "points": 1125,
    "desc": "T2 Ascetic + Sanctuary + T2 FoB + 1x Greater Gem",
    "notes": "",
    "code": "M0Y2BAgBQoaQSmvL1TpklOA7JO_AcDOYag____AwA"
   }
  ]
 }
};
