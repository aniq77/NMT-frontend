import Image from "next/image";
import { Lock } from "lucide-react";

const ICON_TO_SLUG: Record<string, string> = {
  footsteps: "first_step",
  book_10: "math_student",
  books: "persistent_student",
  graduation_cap: "learning_master",
  island: "island_conqueror",
  algebra_x: "algebra_expert",
  geometry_tools: "geometry_expert",
  golden_path: "golden_path",
  pi_crown: "mathematician",
  shield_check: "perfect_level",
  hundred: "first_hundred",
  boss: "first_boss",
  heart_shield: "untouched",
  crossed_swords: "first_duel",
  sword: "swordsman",
  handshake: "new_friend",
  friends_duel: "together_to_victory",
  team: "knowledge_team",
  arrow_up: "new_level",
  star_5: "magic_five",
  star_10: "champion_level",
  shopping_bag: "first_purchase",
  gem: "spent_100_diamonds",
  gem_chest: "spent_500_diamonds",
  gems: "spent_1000_diamonds",
  legendary_chest: "legendary_item",
  checklist: "all_daily_completed",
  scroll_100: "quest_master",
  calendar_7: "active_week",
};

type Props = {
  icon: string;
  slug?: string;
  code?: string;
  alt?: string;
  unlocked?: boolean;
  className?: string;
};

function resolveIconSlug(icon: string, slug?: string, code?: string) {
  return slug || code || ICON_TO_SLUG[icon] || icon || "first_step";
}

export function AchievementIcon({ icon, slug, code, alt = "", unlocked = true, className = "" }: Props) {
  const iconSlug = resolveIconSlug(icon, slug, code);

  return (
    <span className={`achievement-icon ${unlocked ? "" : "is-locked"} ${className}`}>
      <Image
        src={`/achievements/${iconSlug}-light.png`}
        alt={alt}
        width={192}
        height={192}
        className="achievement-icon-image achievement-icon-image-light"
        loading="lazy"
      />
      <Image
        src={`/achievements/${iconSlug}-dark.png`}
        alt={alt}
        width={192}
        height={192}
        className="achievement-icon-image achievement-icon-image-dark"
        loading="lazy"
      />
      {!unlocked && (
        <span className="achievement-icon-lock">
          <Lock aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
