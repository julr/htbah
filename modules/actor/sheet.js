import { normalRoll, checkRoll } from './../roll.js';

export default class HTBAHActorSheet extends ActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/htbah/templates/sheets/actor-sheet.hbs",
            classes: ["htbah", "sheet", "actor"],
            width: 600,
            height: 700,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-content", initial: "biography" }],
            scrollY: [".biography", ".items", ".skills"],
        });
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.htbah;
        data.canEditTokenImage = game.user.hasPermission("FILES_BROWSE");

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // editable
        if (this.isEditable) {
            html.find('a.item-edit').on("click", this._onItemEdit.bind(this));
            html.find('a.item-delete').on("click", this._onItemDelete.bind(this));
            html.find('input.brainstorm-edit').on("change", this._onBrainstormEdit.bind(this));
            html.find('input.skill-edit').on("change", this._onSkillEdit.bind(this));
            html.find('a.skill-add').on("click", this._onSkillAdd.bind(this));
            html.find('a.token-img-edit').on("click", this._onTokenImageEdit.bind(this));

            new ContextMenu(html, ".skill-name", [{
                name: game.i18n.localize("htbah.general.edit"),
                icon: '<i class="fas fa-edit"></i>',
                callback: element => {
                    const item = this.actor.getOwnedItem(element.data("item-id"));
                    item.sheet.render(true);
                }
            }, {
                name: game.i18n.localize("htbah.general.delete"),
                icon: '<i class="fas fa-trash"></i>',
                callback: element => {
                    this.actor.deleteOwnedItem(element.data("item-id"));
                }
            }]);
        }

        if (this.actor.owner) {
            //Rollable links
            html.find('a.normal-roll').on("click", this._onNormalRoll.bind(this));
            html.find('a.check-roll').on("click", this._onCheckRoll.bind(this));
        }
    }

    // Callbacks
    _onItemEdit(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.getOwnedItem(li.data("itemId"));
        item.sheet.render(true);
    }

    _onItemDelete(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        this.actor.deleteOwnedItem(li.data("itemId"));
        li.slideUp(200, () => this.render(false));
    }

    _onBrainstormEdit(event) {
        event.preventDefault();
        const input = event.currentTarget;
        const categoryId = input.dataset.category;
        const points = parseInt(input.value, 10);
        let category = "";
        switch (categoryId) {
            case "0":
                category = "action";
                break;
            case "1":
                category = "knowledge";
                break;
            case "2":
                category = "social";
                break;
            default:
                return;
        }

        if (!isNaN(points)) {
            return this.actor.update({ ["data." + category + ".brainstorm"]: points });
        }
    }

    _onSkillEdit(event) {
        event.preventDefault();
        const input = event.currentTarget;
        const id = input.dataset.id;
        const skillPoints = parseInt(input.value, 10);
        let item = this.actor.getOwnedItem(id);
        if (!isNaN(skillPoints)) {
            return item.update({ ["data.points"]: skillPoints });
        }
    }

    _onSkillAdd(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const skillCategory = parseInt(button.dataset.category);
        if (!isNaN(skillCategory)) {
            let d = new Dialog({
                title: game.i18n.localize("htbah.sheet.actor.newSkill"),
                content: '<form><input type="text" id="name" name="name" placeholder="' + game.i18n.localize("htbah.sheet.actor.newSkill") + '" autofocus></form>',
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("htbah.general.ok"),
                        callback: (html) => {
                            let skillName = html.find('#name').val();
                            if (!skillName.length) { //default name when empty
                                skillName = game.i18n.localize("htbah.sheet.actor.newSkill");
                            }
                            let skillData = {
                                name: skillName,
                                type: 'skill',
                                data: {
                                    category: skillCategory,
                                    points: 0
                                }
                            }
                            this.actor.createOwnedItem(skillData);
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: game.i18n.localize("htbah.general.cancel"),
                    }
                },
                default: "ok" //Dialog crashes when this does not exist but according to documentation it should be part of the options
            }, {
                default: "ok",
                jQuery: true
            });
            d.render(true);
        }
    }

    _onNormalRoll(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const rollData = this.actor.getRollData();
        let formula = button.dataset.roll;
        let text = button.getAttribute("title");

        //roll modifier if ctrl is pressed and mod is present in formula
        if ((event.ctrlKey) && (formula.includes("mod"))) {
            let d = new Dialog({
                title: game.i18n.localize("htbah.general.diceModifier"),
                content: '<form><input type="number" id="mod" name="mod" placeholder="0" autofocus></form>',
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("htbah.general.ok"),
                        callback: (html) => {
                            let modVal = html.find('#mod').val();
                            if (isNaN(parseInt(modVal, 10))) modVal = "0";
                            normalRoll(formula, rollData, text, game.user._id, this.actor, modVal);
                        }
                    }
                },
                default: "ok" //Dialog crashes when this does not exist but according to documentation it should be part of the options
            }, {
                default: "ok",
                jQuery: true
            });
            d.render(true);
        }
        else //Roll directly
        {
            normalRoll(formula, rollData, text, game.user._id, this.actor);
        }
    }

    _onCheckRoll(event) {
        event.preventDefault();
        const button = event.currentTarget;
        let target = button.dataset.against;
        let name = button.dataset.name;

        if (event.ctrlKey) {
            let d = new Dialog({
                title: game.i18n.localize("htbah.general.diceModifier"),
                content: '<form><input type="number" id="mod" name="mod" placeholder="0" autofocus></form>',
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize("htbah.general.ok"),
                        callback: (html) => {
                            let modVal = parseInt(html.find('#mod').val());
                            if (isNaN(modVal)) modVal = 0;
                            checkRoll(target, name, game.user._id, this.actor, modVal);
                        }
                    }
                },
                default: "ok" //Dialog crashes when this does not exist but according to documentation it should be part of the options
            }, {
                default: "ok",
                jQuery: true
            });
            d.render(true);
        }
        else //Roll directly
        {
            checkRoll(target, name, game.user._id, this.actor);
        }
    }

    _onTokenImageEdit(event) {
        event.preventDefault();
        const current = getProperty(this.actor.data, "img");
        const fp = new FilePicker({
            type: "image",
            current: current,
            callback: path => {
                //do we have an actual token or the actor itself?
                if(this.actor.isToken) {
                    return this.actor.token.update({["img"] : path});
                } else { //actual actor and possibly linked token
                    this.actor.update({ 
                        ["img"] : path,
                        ["token.img"] : path 
                    });

                    for (const obj of Object.values(this.actor.apps)) {
                        if(obj.token != null && obj.token.data.actorLink)
                        {
                            obj.token.update({["img"] : path});
                        }
                    }
                }
            }
        });
        return fp.browse();
    }
}