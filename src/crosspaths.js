export const TOWER_CATEGORIES = [
  {
    name: "Primary",
    towers: ["Dart Monkey", "Boomerang Monkey", "Bomb Shooter", "Tack Shooter", "Ice Monkey", "Glue Gunner", "Desperado"],
  },
  {
    name: "Military",
    towers: ["Sniper Monkey", "Monkey Sub", "Monkey Buccaneer", "Monkey Ace", "Heli Pilot", "Mortar Monkey", "Dartling Gunner"],
  },
  {
    name: "Magic",
    towers: ["Wizard Monkey", "Super Monkey", "Ninja Monkey", "Alchemist", "Druid", "Mermonkey", "Skywarden"],
  },
  {
    name: "Support",
    towers: ["Banana Farm", "Spike Factory", "Monkey Village", "Engineer Monkey", "Beast Handler"],
  },
];

export const TOWERS = TOWER_CATEGORIES.flatMap((category) => category.towers);

export const LEGAL_CROSSPATHS = [];

for (let top = 0; top < 6; top++) {
  for (let middle = 0; middle < 6; middle++) {
    for (let bottom = 0; bottom < 6; bottom++) {
      const tiers = [top, middle, bottom];
      const pathsUsed = tiers.filter(tier => tier > 0).length;
      const tierFives = tiers.filter(tier => tier > 2).length;

      if (pathsUsed <= 2 && tierFives <= 1) {
        LEGAL_CROSSPATHS.push(tiers);
      }
    }
  }
}