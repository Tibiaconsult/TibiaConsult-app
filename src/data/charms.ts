// Charms. Gerado por scripts/charms-bosstiary.mjs a partir da TibiaWiki (infobox de cada charm) em 26/09/2026.
// Custo por nível (1, 2 e 3); o efeito vem como na wiki, em inglês, com os três níveis separados por " / ".
// Tipo (dano, defesa, utilidade) é classificação do site; a wiki não separa.

export type CharmKind = "dano" | "defesa" | "utilidade";

// Regras dos dois tipos (TibiaWiki, Major Charms e Minor Charms):
// - major: pago em charm points (vêm do bestiário completo) e só vai em creature com o bestiário completo;
// - minor: pago em Minor Charm Echoes e vai em creature com o estágio 2 do bestiário.
// Cada nível comprado de um charm major rende echoes; char promovido ganha 100 echoes.
export const ECHOES_PER_MAJOR_LEVEL = [50, 100, 200];
export const ECHOES_PROMOTION = 100;

export interface Charm {
  name: string;
  /** major: charm points; minor: Minor Charm Echoes */
  type: "major" | "minor";
  kind: CharmKind;
  cost: number[];
  effect: string;
  notes: string;
}

export const CHARM_LIST: Charm[] = [
  {
    "name": "Adrenaline Burst",
    "type": "minor",
    "kind": "defesa",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Bursts of adrenaline enhance your reflexes with a 6% / 9% / 12% chance after getting hit and lets you move faster for 10 seconds.",
    "notes": "While the Speed boost of Adrenaline Burst is considerable - it multiplies character speed by 2.5 -, its unpredictability makes it hard to be used very efficiently. Also, since this bonus removes and is removed by haste spells, it will not stack with other temporary bonuses, reducing its usefulness."
  },
  {
    "name": "Bless",
    "type": "minor",
    "kind": "defesa",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Blesses you and reduces skill and XP loss by 6% / 9% / 12% when killed by the chosen creature.",
    "notes": "It is not additive to Blessings, and is applied after all their protection has been calculated. For example, a promoted character with full blessings will be protected by 86% of experience loss on a death. If the stage 3 Bless charm activates, it will further protect the remaining 14% for 12%, for a total of 87,68% protection."
  },
  {
    "name": "Carnage",
    "type": "major",
    "kind": "dano",
    "cost": [
      600,
      900,
      3000
    ],
    "effect": "Killing a monster has 10% / 20% / 22% chance to deal Physical Damage equal to 15% of its maximum health to all monsters in a small radius.",
    "notes": "* The effect radius of this charm will hit all nondiagonal squares around the killed creature, similarly to an Explosion Rune or a Berserk without diagonals. * Damage is limited up to 6 times the character level. * Creatures killed due to Carnage damage have no chance to trigger another instance of Carnage effect. * Charm only has a chance of working if the character with the charm activated makes the actual last hit to the selected creature. ** Additionally, last hits performed by summons or Familiars of a player using this charm will not have a chance of triggering this charm's effect. * This charm does not trigger when killing a summon of a creature (i.e a Fire Elemental summoned by a Demon). * Unlike Wound, the damage from this charm is reduced by creatures' armor, however its damage ."
  },
  {
    "name": "Cleanse",
    "type": "minor",
    "kind": "defesa",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Cleanses you from within with a 6% / 9% / 12% chance after you get hit and removes one random active negative status effect and temporarily makes you immune against it.",
    "notes": "Cleanse will remove one existing negative condition the character has when it's triggered, regardless if the condition was applied by the creature on which the charm is activated or not. If the character has more than one negative condition, the selection will be random. For example, if you are Burning (from a Dragon Lord's attack or from an environment Fire Field), you can remove this condition by being attacked by a Demon Skeleton, as long as you have Cleanse activated on it. The following Status Conditions can be removed with Cleanse: * File:Poisoned Icon.gif Poisoned * File:Burning Icon.gif Burning * File:Electrified Icon.gif Electrified * File:Freezing Icon.gif Freezing * File:Cursed Icon.gif Cursed * File:Dazzled Icon.gif Dazzled * File:Bleed Icon.gif Bleeding * File:Slowed Icon.gif Slowed * File:Rooted Icon.gif Rooted * File:Feared Icon.gif Feared * File:Hexed Icon.png Hexed Please note that skill debuffs cannot be removed with Cleanse. It's often used by higher level players to remove a condition for which the character does not have a cleansing spell, allowing for faster removal of a Protection Zone Block by removing long duration burning effects such as Soulfire Runes, or even other debuffs like Paralysis. It is therefore common for PvP players to switch this charm onto a nearby creature while attempting to drop said effects, or simply to keep it active for one of the creatures found in recurring fighting areas places such as Roshamuul."
  },
  {
    "name": "Cripple",
    "type": "minor",
    "kind": "defesa",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Cripples the creature with a 6% / 9% / 12% chance and paralyses it for 10 seconds.",
    "notes": "This affects creatures even if they are immune to the Paralyse Rune. It is not affected by Charm Upgrade."
  },
  {
    "name": "Curse",
    "type": "major",
    "kind": "dano",
    "cost": [
      360,
      540,
      1800
    ],
    "effect": "Each attack on a creature has a 5% / 10% / 11% chance to trigger and deal 5% of its maximum Hit Points as Death Damage once.",
    "notes": "Damage is limited to 2 times the character's level (applied before resistances). Since the elemental damage charms are applied on top of the creature's elemental resistances, the Curse charm is recommended for creatures that are weak to Death Damage."
  },
  {
    "name": "Divine Wrath",
    "type": "major",
    "kind": "dano",
    "cost": [
      600,
      900,
      3000
    ],
    "effect": "Each attack on a creature has a 5% / 10% / 11% chance to trigger and deal 5% of its maximum Hit Points as Holy Damage once.",
    "notes": "Damage is limited to 2 times the character's level (applied before resistances). Since the elemental damage charms are applied on top of the creature's elemental resistances, the Divine Wrath charm is recommended for creatures that are weak to Holy Damage."
  },
  {
    "name": "Dodge",
    "type": "major",
    "kind": "defesa",
    "cost": [
      240,
      360,
      1200
    ],
    "effect": "Dodges an attack with a 5% / 10% / 11% chance, taking no damage at all.",
    "notes": "There are some important factors to take into account when choosing a creature to activate this charm on: * Overall damage taken during a hunt: When choosing a creature to bind this charm during a hunt, you should choose the one that deals most damage to you overall during the hunting session, which is not necessarily the strongest creature of the dungeon. For instance, even though Juggernauts and Hellhounds are the strongest creatures in the Roshamuul Prison, it would be better to use the charm in Demon Outcasts or Dark Torturers instead since they are present in a much higher number. * Protection from Equipment and Imbuements: It's also important to note what other protections the player already has. For example, if a lot of Fire Damage protection is being used, it may be more efficient to use the charm on a creature that deals high damage of another element, e.g. Life Drain. * Number of abilities used by the creature: Even though this may be quite hard to evaluate, it may be the decisive point when in doubt about 2 creatures. Since the Charm has a 10% chance of triggering for each attack received, the higher the number of attacks taken, the most efficient the charm will be. Of course, this is completely dependent on the strength of these attacks, but it's something to keep in mind."
  },
  {
    "name": "Enflame",
    "type": "major",
    "kind": "dano",
    "cost": [
      400,
      600,
      2000
    ],
    "effect": "Each attack on a creature has a 5% / 10% / 11% chance to trigger and deal 5% of its maximum Hit Points as Fire Damage once.",
    "notes": "Damage is limited to 2 times the character's level (applied before resistances). Since the elemental damage charms are applied on top of the creature's elemental resistances, the Enflame charm is recommended for creatures that are weak to Fire Damage."
  },
  {
    "name": "Fatal Hold",
    "type": "minor",
    "kind": "utilidade",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Your attacks have a 30% / 45% / 60% chance to prevent creatures from fleeing due to low health for 30 seconds.",
    "notes": ""
  },
  {
    "name": "Freeze",
    "type": "major",
    "kind": "dano",
    "cost": [
      320,
      480,
      1600
    ],
    "effect": "Each attack on a creature has a 5% / 10% / 11% chance to trigger and deal 5% of its maximum Hit Points as Ice Damage once.",
    "notes": "Damage is limited to 2 times the character's level (applied before resistances). Since the elemental damage charms are applied on top of the creature's elemental resistances, the Freeze charm is recommended for creatures that are weak to Ice Damage."
  },
  {
    "name": "Gut",
    "type": "minor",
    "kind": "utilidade",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Gutting the creature yields 6% / 9% / 12% more creature products.",
    "notes": "By activating this Charm on a creature, the chances of looting the Creature Products it drops are increased. In other words, there is 6% / 9% / 12% chance that an extra loot roll is generated for the creature products."
  },
  {
    "name": "Low Blow",
    "type": "major",
    "kind": "dano",
    "cost": [
      800,
      1200,
      4000
    ],
    "effect": "Adds 4% / 8% / 9% critical hit chance to attacks with critical hit weapons.",
    "notes": "If a critical hit is dealt due to this additional chance, every charm creature affected by the attack will receive critical damage."
  },
  {
    "name": "Numb",
    "type": "minor",
    "kind": "defesa",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Numbs the creature with a 6% / 9% / 12% chance after its attack and paralyses the creature for 10 seconds.",
    "notes": "This affects creatures even if they are immune to the Paralyse Rune."
  },
  {
    "name": "Overflux",
    "type": "major",
    "kind": "dano",
    "cost": [
      600,
      900,
      3000
    ],
    "effect": "Each attack has a 5% / 10% / 11% chance to deal Physical Damage equal to 2.5% of your maximum mana.",
    "notes": "Damage is limited up to 8% of the creature's maximum health. The damage dealt by this charm is displayed as Physical Damage, but it is neutral and will damage the creature regardless of its resistances."
  },
  {
    "name": "Overpower",
    "type": "major",
    "kind": "dano",
    "cost": [
      600,
      900,
      3000
    ],
    "effect": "Each attack has a 5% / 10% / 11% chance to deal Physical Damage equal to 5% of your maximum health.",
    "notes": "Damage is limited up to 8% of the creature's maximum health. The damage dealt by this charm is displayed as Physical Damage, but it is neutral and will damage the creature regardless of its resistances."
  },
  {
    "name": "Parry",
    "type": "major",
    "kind": "defesa",
    "cost": [
      400,
      600,
      2000
    ],
    "effect": "Any damage taken has a 5% / 10% / 11% chance to be reflected to the aggressor as Physical Damage.",
    "notes": "The damage dealt by this charm is displayed as Physical Damage, but it is neutral and will damage the creature regardless of its resistances. It will, however, be affected by the creature's armor. Furthermore, the damage value is the base damage calculated before the player's resistances, which means that the equipment and imbuements used by the character will not affect the damage taken by the creature. Parry is often unlocked by Knights since this vocation will inevitably take a lot of damage. It's also very useful for higher level Paladins that hunt blocking the creatures around themselves. It's not really recommended for Druids and Sorcerers since these players should try to avoid taking as much damage as possible and will benefit a lot more from the offensive elemental damage charms. Regardless of the vocation, however, parry is more effective on creatures that deal high damage but have relatively low health, which makes the elemental charms less effective on them."
  },
  {
    "name": "Poison",
    "type": "major",
    "kind": "dano",
    "cost": [
      240,
      360,
      1200
    ],
    "effect": "Each attack on a creature has a 5% / 10% / 11% chance to trigger and deal 5% of its maximum Hit Points as Earth Damage once.",
    "notes": "Damage is limited to 2 times the character's level (applied before resistances). Since the elemental damage charms are applied on top of the creature's elemental resistances, the Poison charm is recommended for creatures that are weak to Earth Damage."
  },
  {
    "name": "Savage Blow",
    "type": "major",
    "kind": "dano",
    "cost": [
      800,
      1200,
      4000
    ],
    "effect": "Adds 20% / 40% / 44% critical extra damage to attacks with Critical Hit weapons.",
    "notes": ""
  },
  {
    "name": "Scavenge",
    "type": "minor",
    "kind": "utilidade",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Enhances your chances to successfully skin/dust a skinnable/dustable creature by 60% / 90% / 120%.",
    "notes": "This charm improves the chance of having success when skinning or dusting corpses of the skinnable/dustable creature this charm is assigned to. For example, if the success chance is originally 5%, it becomes 8/9.5/11% after assigning the charm. Note that this charm is rather useful when attempting to skin the rare spawning Albino Dragon for its valuable Albino Dragon Leather. Also, if used for skinning Dragons, you can earn a decent profit if the Green Dragon Leathers are going for 4-5k each on your Server."
  },
  {
    "name": "Vampiric Embrace",
    "type": "minor",
    "kind": "utilidade",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Adds 1.6% / 2.4% / 3.2% Life Leech to attacks if wearing equipment that provides life leech.",
    "notes": ""
  },
  {
    "name": "Void Inversion",
    "type": "minor",
    "kind": "utilidade",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "20% / 30% /40% chance to gain mana instead of losing it when taking Mana Drain damage.",
    "notes": ""
  },
  {
    "name": "Void's Call",
    "type": "minor",
    "kind": "utilidade",
    "cost": [
      100,
      150,
      225
    ],
    "effect": "Adds 0.8% / 1.2% / 1.6% Mana Leech to attacks if wearing equipment that provides mana leech.",
    "notes": ""
  },
  {
    "name": "Wound",
    "type": "major",
    "kind": "dano",
    "cost": [
      240,
      360,
      1200
    ],
    "effect": "Each attack on a creature has a 5% / 10% / 11% chance to trigger and deal 5% of its maximum Hit Points as Physical Damage once.",
    "notes": "Damage is limited to 2 times the character's level (applied before resistances). Since the elemental damage charms are applied on top of the creature's elemental resistances, the Wound charm is recommended for creatures that are weak to Physical Damage."
  },
  {
    "name": "Zap",
    "type": "major",
    "kind": "dano",
    "cost": [
      320,
      480,
      1600
    ],
    "effect": "Each attack on a creature has a 5% / 10% / 11% chance to trigger and deal 5% of its maximum Hit Points as Energy Damage once.",
    "notes": "Damage is limited to 2 times the character's level (applied before resistances). Since the elemental damage charms are applied on top of the creature's elemental resistances, the Zap charm is recommended for creatures that are weak to Energy Damage."
  }
];
