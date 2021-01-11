export const htbah = {
    heroStyle: true,
    totalSkillPoints: true,
};


export function readConfig() {
    htbah.heroStyle = game.settings.get("htbah", "heroStyle");
    htbah.totalSkillPoints = game.settings.get("htbah", "totalSkillPoints");
}
