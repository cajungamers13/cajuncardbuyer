/* =========================================================================
   TCG Trading Post — buy-offer calculator with a flexible CSV/Excel importer
   -------------------------------------------------------------------------
   Import philosophy: only THREE things are actually required to bring a
   spreadsheet in — a product/card name, a price, and a quantity. Everything
   else (set, rarity, condition, card number, notes, portfolio, ...) is
   optional "extra" per-line information that gets captured and shown in
   the item detail view when present, whether it came from a Collectr
   export, a TCGplayer export, or any other spreadsheet someone hands you.
   ========================================================================= */

/* ---------- built-in sample dataset (matches the sample vintage binder) ---------- */
const SAMPLE = [{"n":"Energy Retrieval","s":"Base Set (1st Edition & Shadowless)","d":"81","t":"Card","c":"Near Mint","v":"Uncommon • Shadowless","q":1,"p":0.99,"o":false},{"n":"Full Heal","s":"Base Set (1st Edition & Shadowless)","d":"82","t":"Card","c":"Near Mint","v":"Uncommon • Shadowless","q":1,"p":1.95,"o":false},{"n":"Gust of Wind","s":"Base Set (1st Edition & Shadowless)","d":"93","t":"Card","c":"Near Mint","v":"Common • Shadowless","q":3,"p":0.83,"o":false},{"n":"Potion","s":"Base Set (1st Edition & Shadowless)","d":"94","t":"Card","c":"Near Mint","v":"Common • Shadowless","q":3,"p":0.69,"o":false},{"n":"Professor Oak","s":"Base Set (1st Edition & Shadowless)","d":"88","t":"Card","c":"Near Mint","v":"Uncommon • Shadowless","q":2,"p":4.49,"o":false},{"n":"Sandshrew","s":"Base Set (1st Edition & Shadowless)","d":"62","t":"Card","c":"Near Mint","v":"Common • Shadowless","q":1,"p":3.35,"o":false},{"n":"Defender","s":"Base Set 2","d":"109","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":2,"p":0.51,"o":false},{"n":"Wigglytuff","s":"Base Set 2","d":"19","t":"Card","c":"Moderately Played","v":"Holo Rare • Holofoil","q":1,"p":17.69,"o":false},{"n":"Blastoise (JP)","s":"Base Set (Japanese)","d":"009","t":"Card","c":"Lightly Played","v":"Rare • Holofoil","q":1,"p":61.04,"o":false},{"n":"Abra","s":"Base Set (Unlimited)","d":"43","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.77,"o":false},{"n":"Alakazam","s":"Base Set (Unlimited)","d":"1","t":"Card","c":"Lightly Played","v":"Holo Rare • Holofoil","q":1,"p":58.96,"o":false},{"n":"Arcanine","s":"Base Set (Unlimited)","d":"23","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":3.93,"o":false},{"n":"Beedrill","s":"Base Set (Unlimited)","d":"17","t":"Card","c":"Moderately Played","v":"Rare • Normal","q":1,"p":4.6,"o":false},{"n":"Bulbasaur","s":"Base Set (Unlimited)","d":"44","t":"Card","c":"Near Mint","v":"Common • Normal","q":2,"p":4.55,"o":false},{"n":"Caterpie","s":"Base Set (Unlimited)","d":"45","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.3,"o":false},{"n":"Computer Search","s":"Base Set (Unlimited)","d":"71","t":"Card","c":"Near Mint","v":"Rare • Normal","q":1,"p":3.19,"o":false},{"n":"Dewgong","s":"Base Set (Unlimited)","d":"25","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":3.88,"o":false},{"n":"Diglett","s":"Base Set (Unlimited)","d":"47","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.22,"o":false},{"n":"Doduo","s":"Base Set (Unlimited)","d":"48","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.31,"o":false},{"n":"Drowzee","s":"Base Set (Unlimited)","d":"49","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.05,"o":false},{"n":"Dugtrio","s":"Base Set (Unlimited)","d":"19","t":"Card","c":"Near Mint","v":"Rare • Normal","q":1,"p":10.82,"o":false},{"n":"Farfetch'd","s":"Base Set (Unlimited)","d":"27","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":1.74,"o":false},{"n":"Gastly","s":"Base Set (Unlimited)","d":"50","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.62,"o":false},{"n":"Growlithe","s":"Base Set (Unlimited)","d":"28","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":1.6,"o":false},{"n":"Haunter","s":"Base Set (Unlimited)","d":"29","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":2.67,"o":false},{"n":"Imposter Professor Oak","s":"Base Set (Unlimited)","d":"73","t":"Card","c":"Near Mint","v":"Rare • Normal","q":1,"p":5.77,"o":false},{"n":"Ivysaur","s":"Base Set (Unlimited)","d":"30","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":7.85,"o":false},{"n":"Kadabra","s":"Base Set (Unlimited)","d":"32","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":2.57,"o":false},{"n":"Kakuna","s":"Base Set (Unlimited)","d":"33","t":"Card","c":"Damaged","v":"Uncommon • Normal","q":1,"p":0.76,"o":false},{"n":"Koffing","s":"Base Set (Unlimited)","d":"51","t":"Card","c":"Near Mint","v":"Common • Normal","q":3,"p":1.39,"o":false},{"n":"Machoke","s":"Base Set (Unlimited)","d":"34","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":0.94,"o":false},{"n":"Machop","s":"Base Set (Unlimited)","d":"52","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.64,"o":false},{"n":"Metapod","s":"Base Set (Unlimited)","d":"54","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.34,"o":false},{"n":"Nidoking","s":"Base Set (Unlimited)","d":"11","t":"Card","c":"Lightly Played","v":"Holo Rare • Holofoil","q":1,"p":33.69,"o":false},{"n":"Nidoran M","s":"Base Set (Unlimited)","d":"55","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.82,"o":false},{"n":"Nidorino","s":"Base Set (Unlimited)","d":"37","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":4.03,"o":false},{"n":"Ninetales","s":"Base Set (Unlimited)","d":"12","t":"Card","c":"Near Mint","v":"Holo Rare • Holofoil","q":1,"p":33.98,"o":false},{"n":"Pidgeotto","s":"Base Set (Unlimited)","d":"22","t":"Card","c":"Heavily Played","v":"Rare • Normal","q":1,"p":6.46,"o":false},{"n":"Pidgey","s":"Base Set (Unlimited)","d":"57","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.54,"o":false},{"n":"Poliwag","s":"Base Set (Unlimited)","d":"59","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.08,"o":false},{"n":"Poliwhirl","s":"Base Set (Unlimited)","d":"38","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":1.78,"o":false},{"n":"Ponyta","s":"Base Set (Unlimited)","d":"60","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.83,"o":false},{"n":"Raticate","s":"Base Set (Unlimited)","d":"40","t":"Card","c":"Heavily Played","v":"Uncommon • Normal","q":1,"p":1.59,"o":false},{"n":"Rattata","s":"Base Set (Unlimited)","d":"61","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.95,"o":false},{"n":"Revive","s":"Base Set (Unlimited)","d":"89","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":2.34,"o":false},{"n":"Seel","s":"Base Set (Unlimited)","d":"41","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":1.43,"o":false},{"n":"Squirtle","s":"Base Set (Unlimited)","d":"63","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":6.78,"o":false},{"n":"Starmie","s":"Base Set (Unlimited)","d":"64","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.83,"o":false},{"n":"Staryu","s":"Base Set (Unlimited)","d":"65","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.74,"o":false},{"n":"Super Potion","s":"Base Set (Unlimited)","d":"90","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":3,"p":0.48,"o":false},{"n":"Switch","s":"Base Set (Unlimited)","d":"95","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.5,"o":false},{"n":"Voltorb","s":"Base Set (Unlimited)","d":"67","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":4.17,"o":false},{"n":"Vulpix","s":"Base Set (Unlimited)","d":"68","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.89,"o":false},{"n":"Wartortle","s":"Base Set (Unlimited)","d":"42","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":2,"p":5.01,"o":false},{"n":"Weedle","s":"Base Set (Unlimited)","d":"69","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.76,"o":false},{"n":"Machamp","s":"Deck Exclusives","d":"008/102","t":"Card","c":"Near Mint","v":"Holo Rare • 1st Edition Holofoil","q":1,"p":24.5,"o":false},{"n":"Team Aqua's Kyogre (EX Team Magma vs Team Aqua)","s":"Deck Exclusives","d":"003/095","t":"Card","c":"Lightly Played","v":"Rare • Normal","q":2,"p":9.96,"o":false},{"n":"Staravia","s":"Diamond and Pearl","d":"64","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":0.44,"o":false},{"n":"Flygon (15)","s":"EX Dragon","d":"15","t":"Card","c":"Near Mint","v":"Rare • Normal","q":1,"p":1.76,"o":false},{"n":"Flygon (15)","s":"EX Dragon","d":"15","t":"Card","c":"Near Mint","v":"Rare • Reverse Holofoil","q":1,"p":21.37,"o":false},{"n":"Grimer","s":"EX Dragon","d":"57","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":2.46,"o":false},{"n":"Magnemite (61)","s":"EX Dragon","d":"61","t":"Card","c":"Near Mint","v":"Common • Normal","q":2,"p":1.08,"o":false},{"n":"Magneton (35)","s":"EX Dragon","d":"35","t":"Card","c":"Moderately Played","v":"Uncommon • Reverse Holofoil","q":1,"p":21.4,"o":false},{"n":"Magneton (35)","s":"EX Dragon","d":"35","t":"Card","c":"Near Mint","v":"Uncommon • Reverse Holofoil","q":1,"p":28.53,"o":false},{"n":"Numel (69)","s":"EX Dragon","d":"69","t":"Card","c":"Near Mint","v":"Common • Reverse Holofoil","q":1,"p":12.22,"o":false},{"n":"Marshtomp","s":"EX Emerald","d":"36","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":1.63,"o":false},{"n":"Dark Celebi","s":"EX Hidden Legends","d":"4","t":"Card","c":"Lightly Played","v":"Holo Rare • Holofoil","q":1,"p":65.43,"o":false},{"n":"Clefable (41)","s":"Expedition","d":"41","t":"Card","c":"Near Mint","v":"Rare • Normal","q":1,"p":9.69,"o":false},{"n":"Koffing","s":"Expedition","d":"114","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":5.31,"o":false},{"n":"Meowth","s":"Expedition","d":"121","t":"Card","c":"Damaged","v":"Common • Normal","q":1,"p":2.37,"o":false},{"n":"Potion","s":"EX Ruby & Sapphire","d":"91","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.3,"o":false},{"n":"Team Aqua Ball","s":"EX Team Magma vs Team Aqua","d":"75","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":0.98,"o":false},{"n":"Team Aqua's Sealeo (31)","s":"EX Team Magma vs Team Aqua","d":"31","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":2,"p":0.88,"o":false},{"n":"Team Aqua's Spheal (56)","s":"EX Team Magma vs Team Aqua","d":"56","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.54,"o":false},{"n":"Team Aqua's Walrein","s":"EX Team Magma vs Team Aqua","d":"6","t":"Card","c":"Heavily Played","v":"Holo Rare • Holofoil","q":1,"p":6.37,"o":false},{"n":"Team Magma's Rhyhorn (68)","s":"EX Team Magma vs Team Aqua","d":"68","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.61,"o":false},{"n":"Dark Ariados","s":"EX Team Rocket Returns","d":"30","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":3.31,"o":false},{"n":"Dark Tyranitar (20)","s":"EX Team Rocket Returns","d":"20","t":"Card","c":"Near Mint","v":"Rare • Normal","q":1,"p":21.66,"o":false},{"n":"Aerodactyl (16)","s":"Fossil","d":"16","t":"Card","c":"Near Mint","v":"Rare • Unlimited","q":1,"p":10.2,"o":false},{"n":"Arbok","s":"Fossil","d":"31","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":2,"p":1.51,"o":false},{"n":"Cloyster","s":"Fossil","d":"32","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.48,"o":false},{"n":"Ekans","s":"Fossil","d":"46","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":2,"p":0.51,"o":false},{"n":"Energy Search","s":"Fossil","d":"59","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.31,"o":false},{"n":"Gambler","s":"Fossil","d":"60","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.36,"o":false},{"n":"Gastly","s":"Fossil","d":"33","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.49,"o":false},{"n":"Gengar (20)","s":"Fossil","d":"20","t":"Card","c":"Lightly Played","v":"Rare • Unlimited","q":1,"p":35.42,"o":false},{"n":"Geodude","s":"Fossil","d":"47","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":4,"p":0.55,"o":false},{"n":"Golbat","s":"Fossil","d":"34","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":0.73,"o":false},{"n":"Golduck","s":"Fossil","d":"35","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.35,"o":false},{"n":"Golem","s":"Fossil","d":"36","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.68,"o":false},{"n":"Graveler","s":"Fossil","d":"37","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":2,"p":0.96,"o":false},{"n":"Grimer","s":"Fossil","d":"48","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":2,"p":0.53,"o":false},{"n":"Haunter (21)","s":"Fossil","d":"21","t":"Card","c":"Near Mint","v":"Rare • Unlimited","q":1,"p":11.23,"o":false},{"n":"Horsea","s":"Fossil","d":"49","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":2,"p":0.49,"o":false},{"n":"Kabuto","s":"Fossil","d":"50","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":2.08,"o":false},{"n":"Kabutops (24)","s":"Fossil","d":"24","t":"Card","c":"Near Mint","v":"Rare • Unlimited","q":1,"p":7.02,"o":false},{"n":"Kingler","s":"Fossil","d":"38","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":0.87,"o":false},{"n":"Mr. Fuji","s":"Fossil","d":"58","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":2,"p":1.07,"o":false},{"n":"Muk (13)","s":"Fossil","d":"13","t":"Card","c":"Near Mint","v":"Holo Rare • Unlimited Holofoil","q":1,"p":10.44,"o":false},{"n":"Mysterious Fossil","s":"Fossil","d":"62","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.36,"o":false},{"n":"Omanyte","s":"Fossil","d":"52","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":1.09,"o":false},{"n":"Omastar","s":"Fossil","d":"40","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.33,"o":false},{"n":"Psyduck","s":"Fossil","d":"53","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":2.32,"o":false},{"n":"Recycle","s":"Fossil","d":"61","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.33,"o":false},{"n":"Sandslash","s":"Fossil","d":"41","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.13,"o":false},{"n":"Shellder","s":"Fossil","d":"54","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.47,"o":false},{"n":"Slowbro","s":"Fossil","d":"43","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.74,"o":false},{"n":"Slowpoke","s":"Fossil","d":"55","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":1.0,"o":false},{"n":"Tentacool","s":"Fossil","d":"56","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":3,"p":0.5,"o":false},{"n":"Tentacruel","s":"Fossil","d":"44","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.23,"o":false},{"n":"Weezing","s":"Fossil","d":"45","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.96,"o":false},{"n":"Zubat","s":"Fossil","d":"57","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":2,"p":0.52,"o":false},{"n":"Koga's Weezing","s":"Gym Challenge","d":"50","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":2.03,"o":false},{"n":"Misty's Horsea","s":"Gym Challenge","d":"87","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":1.59,"o":false},{"n":"Rocket's Zapdos","s":"Gym Challenge","d":"15","t":"Card","c":"Damaged","v":"Holo Rare • Unlimited Holofoil","q":1,"p":50.0,"o":true},{"n":"Giovanni's Nidorana (JP)","s":"Gym Challenge (Japanese)","d":"032","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":2.99,"o":false},{"n":"Giovanni's Nidoran F (JP)","s":"Gym Challenge (Japanese)","d":"029","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":2.09,"o":false},{"n":"Misty's Poliwrath (JP)","s":"Gym Challenge (Japanese)","d":"062","t":"Card","c":"Lightly Played","v":"Rare • Normal","q":1,"p":6.8,"o":false},{"n":"Butterfree","s":"Jungle","d":"33","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":2,"p":1.8,"o":false},{"n":"Clefable","s":"Jungle","d":"17","t":"Card","c":"Near Mint","v":"Rare • Unlimited","q":1,"p":8.59,"o":false},{"n":"Cubone","s":"Jungle","d":"50","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":2.15,"o":false},{"n":"Dodrio","s":"Jungle","d":"34","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.54,"o":false},{"n":"Eevee","s":"Jungle","d":"51","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":2.48,"o":false},{"n":"Exeggcute","s":"Jungle","d":"52","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":3,"p":0.47,"o":false},{"n":"Exeggutor","s":"Jungle","d":"35","t":"Card","c":"Near Mint","v":"Uncommon • 1st Edition","q":1,"p":7.92,"o":false},{"n":"Fearow","s":"Jungle","d":"36","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.07,"o":false},{"n":"Flareon","s":"Jungle","d":"3","t":"Card","c":"Near Mint","v":"Holo Rare • Unlimited Holofoil","q":1,"p":96.04,"o":false},{"n":"Gloom","s":"Jungle","d":"37","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":0.79,"o":false},{"n":"Goldeen","s":"Jungle","d":"53","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.53,"o":false},{"n":"Jigglypuff","s":"Jungle","d":"54","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":1.34,"o":false},{"n":"Lickitung","s":"Jungle","d":"38","t":"Card","c":"Near Mint","v":"Uncommon • 1st Edition","q":1,"p":8.87,"o":false},{"n":"Lickitung","s":"Jungle","d":"38","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.6,"o":false},{"n":"Mankey","s":"Jungle","d":"55","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.47,"o":false},{"n":"Mankey","s":"Jungle","d":"55","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":1.99,"o":false},{"n":"Marowak","s":"Jungle","d":"39","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":2.89,"o":false},{"n":"Meowth","s":"Jungle","d":"56","t":"Card","c":"Heavily Played","v":"Common • 1st Edition","q":1,"p":3.16,"o":false},{"n":"Meowth","s":"Jungle","d":"56","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.94,"o":false},{"n":"Nidoran F","s":"Jungle","d":"57","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.39,"o":false},{"n":"Paras","s":"Jungle","d":"59","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":2.12,"o":false},{"n":"Parasect","s":"Jungle","d":"41","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.13,"o":false},{"n":"Persian","s":"Jungle","d":"42","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":0.88,"o":false},{"n":"Pidgeot","s":"Jungle","d":"24","t":"Card","c":"Near Mint","v":"Rare • Unlimited","q":1,"p":7.95,"o":false},{"n":"Pinsir","s":"Jungle","d":"25","t":"Card","c":"Near Mint","v":"Rare • Unlimited","q":1,"p":5.28,"o":false},{"n":"Primeape","s":"Jungle","d":"43","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.48,"o":false},{"n":"Rhydon","s":"Jungle","d":"45","t":"Card","c":"Heavily Played","v":"Uncommon • 1st Edition","q":1,"p":7.35,"o":false},{"n":"Rhyhorn","s":"Jungle","d":"61","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.44,"o":false},{"n":"Seaking","s":"Jungle","d":"46","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.52,"o":false},{"n":"Spearow","s":"Jungle","d":"62","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.49,"o":false},{"n":"Tauros","s":"Jungle","d":"47","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.2,"o":false},{"n":"Venonat","s":"Jungle","d":"63","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":2.14,"o":false},{"n":"Venonat","s":"Jungle","d":"63","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.44,"o":false},{"n":"Vileplume","s":"Jungle","d":"15","t":"Card","c":"Near Mint","v":"Holo Rare • Unlimited Holofoil","q":1,"p":37.9,"o":false},{"n":"Vileplume","s":"Jungle","d":"31","t":"Card","c":"Near Mint","v":"Rare • Unlimited","q":1,"p":7.4,"o":false},{"n":"Wigglytuff","s":"Jungle","d":"16","t":"Card","c":"Moderately Played","v":"Holo Rare • Unlimited Holofoil","q":1,"p":31.99,"o":false},{"n":"Dratini","s":"Legendary Collection","d":"72","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":1.1,"o":false},{"n":"Potion","s":"Legendary Collection","d":"110","t":"Card","c":"Near Mint","v":"Common • Normal","q":1,"p":0.31,"o":false},{"n":"Potion Energy","s":"Legendary Collection","d":"101","t":"Card","c":"Near Mint","v":"Uncommon • Normal","q":1,"p":0.92,"o":false},{"n":"Chansey","s":"Neo Destiny","d":"31","t":"Card","c":"Lightly Played","v":"Uncommon • Unlimited","q":1,"p":27.41,"o":false},{"n":"Eevee","s":"Neo Discovery","d":"38","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":8.97,"o":false},{"n":"Kabuto","s":"Neo Discovery","d":"56","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":2.69,"o":false},{"n":"Poliwrath (JP)","s":"Neo Discovery (Japanese)","d":"062","t":"Card","c":"Heavily Played","v":"Rare • Holofoil","q":1,"p":15.0,"o":false},{"n":"Croconaw (32)","s":"Neo Genesis","d":"32","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.85,"o":false},{"n":"Geodude","s":"Neo Revelation","d":"44","t":"Card","c":"Near Mint","v":"Common • Unlimited","q":1,"p":0.55,"o":false},{"n":"Graveler","s":"Neo Revelation","d":"30","t":"Card","c":"Near Mint","v":"Uncommon • Unlimited","q":1,"p":1.4,"o":false},{"n":"Mew","s":"POP Series 4","d":"4","t":"Card","c":"Near Mint","v":"Rare • Holofoil","q":1,"p":65.0,"o":true},{"n":"Dark Blastoise (20)","s":"Team Rocket","d":"20","t":"Card","c":"Near Mint","v":"Rare • 1st Edition","q":1,"p":71.49,"o":false},{"n":"Eevee","s":"Team Rocket","d":"55","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":7.53,"o":false},{"n":"Goop Gas Attack","s":"Team Rocket","d":"78","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":1.15,"o":false},{"n":"Imposter Oak's Revenge","s":"Team Rocket","d":"76","t":"Card","c":"Near Mint","v":"Uncommon • 1st Edition","q":1,"p":16.19,"o":false},{"n":"Koffing","s":"Team Rocket","d":"58","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":2.02,"o":false},{"n":"Meowth","s":"Team Rocket","d":"62","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":4.18,"o":false},{"n":"Oddish","s":"Team Rocket","d":"63","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":3.58,"o":false},{"n":"Porygon","s":"Team Rocket","d":"48","t":"Card","c":"Near Mint","v":"Uncommon • 1st Edition","q":1,"p":5.18,"o":false},{"n":"Rattata","s":"Team Rocket","d":"66","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":1.57,"o":false},{"n":"Zubat","s":"Team Rocket","d":"70","t":"Card","c":"Near Mint","v":"Common • 1st Edition","q":1,"p":2.13,"o":false},{"n":"Mew ex (Tom Roos)","s":"World Championship Decks","d":"88/92","t":"Card","c":"Moderately Played","v":"Rare • Normal","q":1,"p":11.33,"o":false},{"n":"Ho-oh","s":"WoTC Promo","d":"52/53","t":"Card","c":"Heavily Played","v":"Promo • Normal","q":1,"p":27.43,"o":false}];
const SAMPLE_META = {title:"vintage binder",
  source:"Built-in sample · Collectr prices as of 2026-09-10. Import a file to load a different collection.",
  dbTitle:"Sample collection", dbSub:"vintage binder · 177 cards · built in"};
const DEFAULT_TIERS = [{start:0,pct:40},{start:25,pct:50},{start:50,pct:60},{start:100,pct:70}];
const TIER_COLORS = ["var(--t1)","var(--t2)","var(--t3)","var(--t4)","var(--t5)","#4f7fae","#3f9e70","#c98f3f","#c2593f","#8f8577"];

// Stamps each item with its as-loaded price (origP) and import-override flag (origO)
// so a manual price edit in the UI can later be reset back to what was imported.
function withOrigin(items){
  return items.map(it => ({...it, origP: it.p, origO: !!it.o}));
}

let ITEMS = withOrigin(SAMPLE);
let META = SAMPLE_META;
let isSample = true;
let tiers = DEFAULT_TIERS.map(t=>({...t}));
let filter = "all", sortKey = "mkt", query = "";
const openItems = new Set();

/* ---------- local persistence (so an installed/offline app keeps its data) ---------- */
const STORAGE_KEY = "tcgTradingPost.v1";
function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({items:ITEMS, meta:META, isSample, tiers}));
  }catch(e){ /* storage unavailable (private mode, quota) — app still works in-memory */ }
}
function loadSavedState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    const data = JSON.parse(raw);
    if(!data || !Array.isArray(data.items) || !data.items.length) return null;
    return data;
  }catch(e){ return null; }
}

/* =========================================================================
   Card images — looked up on demand (when a line is opened, not eagerly for
   the whole list) from the Pokémon TCG API (api.pokemontcg.io), a public
   database built for exactly this: matching a card by name/set/number and
   handing back a URL to its own hosted artwork. We only ever store the URL
   and point an <img> at it — no card art is generated or bundled here.
   Results are cached (in memory + localStorage) so re-opening a line, or
   reloading the app, doesn't re-query. Only attempted for Pokémon cards.
   ========================================================================= */
const IMG_CACHE_KEY = "tcgTradingPost.imgCache.v1";
let imgCache = {};
try{ imgCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}") || {}; }catch(e){ imgCache = {}; }
function saveImgCache(){ try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imgCache)); }catch(e){} }

const stripAnnotation = s => (s||"").replace(/\s*\([^)]*\)\s*$/,"").trim();
function imgCacheKey(it){
  return [stripAnnotation(it.n), stripAnnotation(it.s), it.d||""].join("|").toLowerCase();
}
function isPokemonItem(it){
  return !it.game || /pok[eé]mon/i.test(it.game);
}
const cleanNum = s => (s||"").split("/")[0].replace(/^0+(?=\d)/,"").trim();
// Never guess. A same-named card turns up constantly across unrelated sets
// and printings, so this only ever returns a card when it's actually
// pinned down: an exact number match when we have a number to check, or —
// with no number to go on — a name+set query that came back with exactly
// one image-bearing candidate. Anything less certain returns null rather
// than showing whichever result happened to come back first.
function pickCardImage(cards, it){
  if(!cards || !cards.length) return null;
  const withImage = c => c.images && (c.images.large || c.images.small);
  const wantNum = cleanNum(it.d);
  if(wantNum){
    const match = cards.find(c => cleanNum(c.number)===wantNum && withImage(c));
    return match ? (match.images.large || match.images.small) : null;
  }
  const withImg = cards.filter(withImage);
  return withImg.length===1 ? (withImg[0].images.large || withImg[0].images.small) : null;
}
// Queries the Pokémon TCG API for one card, matching on name + set + number
// together. Tries the tightest query first (all three, straight from the
// source); only widens to name+set if that comes back empty, since the
// API's number formatting doesn't always match ours (leading zeros, promo
// prefixes) — pickCardImage still enforces an exact number match against
// whatever the wider query returns, so widening the search never widens
// what gets accepted.
// Returns: a URL string (found) · null (confirmed no match, cached) ·
// undefined (network/CORS/rate-limit failure — NOT cached, so the next
// time the line is opened it tries again instead of being stuck "checked").
async function lookupCardImage(it){
  const key = imgCacheKey(it);
  if(Object.prototype.hasOwnProperty.call(imgCache, key)) return imgCache[key];
  const name = stripAnnotation(it.n).replace(/"/g,"");
  if(!name) return null;
  const set = stripAnnotation(it.s).replace(/"/g,"");
  const num = cleanNum(it.d).replace(/"/g,"");

  const runQuery = async (parts) => {
    const res = await fetch("https://api.pokemontcg.io/v2/cards?q="+encodeURIComponent(parts.join(" "))+"&pageSize=25");
    return res.ok ? (await res.json()).data : undefined;
  };

  let result; // stays undefined on failure; see return-type note above
  try{
    const base = [`name:"${name}"`];
    if(set) base.push(`set.name:"${set}"`);
    if(num){
      const tight = await runQuery([...base, `number:"${num}"`]);
      if(tight !== undefined) result = pickCardImage(tight, it);
    }
    if(result == null){ // no number to search with, or the tight query found nothing
      const broader = await runQuery(base);
      if(broader !== undefined) result = pickCardImage(broader, it);
    }
  }catch(e){ /* offline/CORS/rate-limited — leave undefined, retry on next open */ }
  if(result !== undefined){ imgCache[key] = result; saveImgCache(); }
  return result;
}
// Images — lookup, manual link, and display — are a Card-only feature.
// The card database only knows individual cards, so it was never going to
// match a Sealed/Item row like "Jungle Booster Box" anyway; rather than
// leave a dead-end "no photo, paste one" prompt on every non-card line,
// those rows skip the whole feature and show no image section at all.
function canAutoLookup(it){ return isPokemonItem(it); }
function maybeFetchCardImage(idx){
  const it = ITEMS[idx];
  if(!it || it.t!=="Card" || it.photo || it._imgUrl || it._imgLoading || it._imgChecked) return;
  if(!canAutoLookup(it)){ it._imgChecked = true; renderList(); return; }
  it._imgLoading = true;
  renderList();
  lookupCardImage(it).then(result=>{
    it._imgLoading = false;
    if(result !== undefined){ it._imgChecked = true; it._imgUrl = result; } // else: leave unchecked, retry next open
    renderList();
  });
}
// A viewer can attach their own image link for anything the lookup can't
// cover (sealed product, or a single the database missed) — same "manual
// override" spirit as the price field above.
function commitPhotoUrl(idx, raw){
  const it = ITEMS[idx]; if(!it) return;
  const url = (raw||"").trim();
  if(!/^https?:\/\//i.test(url)) return; // silently ignore anything that isn't a URL
  it.photo = url; it.userPhoto = true; it._imgChecked = true;
  refreshAll();
}
function removePhoto(idx){
  const it = ITEMS[idx]; if(!it) return;
  it.photo = ""; it.userPhoto = false;
  refreshAll();
}
window.handleCardImgError = function(idx){
  const it = ITEMS[idx]; if(!it) return;
  it.photo = ""; it._imgUrl = null; it.userPhoto = false;
  refreshAll(); // persist the cleared state too, so a dead link doesn't keep resurfacing
};

const $ = s=>document.querySelector(s);
const money = n => "$" + (n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const money0 = n => "$" + Math.round(n||0).toLocaleString("en-US");
const esc = s => (s+"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const numClean = s => { const v=parseFloat((s||"").toString().replace(/[^0-9.\-]/g,"")); return Number.isFinite(v)?v:0; };
const titleCase = s => (s||"").replace(/\b\w/g, c=>c.toUpperCase());

/* =========================================================================
   CSV parsing (delimiter auto-detect: comma / semicolon / tab)
   ========================================================================= */
function detectDelimiter(text){
  const firstLine = text.split(/\r\n|\r|\n/).find(l=>l.trim().length>0) || "";
  const counts = { ",": (firstLine.match(/,/g)||[]).length, ";": (firstLine.match(/;/g)||[]).length, "\t": (firstLine.match(/\t/g)||[]).length };
  let best=",", bestN=counts[","];
  for(const d of [";","\t"]){ if(counts[d]>bestN){ best=d; bestN=counts[d]; } }
  return best;
}
function parseCSV(text, delim){
  text = (text||"").replace(/^﻿/,"");
  delim = delim || detectDelimiter(text);
  const rows=[]; let field="", row=[], inQ=false, i=0;
  while(i<text.length){
    const ch=text[i];
    if(inQ){
      if(ch==='"'){ if(text[i+1]==='"'){field+='"'; i+=2; continue;} inQ=false; i++; continue; }
      field+=ch; i++; continue;
    }
    if(ch==='"'){ inQ=true; i++; continue; }
    if(ch===delim){ row.push(field); field=""; i++; continue; }
    if(ch==='\r'){ i++; continue; }
    if(ch==='\n'){ row.push(field); rows.push(row); row=[]; field=""; i++; continue; }
    field+=ch; i++;
  }
  if(field.length||row.length){ row.push(field); rows.push(row); }
  return rows.filter(r=>r.length>1 || (r.length===1 && (r[0]||"").trim()!==""));
}

/* =========================================================================
   Generic column resolution — recognizes Collectr + TCGplayer headers
   (and common synonyms) but only ever REQUIRES name + a price + quantity.
   ========================================================================= */
const ALIAS = {
  name:        ["product name","card name","item name","name","title"],
  qtyPrimary:  ["total quantity","quantity","qty"],
  qtySecondary:["add to quantity","count","units"],
  priceRest:   ["tcg market price","tcg marketplace price","tcg low price with shipping","tcg low price","tcg direct low","sale price","unit price","price","list price","market value"],
  pricePaid:   ["average cost paid","cost paid","price paid","paid","purchase price","acquisition cost","cost"],
  game:        ["category","game","tcg","product line"],
  set:         ["set","set name","edition","expansion"],
  number:      ["card number","number","card #","#","collector number"],
  rarity:      ["rarity"],
  variant:     ["variance","printing","variant","finish"],
  grade:       ["grade"],
  condition:   ["card condition","condition"],
  type:        ["product type","item type","type"],
  notes:       ["notes","note","comment","comments"],
  date:        ["date added","date","added"],
  watchlist:   ["watchlist"],
  portfolio:   ["portfolio name","portfolio","binder","collection name"],
  photo:       ["photo url","image url","image","photo"]
};
const ALL_ALIAS_TOKENS = new Set(Object.values(ALIAS).flat());

function normHeader(h){ return (h==null?"":String(h)).trim(); }

function findHeaderRow(rows){
  let bestIdx=0, bestScore=-1;
  const scanMax = Math.min(rows.length, 5);
  for(let r=0;r<scanMax;r++){
    const cells = (rows[r]||[]).map(c=>normHeader(c).toLowerCase());
    const score = cells.filter(c=>ALL_ALIAS_TOKENS.has(c)).length;
    if(score>bestScore){ bestScore=score; bestIdx=r; }
  }
  return bestScore>0 ? bestIdx : 0;
}

function resolveColumns(headRow){
  const headers = headRow.map(normHeader);
  const hl = headers.map(h=>h.toLowerCase());
  const consumed = new Set();
  const takeExact = (list)=>{ for(const k of list){ const i=hl.indexOf(k); if(i>=0 && !consumed.has(i)){ consumed.add(i); return i; } } return -1; };
  const takePrefix = (p)=>{ const i=hl.findIndex((h,idx)=>h.startsWith(p) && !consumed.has(idx)); if(i>=0) consumed.add(i); return i; };

  // name: exact aliases, then a cautious substring fallback
  let nameIdx = takeExact(ALIAS.name);
  if(nameIdx<0){
    const i = hl.findIndex((h,idx)=>!consumed.has(idx) && /name/.test(h) && !/set|portfolio|file/.test(h));
    if(i>=0){ consumed.add(i); nameIdx=i; }
  }

  // price cascade: "Price Override" first (manual), then any "Market Price*" column,
  // then the rest of the recognized price-ish headers, in priority order.
  const priceCols=[];
  let i = takeExact(["price override"]); if(i>=0) priceCols.push({idx:i,label:headers[i],manual:true});
  i = takePrefix("market price"); if(i>=0) priceCols.push({idx:i,label:headers[i],manual:false});
  for(const k of ALIAS.priceRest){ i=takeExact([k]); if(i>=0) priceCols.push({idx:i,label:headers[i],manual:false}); }

  // cost/"paid" columns — captured separately for display, and used as a last-resort
  // value source only when the sheet has no market-ish price column at all.
  const paidCols=[];
  for(const k of ALIAS.pricePaid){ i=takeExact([k]); if(i>=0) paidCols.push({idx:i,label:headers[i]}); }

  const qtyPrimaryIdx = takeExact(ALIAS.qtyPrimary);
  const qtySecondaryIdx = takeExact(ALIAS.qtySecondary);

  const gameIdx = takeExact(ALIAS.game);
  const setIdx = takeExact(ALIAS.set);
  const numberIdx = takeExact(ALIAS.number);
  const rarityIdx = takeExact(ALIAS.rarity);
  const variantIdx = takeExact(ALIAS.variant);
  const gradeIdx = takeExact(ALIAS.grade);
  const conditionIdx = takeExact(ALIAS.condition);
  const typeIdx = takeExact(ALIAS.type);
  const notesIdx = takeExact(ALIAS.notes);
  const dateIdx = takeExact(ALIAS.date);
  const watchlistIdx = takeExact(ALIAS.watchlist);
  const portfolioIdx = takeExact(ALIAS.portfolio);
  const photoIdx = takeExact(ALIAS.photo);

  return {headers, nameIdx, priceCols, paidCols, qtyPrimaryIdx, qtySecondaryIdx,
    gameIdx, setIdx, numberIdx, rarityIdx, variantIdx, gradeIdx, conditionIdx, typeIdx,
    notesIdx, dateIdx, watchlistIdx, portfolioIdx, photoIdx, consumed};
}

function guessFormat(headers){
  const hl = headers.map(h=>h.toLowerCase());
  const has = k=>hl.includes(k);
  const pre = p=>hl.some(h=>h.startsWith(p));
  if(has("card condition") || has("price override") || pre("market price")) return "Collectr";
  if(has("tcgplayer id") || (has("product line") && has("printing"))) return "TCGplayer";
  return "Custom";
}

const SEALED_RE = /\b(booster|box|case|pack|bundle|tin|display|blister|etb|elite trainer|carton)\b/i;

function mapGenericRows(headRow, dataRows){
  const cm = resolveColumns(headRow);
  if(cm.nameIdx<0) throw new Error('Couldn\'t find a product/card name column. Add a column named "Product Name" (or "Name") and try again.');
  if(!cm.priceCols.length && !cm.paidCols.length) throw new Error('Couldn\'t find a price column. Add a column such as "Price", "Market Price", or "TCG Market Price" and try again.');

  const get = (row,i)=> (i>=0 && i<row.length && row[i]!=null) ? String(row[i]).trim() : "";
  const items=[]; const ports=new Set();
  let qtyDefaults=0, skippedNoName=0;

  for(const row of dataRows){
    if(!row || row.every(c=>c==null || String(c).trim()==="")) continue;
    const name = get(row, cm.nameIdx);
    if(!name){ skippedNoName++; continue; }

    let price=0, manual=false;
    for(const pc of cm.priceCols){ const v=numClean(get(row,pc.idx)); if(v>0){ price=v; manual=pc.manual; break; } }
    if(!(price>0) && cm.paidCols.length){
      for(const pc of cm.paidCols){ const v=numClean(get(row,pc.idx)); if(v>0){ price=v; break; } }
    }

    let paid=null;
    for(const pc of cm.paidCols){ const raw=get(row,pc.idx); if(raw!==""){ paid=numClean(raw); break; } }

    let qty = numClean(get(row,cm.qtyPrimaryIdx));
    if(!(qty>0)) qty = numClean(get(row,cm.qtySecondaryIdx));
    if(!(qty>0)){ qty=1; qtyDefaults++; }

    const set = get(row,cm.setIdx);
    const game = get(row,cm.gameIdx);
    const number = get(row,cm.numberIdx);
    const rarity = get(row,cm.rarityIdx);
    const variantRaw = get(row,cm.variantIdx);
    const grade = get(row,cm.gradeIdx);
    const condRaw = get(row,cm.conditionIdx);
    const condition = (grade && !/^(ungraded|raw|none)?$/i.test(grade)) ? grade : condRaw;
    const variant = [rarity, variantRaw].filter(Boolean).join(" • ");
    const notes = get(row,cm.notesIdx);
    const date = get(row,cm.dateIdx);
    const watchlistRaw = get(row,cm.watchlistIdx);
    const photo = get(row,cm.photoIdx);
    const portfolio = get(row,cm.portfolioIdx);
    if(portfolio) ports.add(portfolio);

    let typeVal = get(row,cm.typeIdx);
    if(!typeVal){
      const hay = (name+" "+set+" "+game).toLowerCase();
      if(SEALED_RE.test(hay)) typeVal="Sealed";
      else if(number || rarity) typeVal="Card";
      else typeVal="Item";
    } else {
      typeVal = titleCase(typeVal);
    }

    const extra=[];
    row.forEach((cell,idx)=>{
      if(cm.consumed.has(idx)) return;
      const v = cell==null ? "" : String(cell).trim();
      if(!v) return;
      extra.push({label: cm.headers[idx] || ("Column "+(idx+1)), value:v});
    });

    items.push({
      n:name, s:set, game, d:number, t:typeVal, c:condition, v:variant,
      q:Math.max(0,Math.round(qty)), p:Math.round(price*100)/100,
      paid: paid!=null ? Math.round(paid*100)/100 : null,
      o: manual && price>0,
      notes, date, watchlist: /^(true|yes|1)$/i.test(watchlistRaw.trim()), photo,
      extra
    });
  }
  if(!items.length) throw new Error("No usable rows found — check that the sheet has a name column with data under the header.");

  const warnings=[];
  if(cm.qtyPrimaryIdx<0 && cm.qtySecondaryIdx<0) warnings.push("No quantity column found — every line was defaulted to qty 1.");
  else if(qtyDefaults) warnings.push(qtyDefaults+" row"+(qtyDefaults===1?"":"s")+" had no quantity value — defaulted to 1.");
  if(skippedNoName) warnings.push(skippedNoName+" row"+(skippedNoName===1?"":"s")+" skipped (missing name).");
  if(!cm.priceCols.length && cm.paidCols.length) warnings.push('No market/sale price column found — using "'+cm.paidCols[0].label+'" as the value column.');

  return {items, ports:[...ports], warnings, format:guessFormat(cm.headers)};
}

function importRows(allRows, filename){
  const rows = allRows.filter(r=>r && r.length && r.some(c=>c!=null && String(c).trim()!==""));
  if(!rows.length) throw new Error("The file looks empty.");
  const hIdx = findHeaderRow(rows);
  const head = rows[hIdx];
  const data = rows.slice(hIdx+1);
  return mapGenericRows(head, data);
}

function importCSVText(text){ return importRows(parseCSV(text)); }

function importWorkbookArrayBuffer(buf){
  const wb = XLSX.read(buf, {type:"array"});
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, {header:1, raw:false, defval:""});
  const res = importRows(rows);
  if(wb.SheetNames.length>1) res.warnings.push("Workbook has "+wb.SheetNames.length+" sheets — only \""+sheetName+"\" was imported.");
  return res;
}

/* =========================================================================
   Data loading / UI wiring
   ========================================================================= */
function loadData(items, meta, sample){
  ITEMS=items; META=meta; isSample=!!sample;
  openItems.clear(); query=""; filter="all"; sortKey="mkt";
  $("#search").value=""; $("#clrSearch").classList.remove("show"); $("#sort").value="mkt";
  configureChips();
  $("#dbSub").classList.remove("err");
  refreshAll();
  window.scrollTo({top:0});
}

function showImportError(err){
  $("#dbTitle").textContent="Import failed";
  const s=$("#dbSub"); s.classList.add("err"); s.textContent=err.message||"Could not read that file.";
  const w=$("#dbWarn"); w.classList.remove("show"); w.textContent="";
}

function applyImport(res, name, formatNote){
  const {items, ports, warnings, format} = res;
  const title = ports.length===1 ? ports[0] : (ports.length>1 ? ports.length+" portfolios" : name.replace(/\.[a-z0-9]+$/i,""));
  const sub = items.length+" items · "+format+(formatNote||"")+" · <a id='resetData'>use sample</a>";
  const meta = {title, dbTitle:"Imported", dbSub:sub,
    source:"Imported from "+esc(name)+" ("+format+" format detected). "};
  loadData(withOrigin(items), meta, false);
  const w=$("#dbWarn");
  if(warnings && warnings.length){ w.innerHTML = warnings.map(esc).join("<br>"); w.classList.add("show"); }
  else { w.classList.remove("show"); w.textContent=""; }
}

function importFile(file){
  const name=file.name;
  const isExcel = /\.xlsx?$/i.test(name) || /sheet|excel/i.test(file.type||"");
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const res = isExcel ? importWorkbookArrayBuffer(reader.result) : importCSVText(String(reader.result));
      applyImport(res, name);
    }catch(err){ showImportError(err); }
  };
  reader.onerror=()=>showImportError(new Error("Could not read that file."));
  if(isExcel) reader.readAsArrayBuffer(file); else reader.readAsText(file);
}

function importText(text, name){
  try{
    const res = importCSVText(text);
    applyImport(res, name||"Pasted CSV");
    return true;
  }catch(err){ $("#pasteErr").textContent=err.message||"Could not read that CSV."; return false; }
}

/* ---------- tier math ---------- */
function activeTiers(){
  return tiers.map((t,i)=>({...t,ci:i}))
    .filter(t=>Number.isFinite(t.start)&&Number.isFinite(t.pct))
    .sort((a,b)=>a.start-b.start);
}
function buyFrac(price){ let f=0,found=false; for(const t of activeTiers()){ if(price>=t.start){f=t.pct/100;found=true;} } return found?f:0; }
function tierIndexFor(price){ const at=activeTiers(); let idx=-1; for(let k=0;k<at.length;k++){ if(price>=at[k].start) idx=k; } return idx; }

function compute(){
  const at=activeTiers(); let mkt=0,off=0,units=0;
  const bm=at.map(()=>0), bo=at.map(()=>0);
  for(const it of ITEMS){
    const mv=it.q*it.p, f=buyFrac(it.p), ov=mv*f;
    mkt+=mv; off+=ov; units+=it.q;
    const bi=tierIndexFor(it.p); if(bi>=0){ bm[bi]+=mv; bo[bi]+=ov; }
  }
  return {mkt,off,units,at,bm,bo,blend: mkt?off/mkt:0};
}

/* ---------- render ---------- */
function renderSummary(c){
  $("#profName").textContent = META.title;
  $("#unitStat").textContent = ITEMS.length+" lines · "+c.units+" units";
  $("#offerTot").innerHTML = "<em>"+money0(c.off)+"</em>";
  $("#mktTot").textContent = money0(c.mkt);
  $("#blendPct").textContent = (c.blend*100).toFixed(1)+"%";
  $("#dbTitle").textContent = META.dbTitle;
  $("#dbSub").innerHTML = META.dbSub;
  $("#srcLine").innerHTML = META.source;
}
function bandLabel(at,i){ const s=at[i].start, next=at[i+1]?at[i+1].start:null, f=n=>"$"+n.toLocaleString("en-US");
  return next===null ? (f(s)+" & up") : (f(s)+"–"+f(next-0.01)); }

function renderTiers(){
  const box=$("#tierRows"); box.innerHTML=""; const at=activeTiers();
  tiers.forEach((t,i)=>{
    const row=document.createElement("div"); row.className="tier";
    const color=TIER_COLORS[i%TIER_COLORS.length];
    const pos=at.findIndex(a=>a.ci===i);
    row.innerHTML=`
      <div class="tno" style="background:${color}">${i+1}</div>
      <div class="fld"><span class="flab">Start price</span>
        <div class="stepper"><button data-act="sdec" data-i="${i}">−</button>
          <input class="num" inputmode="decimal" data-fld="start" data-i="${i}" value="${Number.isFinite(t.start)?t.start:""}">
          <button data-act="sinc" data-i="${i}">+</button></div></div>
      <div class="fld"><span class="flab">Offer %</span>
        <div class="stepper"><button data-act="pdec" data-i="${i}">−</button>
          <input class="num" inputmode="numeric" data-fld="pct" data-i="${i}" value="${Number.isFinite(t.pct)?t.pct:""}">
          <button data-act="pinc" data-i="${i}">+</button></div></div>
      <button class="rm" data-act="rm" data-i="${i}" aria-label="Remove tier">×</button>
      <div class="band">${pos>=0?"Applies to "+bandLabel(at,pos):"Fill both fields to activate"}</div>`;
    box.appendChild(row);
  });
  $("#resetTier").disabled = JSON.stringify(tiers)===JSON.stringify(DEFAULT_TIERS);
  updateTierSummary();
}
function updateTierSummary(){ const at=activeTiers();
  $("#tierSummary").textContent = at.length ? (at.length+" active · "+at.map(t=>t.pct+"%").join(" / ")) : "none set"; }

function renderBands(c){
  const box=$("#bandBox"); if(!c.at.length){box.innerHTML="";return;}
  const rows=c.at.map((t,i)=>{ const color=TIER_COLORS[t.ci%TIER_COLORS.length];
    return `<div class="brow"><span class="bname"><span class="dot" style="background:${color}"></span>${bandLabel(c.at,i)} · ${t.pct}%</span>
      <span class="bm num">${money(c.bm[i])}</span><span class="bo num">${money(c.bo[i])}</span></div>`; }).join("");
  box.innerHTML=`<h3>By price band — market → offer</h3>${rows}
    <div class="brow" style="border-top:2px solid var(--line);margin-top:2px">
      <span class="bname" style="font-weight:650">Total</span>
      <span class="bm num" style="color:#333">${money(c.mkt)}</span><span class="bo num">${money(c.off)}</span></div>`;
}

function configureChips(){
  const box=$("#chips");
  // keep the static "All" chip, rebuild the rest each time
  box.querySelectorAll(".chip:not([data-f='all'])").forEach(el=>el.remove());
  const types = [...new Set(ITEMS.map(i=>i.t).filter(Boolean))];
  const showTypeChips = types.length>1;
  if(showTypeChips){
    for(const t of types){
      const b=document.createElement("button");
      b.className="chip"; b.dataset.f=t; b.setAttribute("aria-pressed","false"); b.textContent=t;
      box.appendChild(b);
    }
  }
  if(ITEMS.some(i=>i.q>1)){
    const b=document.createElement("button");
    b.className="chip"; b.dataset.f="multi"; b.setAttribute("aria-pressed","false"); b.textContent="Qty 2+";
    box.appendChild(b);
  }
  const valid = new Set(["all","multi",...types]);
  if(!valid.has(filter)) filter="all";
  [...box.children].forEach(ch=>ch.setAttribute("aria-pressed", ch.dataset.f===filter));
}

function passesFilter(it){
  if(filter==="multi"){ if(it.q<2) return false; }
  else if(filter!=="all"){ if(it.t!==filter) return false; }
  if(query){
    const extraTxt = (it.extra||[]).map(e=>e.value).join(" ");
    const hay=(it.n+" "+it.s+" "+(it.game||"")+" "+it.d+" "+it.c+" "+it.v+" "+(it.notes||"")+" "+extraTxt).toLowerCase();
    if(!hay.includes(query)) return false;
  }
  return true;
}
function renderList(){
  const list=$("#list");
  const rows=ITEMS.map((it,idx)=>({it,idx})).filter(o=>passesFilter(o.it));
  const at=activeTiers();
  rows.forEach(o=>{ o.mv=o.it.q*o.it.p; o.f=buyFrac(o.it.p); o.ov=o.mv*o.f; o.bi=tierIndexFor(o.it.p); });
  const s=sortKey;
  rows.sort((a,b)=> s==="name"?a.it.n.localeCompare(b.it.n): s==="price"?b.it.p-a.it.p: s==="offer"?b.ov-a.ov: b.mv-a.mv);
  $("#count").textContent = rows.length+(rows.length===1?" item":" items");
  if(!rows.length){ list.innerHTML=`<div class="empty">No items match.<br>Try clearing the search or filter.</div>`; return; }
  const frag=document.createDocumentFragment();
  for(const o of rows){
    const it=o.it, el=document.createElement("div");
    el.className="item"+(openItems.has(o.idx)?" open":"");
    const color=o.bi>=0?TIER_COLORS[at[o.bi].ci%TIER_COLORS.length]:null;
    const meta=[it.s, it.d?("#"+it.d):"", it.c].filter(Boolean).join(" · ");

    const extraRows = (it.extra||[]).map(e=>`<div class="drow"><span class="k">${esc(e.label)}</span><span class="val">${esc(e.value)}</span></div>`).join("");
    const knownExtras = [
      it.game ? `<div class="drow"><span class="k">Game</span><span class="val">${esc(it.game)}</span></div>` : "",
      (it.paid!=null) ? `<div class="drow"><span class="k">Amount paid</span><span class="val num">${money(it.paid)}</span></div>` : "",
      it.date ? `<div class="drow"><span class="k">Date added</span><span class="val">${esc(it.date)}</span></div>` : "",
      it.watchlist ? `<div class="drow"><span class="k">Watchlist</span><span class="val">Yes</span></div>` : "",
      it.notes ? `<div class="drow"><span class="k">Notes</span><span class="val">${esc(it.notes)}</span></div>` : "",
    ].join("");

    // Images are Card-only (see canAutoLookup above) and, for open Card
    // rows, carry async state (loading/checked) that's only ever meaningful
    // once the row has actually been opened — that's what triggers the
    // lookup — so skip building the block otherwise entirely.
    let cardImgHtml = "";
    if(it.t==="Card" && openItems.has(o.idx)){
      const photoUrl = it.photo || it._imgUrl;
      if(photoUrl){
        cardImgHtml = `<div class="card-img"><img src="${esc(photoUrl)}" alt="${esc(it.n)}" loading="lazy" onerror="handleCardImgError(${o.idx})"></div>
          ${it.userPhoto?`<button class="photo-remove" data-idx="${o.idx}">Remove image</button>`:""}`;
      } else if(it._imgLoading){
        cardImgHtml = `<div class="card-img-note">Looking up image…</div>`;
      } else {
        const note = canAutoLookup(it) ? "No image found automatically." : "No photo in this import.";
        cardImgHtml = `<div class="card-img-manual">
          <div class="card-img-note">${note}</div>
          <div class="photo-add-row">
            <input type="text" class="photo-input" data-idx="${o.idx}" placeholder="Paste an image URL…" inputmode="url">
            <button class="btn photo-add" data-idx="${o.idx}">Add</button>
          </div>
        </div>`;
      }
    }

    el.innerHTML=`
      <div class="item-main" data-idx="${o.idx}">
        <div class="it-left">
          <p class="it-name">${esc(it.n)}</p>
          <div class="it-meta">${esc(meta)}</div>
          ${it.q>1?`<span class="it-qty num">×${it.q} @ ${money(it.p)}</span>`:""}
        </div>
        <div class="it-right">
          <span class="it-offer num">${money(o.ov)}</span>
          ${o.mv!==o.ov?`<span class="it-mkt num">${money(o.mv)}</span>`:""}
          <span class="pct ${o.f?"":"zero"}" style="${o.f?`background:${color}`:""}">${Math.round(o.f*100)}%</span>
        </div>
      </div>
      <div class="detail">
        ${cardImgHtml}
        ${it.v?`<div class="drow"><span class="k">Variant</span><span class="val">${esc(it.v)}</span></div>`:""}
        ${it.c?`<div class="drow"><span class="k">Condition</span><span class="val">${esc(it.c)}</span></div>`:""}
        <div class="drow"><span class="k">Type</span><span class="val">${esc(it.t)}</span></div>
        <div class="drow"><span class="k">Price / unit${it.o?`<span class="ovtag">manual</span>`:""}</span>
          <span class="val num price-edit">
            <span class="cur">$</span><input type="text" inputmode="decimal" class="price-input num" data-idx="${o.idx}" value="${it.p.toFixed(2)}" aria-label="Override unit price for ${esc(it.n)}">
            ${(it.origP!=null && it.p!==it.origP)?`<button class="price-reset" data-idx="${o.idx}" title="Reset to imported price ${money(it.origP)}" aria-label="Reset price">↺</button>`:""}
          </span></div>
        <div class="drow"><span class="k">Quantity</span><span class="val num">${it.q}</span></div>
        ${knownExtras}
        ${extraRows?`<div class="extra-head">Additional info</div>${extraRows}`:""}
        <div class="math num">${money(it.p)} × ${Math.round(o.f*100)}% = ${money(it.p*o.f)}/unit → <b>${money(o.ov)}</b> for ${it.q}</div>
      </div>`;
    frag.appendChild(el);
  }
  list.innerHTML=""; list.appendChild(frag);
}
function refreshAll(){ const c=compute(); renderSummary(c); renderBands(c); renderList(); saveState(); }

/* ---------- manual per-item price override ---------- */
function applyPriceEdit(idx, raw){
  const it = ITEMS[idx];
  if(!it || raw.trim()==="" ){ renderList(); return; } // blank/missing — just redraw to restore the shown value
  const v = numClean(raw);
  if(!(v>=0)){ renderList(); return; } // invalid or negative — revert
  const rounded = Math.round(v*100)/100;
  if(rounded===it.p){ renderList(); return; }
  it.p = rounded;
  it.o = true;
  refreshAll();
}
function resetItemPrice(idx){
  const it = ITEMS[idx];
  if(!it || it.origP==null) return;
  it.p = it.origP;
  it.o = !!it.origO;
  refreshAll();
}

/* ---------- events ---------- */
$("#tierRows").addEventListener("click",e=>{
  const b=e.target.closest("button[data-act]"); if(!b) return;
  const i=+b.dataset.i, a=b.dataset.act;
  if(a==="rm") tiers.splice(i,1);
  else if(a==="sinc") tiers[i].start=Math.max(0,(Number.isFinite(tiers[i].start)?tiers[i].start:0)+5);
  else if(a==="sdec") tiers[i].start=Math.max(0,(Number.isFinite(tiers[i].start)?tiers[i].start:0)-5);
  else if(a==="pinc") tiers[i].pct=Math.min(100,(Number.isFinite(tiers[i].pct)?tiers[i].pct:0)+5);
  else if(a==="pdec") tiers[i].pct=Math.max(0,(Number.isFinite(tiers[i].pct)?tiers[i].pct:0)-5);
  renderTiers(); refreshAll();
});
$("#tierRows").addEventListener("input",e=>{
  const inp=e.target.closest("input[data-fld]"); if(!inp) return;
  const i=+inp.dataset.i, fld=inp.dataset.fld, raw=inp.value.trim();
  tiers[i][fld] = raw===""?NaN:parseFloat(raw);
  const at=activeTiers(), pos=at.findIndex(a=>a.ci===i), row=$("#tierRows").children[i];
  if(row) row.querySelector(".band").textContent = pos>=0?"Applies to "+bandLabel(at,pos):"Fill both fields to activate";
  updateTierSummary(); refreshAll();
});
$("#addTier").addEventListener("click",()=>{ const at=activeTiers();
  const ls=at.length?at[at.length-1].start:0, lp=at.length?at[at.length-1].pct:40;
  tiers.push({start:ls+25,pct:Math.min(100,lp+10)}); renderTiers(); refreshAll(); });
$("#resetTier").addEventListener("click",()=>{ tiers=DEFAULT_TIERS.map(t=>({...t})); renderTiers(); refreshAll(); });
$("#tierToggle").addEventListener("click",()=>{ const p=$("#tierPanel"), open=p.classList.toggle("open");
  $("#tierToggle").setAttribute("aria-expanded",open); });

$("#search").addEventListener("input",e=>{ query=e.target.value.trim().toLowerCase();
  $("#clrSearch").classList.toggle("show",!!query); renderList(); });
$("#clrSearch").addEventListener("click",()=>{ $("#search").value=""; query="";
  $("#clrSearch").classList.remove("show"); renderList(); $("#search").focus(); });
$("#chips").addEventListener("click",e=>{ const c=e.target.closest(".chip"); if(!c) return;
  filter=c.dataset.f; [...$("#chips").children].forEach(ch=>ch.setAttribute("aria-pressed",ch===c)); renderList(); });
$("#sort").addEventListener("change",e=>{ sortKey=e.target.value; renderList(); });
$("#list").addEventListener("click",e=>{
  const reset=e.target.closest(".price-reset");
  if(reset){ resetItemPrice(+reset.dataset.idx); return; }
  const photoRemove=e.target.closest(".photo-remove");
  if(photoRemove){ removePhoto(+photoRemove.dataset.idx); return; }
  const photoAdd=e.target.closest(".photo-add");
  if(photoAdd){
    const input = photoAdd.parentElement.querySelector(".photo-input");
    if(input) commitPhotoUrl(+photoAdd.dataset.idx, input.value);
    return;
  }
  if(e.target.closest(".price-input") || e.target.closest(".photo-input")) return; // typing shouldn't toggle the row
  const m=e.target.closest(".item-main"); if(!m) return;
  const idx=+m.dataset.idx;
  if(openItems.has(idx)){ openItems.delete(idx); }
  else{ openItems.add(idx); maybeFetchCardImage(idx); }
  // Always re-render (rather than just toggling the "open" class) so the
  // detail panel's contents — including any image state — get built for
  // its new open/closed state. maybeFetchCardImage may already have
  // triggered one render (to show a loading spinner); this one is what
  // actually shows an image that was already sitting on the item (an
  // imported Photo URL, or one added by hand) with nothing left to fetch.
  renderList();
});
$("#list").addEventListener("change",e=>{ const inp=e.target.closest(".price-input"); if(!inp) return;
  applyPriceEdit(+inp.dataset.idx, inp.value); });
$("#list").addEventListener("keydown",e=>{
  if(e.key!=="Enter") return;
  const priceInp=e.target.closest(".price-input");
  if(priceInp){ e.preventDefault(); priceInp.blur(); return; }
  const photoInp=e.target.closest(".photo-input");
  if(photoInp){ e.preventDefault(); commitPhotoUrl(+photoInp.dataset.idx, photoInp.value); }
});

$("#csvInput").addEventListener("change",e=>{ const f=e.target.files&&e.target.files[0]; if(f) importFile(f); e.target.value=""; });
// "use sample" link (delegated, since dbSub is re-rendered)
$("#dbSub").addEventListener("click",e=>{ if(e.target.id==="resetData"){ loadData(withOrigin(SAMPLE), SAMPLE_META, true); $("#dbWarn").classList.remove("show"); } });

// drag & drop (desktop)
const DROPPABLE_RE = /\.(csv|tsv|txt|xlsx|xls)$/i;
["dragenter","dragover"].forEach(ev=>document.addEventListener(ev,e=>{ e.preventDefault(); document.body.classList.add("drag"); }));
["dragleave","drop"].forEach(ev=>document.addEventListener(ev,e=>{ e.preventDefault();
  if(ev==="drop"||!e.relatedTarget) document.body.classList.remove("drag"); }));
document.addEventListener("drop",e=>{ const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
  if(f && (DROPPABLE_RE.test(f.name) || /csv|excel|sheet|text\/plain/i.test(f.type||""))) importFile(f); });

$("#pasteBtn").addEventListener("click",()=>{ const t=$("#pasteArea").value;
  if(!t.trim()){ $("#pasteErr").textContent="Paste CSV text first."; return; }
  $("#pasteErr").textContent="";
  if(importText(t,"Pasted CSV")){ $("#pasteArea").value=""; $("#pasteBar").open=false; } });

/* ---------- init ---------- */
// Restore whatever was last loaded (an import, edits, tier changes) so an
// installed/offline app opens back up where you left it instead of resetting
// to the sample every time.
(function restoreSavedState(){
  const saved = loadSavedState();
  if(!saved) return;
  ITEMS = saved.items;
  META = saved.meta || SAMPLE_META;
  isSample = !!saved.isSample;
  if(Array.isArray(saved.tiers) && saved.tiers.length) tiers = saved.tiers;
})();
renderTiers();
configureChips();
refreshAll();

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); });
}
