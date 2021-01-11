export default class HTBAHActor extends Actor {

    prepareDerivedData() {
        const actorData = this.data;
        const data = actorData.data;

        // skills are only relevant for pc and npc
        if(actorData.type == 'pc' || actorData.type == 'npc')
        {
            let skillPointsSpent = [0,0,0];
            for (let i = 0; i < actorData.items.length; ++i) {
                if(actorData.items[i].type == 'skill') {
                    //if for some reason skill point are not saved as int, convert them
                    let currentSkillPoints = parseInt(actorData.items[i].data.points, 10);
                    let currentSkillCategory = parseInt(actorData.items[i].data.category, 10);
                    if(!isNaN(currentSkillPoints) && !isNaN(currentSkillCategory))
                    {
                        skillPointsSpent[currentSkillCategory] += currentSkillPoints;
                    }
                }
            }
            const actionPoints = Math.round(skillPointsSpent[0]/10);
            const knowledgePoints = Math.round(skillPointsSpent[1]/10);
            const socialPoints = Math.round(skillPointsSpent[2]/10);

            data.action.points = actionPoints;
            data.knowledge.points = knowledgePoints;
            data.social.points = socialPoints;
        }

        //limit HP
        if(data.health.value > data.health.max) data.health.value = data.health.max;
    }
}