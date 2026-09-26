// O que muda entre a arma comum e a versão melhorada (Grand Sanguine e Stellar Moonsilver).
// Os atributos-base (ataque, skill, ML, proteção) são os mesmos; a diferença está na árvore de proficiência.
// Fonte: TibiaWiki, Weapon Proficiency Tables (consulta em 26/09/2026). Textos dos perks como na wiki.

export interface UpgradeDiff {
  kind: string;
  base: string;
  top: string;
  diffs: { level: number; from: string; to: string }[];
}

export const WEAPON_UPGRADES: Record<string, UpgradeDiff[]> = {
 "sorcerer": [
  {
   "kind": "Wand",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+4% base damage for Energy Wave",
     "to": "+8% base damage for Energy Wave"
    },
    {
     "level": 3,
     "from": "+12.50% critical extra damage for Hell's Core",
     "to": "+25% critical extra damage for Hell's Core"
    },
    {
     "level": 4,
     "from": "+4% of your Magic Level as extra damage for your spells",
     "to": "+8% of your Magic Level as extra damage for your spells"
    },
    {
     "level": 4,
     "from": "+3% base damage for Hell's Core",
     "to": "+6% base damage for Hell's Core"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Wand",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+5% base damage for Great Fire Wave",
     "to": "+7.50% base damage for Great Fire Wave"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Death damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Death damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+5% base damage for Death Echo",
     "to": "+7.50% base damage for Death Echo"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  }
 ],
 "druid": [
  {
   "kind": "Rod",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+4% base damage for Terra Wave",
     "to": "+8% base damage for Terra Wave"
    },
    {
     "level": 3,
     "from": "+12.50% critical extra damage for Eternal Winter",
     "to": "+25% critical extra damage for Eternal Winter"
    },
    {
     "level": 4,
     "from": "+4% of your Magic Level as extra damage for your spells",
     "to": "+8% of your Magic Level as extra damage for your spells"
    },
    {
     "level": 4,
     "from": "+3% base damage for Eternal Winter",
     "to": "+6% base damage for Eternal Winter"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Rod",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+5% base damage for Strong Ice Wave",
     "to": "+7.50% base damage for Strong Ice Wave"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Ice damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Ice damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+5% base damage for Forked Thorns",
     "to": "+7.50% base damage for Forked Thorns"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  }
 ],
 "knight": [
  {
   "kind": "Espada de uma mão",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+10% critical extra damage for Fierce Berserk",
     "to": "+20% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Fierce Berserk",
     "to": "+40% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+4% base damage for Fierce Berserk",
     "to": "+8% base damage for Fierce Berserk"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Espada de uma mão",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+12% base damage for Groundshaker",
     "to": "+18% base damage for Groundshaker"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+5% base damage for Shield Slam",
     "to": "+7.50% base damage for Shield Slam"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  },
  {
   "kind": "Machado de uma mão",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+10% critical extra damage for Fierce Berserk",
     "to": "+20% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Fierce Berserk",
     "to": "+40% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+4% base damage for Fierce Berserk",
     "to": "+8% base damage for Fierce Berserk"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Machado de uma mão",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+12% base damage for Groundshaker",
     "to": "+18% base damage for Groundshaker"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+5% base damage for Shield Slam",
     "to": "+7.50% base damage for Shield Slam"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  },
  {
   "kind": "Clava de uma mão",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+10% critical extra damage for Fierce Berserk",
     "to": "+20% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Fierce Berserk",
     "to": "+40% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+4% base damage for Fierce Berserk",
     "to": "+8% base damage for Fierce Berserk"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Clava de uma mão",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+12% base damage for Groundshaker",
     "to": "+18% base damage for Groundshaker"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+5% base damage for Shield Slam",
     "to": "+7.50% base damage for Shield Slam"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  },
  {
   "kind": "Espada de duas mãos",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+2% mana leech for Fierce Berserk",
     "to": "+4% mana leech for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Fierce Berserk",
     "to": "+40% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+4% base damage for Fierce Berserk",
     "to": "+8% base damage for Fierce Berserk"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Espada de duas mãos",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+12% base damage for Groundshaker",
     "to": "+18% base damage for Groundshaker"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Fire damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Fire damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+1.50% critical hit chance for auto-attacks",
     "to": "+2.75% critical hit chance for auto-attacks"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  },
  {
   "kind": "Machado de duas mãos",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+2% mana leech for Fierce Berserk",
     "to": "+4% mana leech for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Fierce Berserk",
     "to": "+40% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+4% base damage for Fierce Berserk",
     "to": "+8% base damage for Fierce Berserk"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Machado de duas mãos",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+12% base damage for Groundshaker",
     "to": "+18% base damage for Groundshaker"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Energy damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Energy damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+1.50% critical hit chance for auto-attacks",
     "to": "+2.75% critical hit chance for auto-attacks"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  },
  {
   "kind": "Clava de duas mãos",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+2% mana leech for Fierce Berserk",
     "to": "+4% mana leech for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Fierce Berserk",
     "to": "+40% critical extra damage for Fierce Berserk"
    },
    {
     "level": 4,
     "from": "+4% base damage for Fierce Berserk",
     "to": "+8% base damage for Fierce Berserk"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Clava de duas mãos",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+12% base damage for Groundshaker",
     "to": "+18% base damage for Groundshaker"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Ice damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Ice damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+1.50% critical hit chance for auto-attacks",
     "to": "+2.75% critical hit chance for auto-attacks"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  }
 ],
 "paladin": [
  {
   "kind": "Bow",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+2% mana leech for Divine Caldera",
     "to": "+4% mana leech for Divine Caldera"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Divine Caldera",
     "to": "+40% critical extra damage for Divine Caldera"
    },
    {
     "level": 4,
     "from": "+4% base damage for Divine Caldera",
     "to": "+8% base damage for Divine Caldera"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Bow",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+4% base damage for Ethereal Barrage",
     "to": "+6% base damage for Ethereal Barrage"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Holy damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Holy damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+4% base damage for Divine Barrage",
     "to": "+6% base damage for Divine Barrage"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  },
  {
   "kind": "Crossbow",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+2% mana leech for Divine Caldera",
     "to": "+4% mana leech for Divine Caldera"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Divine Caldera",
     "to": "+40% critical extra damage for Divine Caldera"
    },
    {
     "level": 4,
     "from": "+4% base damage for Divine Caldera",
     "to": "+8% base damage for Divine Caldera"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Crossbow",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 3,
     "from": "+12% critical extra damage for Physical spells and runes",
     "to": "+18% critical extra damage for Physical spells and runes"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Holy damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Holy damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+10% critical extra damage for Holy spells and runes",
     "to": "+15% critical extra damage for Holy spells and runes"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  }
 ],
 "monk": [
  {
   "kind": "Arma de punho",
   "base": "Sanguine",
   "top": "Grand Sanguine",
   "diffs": [
    {
     "level": 3,
     "from": "+2% mana leech for Sweeping Takedown",
     "to": "+4% mana leech for Sweeping Takedown"
    },
    {
     "level": 4,
     "from": "+20% critical extra damage for Sweeping Takedown",
     "to": "+40% critical extra damage for Sweeping Takedown"
    },
    {
     "level": 4,
     "from": "+4% base damage for Sweeping Takedown",
     "to": "+8% base damage for Sweeping Takedown"
    },
    {
     "level": 7,
     "from": "+2% critical hit chance",
     "to": "+3% critical hit chance"
    }
   ]
  },
  {
   "kind": "Arma de punho",
   "base": "Moonsilver",
   "top": "Stellar Moonsilver",
   "diffs": [
    {
     "level": 1,
     "from": "+8% critical extra damage",
     "to": "+12% critical extra damage"
    },
    {
     "level": 3,
     "from": "+10% life leech for Thousand Fist Blows",
     "to": "+15% life leech for Thousand Fist Blows"
    },
    {
     "level": 3,
     "from": "Offensive spells have a 1% chance to fire a homing missile that deals Energy damage equal to 200% of your level",
     "to": "Offensive spells have a 1% chance to fire a homing missile that deals Energy damage equal to 300% of your level"
    },
    {
     "level": 3,
     "from": "+9% base damage for Thousand Fist Blows",
     "to": "+13.50% base damage for Thousand Fist Blows"
    },
    {
     "level": 7,
     "from": "+6% damage against targets below 30% hit points",
     "to": "+9% damage against targets below 30% hit points"
    }
   ]
  }
 ]
};
