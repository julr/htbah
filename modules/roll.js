export function normalRoll(formula, rollData, text, user, speaker, modifier = "0") {
    if (formula.includes("mod")) {
        formula = formula.replace("mod", modifier);
    }
    let r = new Roll(formula, rollData);
    r.roll().toMessage({
        user: user,
        speaker: ChatMessage.getSpeaker({ actor: speaker }),
        flavor: text
    });
}

export function checkRoll(checkAgainst, checkName, user, speaker, modifier = 0) {
    let target = parseInt(checkAgainst, 10);
    target += modifier;

    const fatalSuccess = (target < 10) ? 1 : Math.round(target / 10);
    const fatalFailure = (target > 100) ? 100 : 90 + fatalSuccess;

    let r = new Roll("1d100").roll();
    let fatal = false;
    let success = false;

    if (r.total >= fatalFailure) { //fatal failure
        fatal = true;
    } else if (r.total <= target) { //success
        success = true;
        fatal = (r.total <= fatalSuccess);
    } //else -> Normal failure (default)

    let message = game.i18n.format("htbah.general.checkMessage", { name: speaker.data.name, skill: checkName }) + " ";
    if (success && fatal) message += game.i18n.localize("htbah.general.fatalSuccess");
    else if (success) message += game.i18n.localize("htbah.general.success");
    else if (fatal) message += game.i18n.localize("htbah.general.fatalFailure");
    else message += game.i18n.localize("htbah.general.failure");

    let chatOptions = {
        type: CHAT_MESSAGE_TYPES.ROLL,
        roll: r,
        rollMode: game.settings.get("core", "rollMode"),
        user: user,
        speaker: ChatMessage.getSpeaker({ actor: speaker }),
        flavor: message
    };
    ChatMessage.create(chatOptions);
    //console.log("roll against: " + target + ", total:" + r.total + ", fatal success: " + fatalSuccess + ", fatal failure: " + fatalFailure);
}