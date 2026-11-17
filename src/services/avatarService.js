// Pro Animal Head Mascot Avatars with Headphones for "friends at concerts"
// Proper anatomical animal head shapes — Not chibi/cute, but confident, cool, stylized, and happy!
// Detailed vector illustrations with authentic head silhouettes, over-ear headphones, and upbeat gig expressions.

const toDataUri = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());

// 1. WOLF (Apex Beats) - Proper wolf head with elongated snout, cheek ruff, pointed ears & cheerful canine smile
const wolfSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <!-- Duolingo Bold Background -->
  <circle cx="60" cy="60" r="56" fill="#1CB0F6"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#1899D6" opacity="0.6"/>

  <!-- Headphone Band Over Ears -->
  <path d="M 20 46 A 42 42 0 0 1 100 46" fill="none" stroke="#2B3442" stroke-width="8" stroke-linecap="round"/>
  <path d="M 24 43 A 38 38 0 0 1 96 43" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>

  <!-- Wolf Ears (Tall, triangular, inner fur) -->
  <polygon points="34,44 22,14 46,32" fill="#475569"/>
  <polygon points="32,40 26,20 42,32" fill="#CBD5E1"/>
  <polygon points="86,44 98,14 74,32" fill="#475569"/>
  <polygon points="88,40 94,20 78,32" fill="#CBD5E1"/>

  <!-- Wolf Head Base (Angular canine cheek ruff) -->
  <path d="M 36 46 L 24 64 L 32 66 L 20 80 L 36 78 L 46 94 Q 60 98 74 94 L 84 78 L 100 80 L 88 66 L 96 64 L 84 46 Z" fill="#64748B"/>
  <path d="M 38 52 L 28 66 L 36 67 L 26 78 L 38 76 L 48 90 Q 60 94 72 90 L 82 76 L 94 78 L 84 67 L 92 66 L 82 52 Z" fill="#94A3B8"/>

  <!-- White Muzzle & Chest Ruff -->
  <path d="M 44 68 L 34 82 L 46 80 L 52 92 Q 60 94 68 92 L 74 80 L 86 82 L 76 68 Q 60 72 44 68 Z" fill="#F8FAFC"/>

  <!-- Canine Snout/Bridge -->
  <polygon points="60,54 50,72 70,72" fill="#475569"/>
  <!-- Black Nose Pad -->
  <polygon points="60,70 52,65 68,65" fill="#1F2328"/>
  <ellipse cx="60" cy="67" rx="7" ry="4" fill="#0F172A"/>

  <!-- Happy Smiling Canine Eyes -->
  <polygon points="40,54 50,56 46,60" fill="#F8FAFC"/>
  <circle cx="46" cy="56" r="3.5" fill="#FFC800"/>
  <circle cx="47" cy="56" r="2" fill="#0F172A"/>
  <circle cx="46" cy="55" r="1" fill="#FFFFFF"/>

  <polygon points="80,54 70,56 74,60" fill="#F8FAFC"/>
  <circle cx="74" cy="56" r="3.5" fill="#FFC800"/>
  <circle cx="73" cy="56" r="2" fill="#0F172A"/>
  <circle cx="74" cy="55" r="1" fill="#FFFFFF"/>

  <!-- Happy Open Mouth & Tongue -->
  <path d="M 50 74 Q 60 88 70 74 Z" fill="#851528"/>
  <path d="M 52 74 Q 60 77 68 74" fill="#FFFFFF"/>
  <path d="M 54 77 Q 60 86 66 77 Z" fill="#FF708F"/>

  <!-- DJ Cans -->
  <rect x="15" y="44" width="11" height="26" rx="5" fill="#FFC800"/>
  <rect x="94" y="44" width="11" height="26" rx="5" fill="#FFC800"/>
</svg>`;

// 2. LION (Festival King) - Contoured mane, broad feline muzzle & confident warm smile
const lionSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#FF9600"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#E08400" opacity="0.6"/>

  <!-- Massive Majestic Contoured Mane -->
  <path d="M 60 16 Q 78 16 92 28 Q 106 42 104 64 Q 106 86 90 98 Q 76 108 60 108 Q 44 108 30 98 Q 14 86 16 64 Q 14 42 28 28 Q 42 16 60 16 Z" fill="#B45309"/>
  <!-- Mane Texture Spikes -->
  <polygon points="60,14 64,24 56,24" fill="#92400E"/>
  <polygon points="86,24 84,34 78,28" fill="#92400E"/>
  <polygon points="104,50 94,54 98,44" fill="#92400E"/>
  <polygon points="102,78 92,76 96,86" fill="#92400E"/>
  <polygon points="34,24 36,34 42,28" fill="#92400E"/>
  <polygon points="16,50 26,54 22,44" fill="#92400E"/>
  <polygon points="18,78 28,76 24,86" fill="#92400E"/>

  <!-- Headphone Band -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#2B3442" stroke-width="8" stroke-linecap="round"/>

  <!-- Lion Face (Golden Fur) -->
  <ellipse cx="60" cy="68" rx="28" ry="26" fill="#F59E0B"/>
  <!-- Whisker Pads & Muzzle -->
  <ellipse cx="53" cy="74" rx="9" ry="7" fill="#FEF3C7"/>
  <ellipse cx="67" cy="74" rx="9" ry="7" fill="#FEF3C7"/>
  <!-- Nose Pad -->
  <polygon points="60,72 53,65 67,65" fill="#78350F"/>
  <!-- Happy Cat Mouth with Tongue -->
  <path d="M 51 76 Q 60 86 69 76 Z" fill="#851528"/>
  <path d="M 54 76 Q 60 84 66 76" fill="#FF708F"/>

  <!-- Proud Smiling Eyes -->
  <ellipse cx="46" cy="58" rx="4.5" ry="5.5" fill="#FEF3C7"/>
  <circle cx="46" cy="58" r="3.5" fill="#D97706"/>
  <circle cx="46" cy="58" r="2" fill="#1F2328"/>
  <circle cx="45" cy="57" r="1" fill="#FFFFFF"/>

  <ellipse cx="74" cy="58" rx="4.5" ry="5.5" fill="#FEF3C7"/>
  <circle cx="74" cy="58" r="3.5" fill="#D97706"/>
  <circle cx="74" cy="58" r="2" fill="#1F2328"/>
  <circle cx="73" cy="57" r="1" fill="#FFFFFF"/>

  <!-- Whisker Dots -->
  <circle cx="49" cy="73" r="1" fill="#B45309"/>
  <circle cx="47" cy="75" r="1" fill="#B45309"/>
  <circle cx="71" cy="73" r="1" fill="#B45309"/>
  <circle cx="73" cy="75" r="1" fill="#B45309"/>

  <!-- Red DJ Headphones -->
  <rect x="16" y="44" width="12" height="26" rx="5" fill="#EF4444"/>
  <rect x="92" y="44" width="12" height="26" rx="5" fill="#EF4444"/>
</svg>`;

// 3. RAPTOR EAGLE (Sonic Falcon) - Sharp curved beak, predatory feathered skull & headphones
const eagleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#58CC02"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#46A302" opacity="0.6"/>

  <!-- Headphone Over-Arch -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#2B3442" stroke-width="8" stroke-linecap="round"/>

  <!-- White Eagle Feathered Crown & Neck -->
  <path d="M 34 50 Q 30 26 60 24 Q 90 26 86 50 L 94 66 L 86 70 L 92 84 L 80 84 L 84 96 Q 60 102 36 96 L 40 84 L 28 84 L 34 70 L 26 66 Z" fill="#F8FAFC"/>
  <!-- Feather Shading -->
  <path d="M 38 78 Q 60 98 82 78 Q 60 88 38 78 Z" fill="#E2E8F0"/>

  <!-- Intense Cheerful Raptor Eyes -->
  <circle cx="46" cy="54" r="5.5" fill="#F59E0B"/>
  <circle cx="46" cy="54" r="3" fill="#0F172A"/>
  <circle cx="45" cy="53" r="1.2" fill="#FFFFFF"/>
  <path d="M 38 48 Q 46 46 54 50" fill="none" stroke="#1F2328" stroke-width="3" stroke-linecap="round"/>

  <circle cx="74" cy="54" r="5.5" fill="#F59E0B"/>
  <circle cx="74" cy="54" r="3" fill="#0F172A"/>
  <circle cx="73" cy="53" r="1.2" fill="#FFFFFF"/>
  <path d="M 82 48 Q 74 46 66 50" fill="none" stroke="#1F2328" stroke-width="3" stroke-linecap="round"/>

  <!-- Massive Curved Golden Beak with cere -->
  <path d="M 50 56 Q 60 52 70 56 L 66 66 Q 60 88 54 84 L 48 70 Z" fill="#F59E0B"/>
  <path d="M 54 84 Q 60 92 62 82 L 66 66 Q 60 76 54 84 Z" fill="#D97706"/>
  <!-- Nostril Slit -->
  <ellipse cx="54" cy="62" rx="2" ry="1" fill="#78350F"/>
  <!-- Beak Smile Line -->
  <path d="M 48 68 Q 60 72 68 66" fill="none" stroke="#92400E" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Cyan Headphones -->
  <rect x="17" y="44" width="11" height="26" rx="5" fill="#06B6D4"/>
  <rect x="92" y="44" width="11" height="26" rx="5" fill="#06B6D4"/>
</svg>`;

// 4. GRIZZLY BEAR (Bass Bruin) - Broad powerful bear skull, wide jaw & big hearty smile
const bearBruinSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#FF4B4B"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#EA2B2B" opacity="0.6"/>

  <!-- Bear Round Ears -->
  <circle cx="32" cy="38" r="13" fill="#5C3D2E"/>
  <circle cx="32" cy="38" r="7" fill="#8B5A2B"/>
  <circle cx="88" cy="38" r="13" fill="#5C3D2E"/>
  <circle cx="88" cy="38" r="7" fill="#8B5A2B"/>

  <!-- Headphone Band -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#1E293B" stroke-width="8" stroke-linecap="round"/>

  <!-- Massive Grizzly Skull Silhouette -->
  <path d="M 32 48 Q 24 70 30 84 Q 40 98 60 100 Q 80 98 90 84 Q 96 70 88 48 Q 60 42 32 48 Z" fill="#78350F"/>

  <!-- Broad Muzzle / Snout -->
  <ellipse cx="60" cy="74" rx="20" ry="14" fill="#D97706"/>
  <ellipse cx="60" cy="66" rx="7" ry="4.5" fill="#1F2328"/>
  <circle cx="58" cy="65" r="1.5" fill="#FFFFFF" opacity="0.6"/>

  <!-- Big Hearty Bear Grin with Teeth -->
  <path d="M 48 76 Q 60 92 72 76 Z" fill="#851528"/>
  <path d="M 52 76 Q 60 80 68 76" fill="#FFFFFF"/>
  <ellipse cx="60" cy="83" rx="5.5" ry="3.5" fill="#FF708F"/>

  <!-- Small Shrewd Friendly Eyes -->
  <ellipse cx="44" cy="58" rx="4" ry="4.5" fill="#1F2328"/>
  <circle cx="43" cy="57" r="1.5" fill="#FFFFFF"/>
  <ellipse cx="76" cy="58" rx="4" ry="4.5" fill="#1F2328"/>
  <circle cx="75" cy="57" r="1.5" fill="#FFFFFF"/>

  <!-- Neon Green DJ Cans -->
  <rect x="16" y="44" width="12" height="26" rx="5" fill="#58CC02"/>
  <rect x="92" y="44" width="12" height="26" rx="5" fill="#58CC02"/>
</svg>`;

// 5. TIGER (Bengal Groove) - Striped feline cheeks, amber eyes & confident smile
const tigerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#CE82FF"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#BA53FF" opacity="0.6"/>

  <!-- Tiger Ears -->
  <circle cx="34" cy="38" r="12" fill="#1F2328"/>
  <circle cx="34" cy="38" r="6" fill="#FFFFFF"/>
  <circle cx="86" cy="38" r="12" fill="#1F2328"/>
  <circle cx="86" cy="38" r="6" fill="#FFFFFF"/>

  <!-- Headphone Band -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#2B3442" stroke-width="8" stroke-linecap="round"/>

  <!-- Orange Feline Head Base with Cheek Ruffs -->
  <path d="M 32 48 L 22 64 L 30 67 L 22 78 L 36 78 Q 60 98 84 78 L 98 78 L 90 67 L 98 64 L 88 48 Z" fill="#EA580C"/>
  <!-- White Jaw & Whisker Area -->
  <path d="M 38 74 Q 60 96 82 74 Q 72 70 60 72 Q 48 70 38 74 Z" fill="#F8FAFC"/>

  <!-- Black Tiger Stripes -->
  <polygon points="60,40 56,48 64,48" fill="#1F2328"/>
  <polygon points="46,44 48,50 42,48" fill="#1F2328"/>
  <polygon points="74,44 72,50 78,48" fill="#1F2328"/>
  <polygon points="30,56 40,58 34,62" fill="#1F2328"/>
  <polygon points="90,56 80,58 86,62" fill="#1F2328"/>

  <!-- Amber Feline Eyes -->
  <polygon points="40,56 50,58 45,62" fill="#FFFFFF"/>
  <circle cx="45" cy="58" r="3.5" fill="#F59E0B"/>
  <circle cx="45" cy="58" r="2" fill="#1F2328"/>
  <circle cx="44" cy="57" r="1" fill="#FFFFFF"/>

  <polygon points="80,56 70,58 75,62" fill="#FFFFFF"/>
  <circle cx="75" cy="58" r="3.5" fill="#F59E0B"/>
  <circle cx="75" cy="58" r="2" fill="#1F2328"/>
  <circle cx="74" cy="57" r="1" fill="#FFFFFF"/>

  <!-- Pink Nose -->
  <polygon points="60,70 54,65 66,65" fill="#FB7185"/>

  <!-- Cheerful Feline Smile -->
  <path d="M 50 74 Q 60 84 70 74 Z" fill="#851528"/>
  <path d="M 54 74 Q 60 80 66 74" fill="#FF708F"/>

  <!-- Yellow Headphones -->
  <rect x="16" y="44" width="11" height="26" rx="5" fill="#FFC800"/>
  <rect x="93" y="44" width="11" height="26" rx="5" fill="#FFC800"/>
</svg>`;

// 6. GORILLA (Silverback Sound) - Pronounced brow ridge, muscular jaw & big warm ape grin
const gorillaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#FF9600"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#E08400" opacity="0.6"/>

  <!-- Headphone Over-Arch -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#0F172A" stroke-width="8" stroke-linecap="round"/>

  <!-- Sagittal Crest / Head Crown -->
  <path d="M 32 50 Q 28 32 60 26 Q 92 32 88 50 Q 94 72 88 88 Q 60 102 32 88 Q 26 72 32 50 Z" fill="#334155"/>

  <!-- Heavy Muscular Brow Ridge -->
  <path d="M 36 50 Q 60 46 84 50 Q 86 58 60 56 Q 34 58 36 50 Z" fill="#1E293B"/>

  <!-- Dark Leather Face Mask -->
  <path d="M 40 54 Q 60 52 80 54 Q 84 74 76 86 Q 60 92 44 86 Q 36 74 40 54 Z" fill="#1E293B"/>

  <!-- Broad Gorilla Nostrils -->
  <ellipse cx="54" cy="70" rx="3.5" ry="2.5" fill="#0F172A"/>
  <ellipse cx="66" cy="70" rx="3.5" ry="2.5" fill="#0F172A"/>

  <!-- Huge Warm Friendly Ape Smile with Teeth -->
  <path d="M 46 76 Q 60 92 74 76 Z" fill="#851528"/>
  <path d="M 50 76 Q 60 80 70 76" fill="#FFFFFF"/>
  <ellipse cx="60" cy="83" rx="6" ry="3.5" fill="#FF708F"/>

  <!-- Kind Dark Eyes tucked under brow -->
  <circle cx="48" cy="56" r="3.5" fill="#F59E0B"/>
  <circle cx="48" cy="56" r="2" fill="#0F172A"/>
  <circle cx="47" cy="55" r="1" fill="#FFFFFF"/>

  <circle cx="72" cy="56" r="3.5" fill="#F59E0B"/>
  <circle cx="72" cy="56" r="2" fill="#0F172A"/>
  <circle cx="71" cy="55" r="1" fill="#FFFFFF"/>

  <!-- Red DJ Headphones -->
  <rect x="16" y="44" width="12" height="26" rx="5" fill="#EF4444"/>
  <rect x="92" y="44" width="12" height="26" rx="5" fill="#EF4444"/>
</svg>`;

// 7. FOX (Vulpine Rhythm) - Sleek pointed snout, large triangular ears & clever grin
const foxSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#20E3B2"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#00CD9C" opacity="0.6"/>

  <!-- Large Pointed Fox Ears -->
  <polygon points="34,44 18,16 48,30" fill="#EA580C"/>
  <polygon points="32,40 22,22 43,32" fill="#FFF5EB"/>
  <polygon points="86,44 102,16 72,30" fill="#EA580C"/>
  <polygon points="88,40 98,22 77,32" fill="#FFF5EB"/>

  <!-- Headphone Band -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#2B3442" stroke-width="7" stroke-linecap="round"/>

  <!-- Slender Fox Head & Cheeks -->
  <path d="M 34 50 L 22 66 L 32 68 L 22 80 L 38 80 Q 60 94 82 80 L 98 80 L 88 68 L 98 66 L 86 50 Z" fill="#EA580C"/>
  <!-- White Snout / Cheeks -->
  <path d="M 38 72 L 28 82 L 42 80 Q 60 92 78 80 L 92 82 L 82 72 Q 60 76 38 72 Z" fill="#FFFFFF"/>

  <!-- Pointed Black Snout -->
  <polygon points="60,76 54,71 66,71" fill="#1F2328"/>

  <!-- Smiling Eyes -->
  <path d="M 44 58 Q 50 51 56 58" fill="none" stroke="#1F2328" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 64 58 Q 70 51 76 58" fill="none" stroke="#1F2328" stroke-width="3.5" stroke-linecap="round"/>

  <!-- Clever Cheerful Smile -->
  <path d="M 52 78 Q 60 86 68 78 Z" fill="#851528"/>
  <ellipse cx="60" cy="82" rx="4" ry="2" fill="#FF708F"/>

  <!-- Purple Headphones -->
  <rect x="16" y="44" width="11" height="26" rx="5" fill="#8B5CF6"/>
  <rect x="93" y="44" width="11" height="26" rx="5" fill="#8B5CF6"/>
</svg>`;

// 8. STAG (Antler Acoustic) - Elegant elongated deer skull, branching antlers & gentle smile
const stagSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#1CB0F6"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#1899D6" opacity="0.6"/>

  <!-- Branching Antlers -->
  <path d="M 46 36 L 36 18 M 36 18 L 26 14 M 36 18 L 38 10 M 42 26 L 30 24" fill="none" stroke="#78350F" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 74 36 L 84 18 M 84 18 L 94 14 M 84 18 L 82 10 M 78 26 L 90 24" fill="none" stroke="#78350F" stroke-width="3.5" stroke-linecap="round"/>

  <!-- Deer Ears (large, leaf-shaped) -->
  <ellipse cx="28" cy="46" rx="12" ry="7" fill="#92400E" transform="rotate(-30 28 46)"/>
  <ellipse cx="28" cy="46" rx="8" ry="4" fill="#FDE68A" transform="rotate(-30 28 46)"/>
  <ellipse cx="92" cy="46" rx="12" ry="7" fill="#92400E" transform="rotate(30 92 46)"/>
  <ellipse cx="92" cy="46" rx="8" ry="4" fill="#FDE68A" transform="rotate(30 92 46)"/>

  <!-- Headphone Band Resting Under Antlers -->
  <path d="M 24 50 A 38 38 0 0 1 96 50" fill="none" stroke="#2B3442" stroke-width="7" stroke-linecap="round"/>

  <!-- Elongated Deer Head -->
  <path d="M 42 42 Q 60 38 78 42 L 74 68 Q 66 90 60 92 Q 54 90 46 68 Z" fill="#B45309"/>
  <!-- White Snout Patch -->
  <ellipse cx="60" cy="80" rx="10" ry="8" fill="#FEF3C7"/>
  <!-- Black Nose -->
  <ellipse cx="60" cy="76" rx="5" ry="3.5" fill="#1F2328"/>

  <!-- Gentle Happy Smile -->
  <path d="M 54 83 Q 60 88 66 83" fill="none" stroke="#1F2328" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Big Dark Doe Eyes -->
  <ellipse cx="48" cy="56" rx="4.5" ry="5.5" fill="#1F2328"/>
  <circle cx="47" cy="54" r="1.5" fill="#FFFFFF"/>
  <ellipse cx="72" cy="56" rx="4.5" ry="5.5" fill="#1F2328"/>
  <circle cx="71" cy="54" r="1.5" fill="#FFFFFF"/>

  <!-- Mint Headphones -->
  <rect x="17" y="48" width="11" height="24" rx="5" fill="#10B981"/>
  <rect x="92" y="48" width="11" height="24" rx="5" fill="#10B981"/>
</svg>`;

// 9. CROCODILE / GATOR (Gator Bass) - Long toothy snout, scaly ridge eyes & big happy grin
const gatorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#FFC800"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#E5A500" opacity="0.6"/>

  <!-- Headphone Band -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#2B3442" stroke-width="7" stroke-linecap="round"/>

  <!-- Reptilian Brow Ridges -->
  <circle cx="44" cy="44" r="11" fill="#15803D"/>
  <circle cx="76" cy="44" r="11" fill="#15803D"/>

  <!-- Crocodile Broad Snout -->
  <path d="M 38 48 Q 60 44 82 48 L 76 72 Q 72 88 60 90 Q 48 88 44 72 Z" fill="#16A34A"/>
  <!-- Belly / Jaw Underneath -->
  <path d="M 46 72 Q 60 94 74 72 Z" fill="#BBF7D0"/>

  <!-- Yellow Reptile Eyes -->
  <circle cx="44" cy="44" r="7" fill="#FEF08A"/>
  <ellipse cx="44" cy="44" rx="2" ry="5" fill="#1F2328"/>
  <circle cx="76" cy="44" r="7" fill="#FEF08A"/>
  <ellipse cx="76" cy="44" rx="2" ry="5" fill="#1F2328"/>

  <!-- Nostrils -->
  <circle cx="56" cy="80" r="2" fill="#14532D"/>
  <circle cx="64" cy="80" r="2" fill="#14532D"/>

  <!-- Wide Toothy Happy Gator Grin -->
  <path d="M 44 68 Q 60 84 76 68" fill="none" stroke="#1F2328" stroke-width="3" stroke-linecap="round"/>
  <!-- Cute Teeth -->
  <polygon points="50,68 53,73 56,68" fill="#FFFFFF"/>
  <polygon points="64,68 67,73 70,68" fill="#FFFFFF"/>

  <!-- Blue Headphones -->
  <rect x="16" y="44" width="11" height="26" rx="5" fill="#3B82F6"/>
  <rect x="93" y="44" width="11" height="26" rx="5" fill="#3B82F6"/>
</svg>`;

// 10. RHINO (Heavy Metal) - Armored skull plates, snout horns & energetic smirk
const rhinoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#FF4B4B"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#EA2B2B" opacity="0.6"/>

  <!-- Pointed Rhino Ears -->
  <polygon points="34,42 24,24 44,36" fill="#475569"/>
  <polygon points="86,42 96,24 76,36" fill="#475569"/>

  <!-- Heavy Headphone Band -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#1E293B" stroke-width="8" stroke-linecap="round"/>

  <!-- Heavy Armored Rhino Skull -->
  <path d="M 38 46 Q 60 40 82 46 L 78 70 Q 72 90 60 92 Q 48 90 42 70 Z" fill="#64748B"/>
  <path d="M 42 54 L 78 54 L 74 72 Q 60 82 46 72 Z" fill="#94A3B8"/>

  <!-- Iconic Rhino Horns on Snout -->
  <path d="M 56 68 Q 60 52 64 68 Z" fill="#F8FAFC"/>
  <path d="M 58 76 Q 60 66 62 76 Z" fill="#F8FAFC"/>

  <!-- Confident Smirking Eyes -->
  <ellipse cx="46" cy="56" rx="3.5" ry="4" fill="#0F172A"/>
  <circle cx="45" cy="55" r="1" fill="#FFFFFF"/>
  <ellipse cx="74" cy="56" rx="3.5" ry="4" fill="#0F172A"/>
  <circle cx="73" cy="55" r="1" fill="#FFFFFF"/>

  <!-- Tough Cheerful Smirk -->
  <path d="M 50 78 Q 60 85 70 78" fill="none" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>

  <!-- Orange Headphones -->
  <rect x="16" y="44" width="12" height="26" rx="5" fill="#F97316"/>
  <rect x="92" y="44" width="12" height="26" rx="5" fill="#F97316"/>
</svg>`;

// 11. PANTHER (Midnight Groove) - Sleek obsidian feline head, bright green eyes & beaming smile
const pantherSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#58CC02"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#46A302" opacity="0.6"/>

  <!-- Sleek Rounded Ears -->
  <circle cx="34" cy="38" r="11" fill="#0F172A"/>
  <circle cx="34" cy="38" r="6" fill="#334155"/>
  <circle cx="86" cy="38" r="11" fill="#0F172A"/>
  <circle cx="86" cy="38" r="6" fill="#334155"/>

  <!-- Headphone Band -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>

  <!-- Sleek Obsidian Feline Skull -->
  <ellipse cx="60" cy="68" rx="30" ry="26" fill="#0F172A"/>
  <!-- Muzzle Pads -->
  <ellipse cx="54" cy="74" rx="8" ry="6" fill="#1E293B"/>
  <ellipse cx="66" cy="74" rx="8" ry="6" fill="#1E293B"/>
  <polygon points="60,71 55,66 65,66" fill="#38BDF8"/>

  <!-- Glowing Yellow Feline Eyes -->
  <polygon points="41,56 51,58 46,62" fill="#FEF08A"/>
  <circle cx="46" cy="58" r="2.5" fill="#0F172A"/>
  <circle cx="45" cy="57" r="1" fill="#FFFFFF"/>

  <polygon points="79,56 69,58 74,62" fill="#FEF08A"/>
  <circle cx="74" cy="58" r="2.5" fill="#0F172A"/>
  <circle cx="73" cy="57" r="1" fill="#FFFFFF"/>

  <!-- Beaming Open Feline Smile -->
  <path d="M 50 75 Q 60 86 70 75 Z" fill="#851528"/>
  <path d="M 54 75 Q 60 82 66 75" fill="#FF708F"/>

  <!-- Neon Green Headphones -->
  <rect x="17" y="44" width="11" height="25" rx="5" fill="#A3E635"/>
  <rect x="92" y="44" width="11" height="25" rx="5" fill="#A3E635"/>
</svg>`;

// 12. GREAT HORNED OWL (Nocturnal DJ) - Feathered brow disc, curved beak & studio cans
const owlNocturnalSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="56" fill="#CE82FF"/>
  <path d="M 6 60 A 54 54 0 0 0 114 60 A 54 48 0 0 1 6 60 Z" fill="#BA53FF" opacity="0.6"/>

  <!-- Horned Feather Tuft Ears -->
  <polygon points="34,44 18,20 46,34" fill="#5C3D2E"/>
  <polygon points="86,44 102,20 74,34" fill="#5C3D2E"/>

  <!-- Headphone Over-Arch -->
  <path d="M 22 46 A 40 40 0 0 1 98 46" fill="none" stroke="#2B3442" stroke-width="8" stroke-linecap="round"/>

  <!-- Brown Feathered Owl Skull -->
  <ellipse cx="60" cy="66" rx="34" ry="30" fill="#78350F"/>

  <!-- Dual Facial Disc Feathers -->
  <circle cx="45" cy="58" r="14" fill="#FDE68A"/>
  <circle cx="75" cy="58" r="14" fill="#FDE68A"/>

  <!-- Large Amber Night Eyes with joyful squint -->
  <circle cx="45" cy="58" r="8" fill="#F59E0B"/>
  <circle cx="45" cy="58" r="4.5" fill="#1F2328"/>
  <circle cx="43" cy="56" r="1.5" fill="#FFFFFF"/>

  <circle cx="75" cy="58" r="8" fill="#F59E0B"/>
  <circle cx="75" cy="58" r="4.5" fill="#1F2328"/>
  <circle cx="73" cy="56" r="1.5" fill="#FFFFFF"/>

  <!-- Hooked Beak -->
  <path d="M 57 56 Q 60 54 63 56 L 63 68 Q 60 76 57 74 Z" fill="#1F2328"/>
  <!-- Beak Smile Line -->
  <path d="M 52 70 Q 60 78 68 70" fill="none" stroke="#5C3D2E" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Gold DJ Headphones -->
  <rect x="16" y="44" width="11" height="26" rx="5" fill="#F59E0B"/>
  <rect x="93" y="44" width="11" height="26" rx="5" fill="#F59E0B"/>
</svg>`;

// The 12 Proper Animal Heads with Headphones
export const PRESET_AVATARS = [
  { id: 'anim_wolf', label: 'Apex Wolf', category: 'Canine', url: toDataUri(wolfSvg) },
  { id: 'anim_lion', label: 'Festival Lion', category: 'Feline', url: toDataUri(lionSvg) },
  { id: 'anim_eagle', label: 'Sonic Eagle', category: 'Raptor', url: toDataUri(eagleSvg) },
  { id: 'anim_bear', label: 'Bass Grizzly', category: 'Ursine', url: toDataUri(bearBruinSvg) },
  { id: 'anim_tiger', label: 'Bengal Tiger', category: 'Feline', url: toDataUri(tigerSvg) },
  { id: 'anim_gorilla', label: 'Silverback Sound', category: 'Primate', url: toDataUri(gorillaSvg) },
  { id: 'anim_fox', label: 'Vulpine Fox', category: 'Canine', url: toDataUri(foxSvg) },
  { id: 'anim_stag', label: 'Acoustic Stag', category: 'Cervine', url: toDataUri(stagSvg) },
  { id: 'anim_gator', label: 'Gator Bass', category: 'Reptile', url: toDataUri(gatorSvg) },
  { id: 'anim_rhino', label: 'Heavy Rhino', category: 'Ungulate', url: toDataUri(rhinoSvg) },
  { id: 'anim_panther', label: 'Night Panther', category: 'Feline', url: toDataUri(pantherSvg) },
  { id: 'anim_owl', label: 'Great Horned Owl', category: 'Avian', url: toDataUri(owlNocturnalSvg) }
];

// Return deterministic proper animal avatar based on string/name hash
export const getDefaultAvatar = (name) => {
  const str = String(name || 'concert_crew');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PRESET_AVATARS.length;
  return PRESET_AVATARS[index].url;
};

// Return random proper animal avatar on shuffle
export const getRandomDuoAvatar = () => {
  const index = Math.floor(Math.random() * PRESET_AVATARS.length);
  return PRESET_AVATARS[index].url;
};
