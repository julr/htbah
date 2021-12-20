export default class HTBAHActor extends Actor {

    prepareDerivedData() {
        super.prepareDerivedData();
        const actorData = this.data;
        const data = actorData.data;

        // skills are only relevant for pc and npc
        if(actorData.type === 'pc' || actorData.type === 'npc')
        {
            let skillPointsSpent = {
                action: 0,
                knowledge: 0,
                social: 0,
            };
            for (let item of this.items) {
                const itemData = item.data;
                if(itemData.type === 'skill') {
                    //if for some reason skill point are not saved as int, convert them
                    let currentSkillPoints = parseInt(itemData.data.points);
                    let currentSkillCategory = ["action", "knowledge", "social"][itemData.data.category];
                    if(!isNaN(currentSkillPoints) && currentSkillCategory != null)
                    {
                        skillPointsSpent[currentSkillCategory] += currentSkillPoints;
                    }
                }
            }

            data.totalSkills = 0
            for (const category in skillPointsSpent) {
                const pointsSpent = skillPointsSpent[category];
                data.totalSkills += pointsSpent;

                data[category].points = Math.round(pointsSpent / 10);
                data[category].brainstorm.max = Math.round(pointsSpent / 100);
                data[category].brainstorm.value = Math.min(data[category].brainstorm.value, data[category].brainstorm.max);
            }
        }

        //limit HP
        if(data.health.value > data.health.max) data.health.value = data.health.max;
    }
}
