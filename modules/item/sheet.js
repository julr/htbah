export default class HTBAHItemSheet extends ItemSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/htbah/templates/sheets/item-sheet.hbs",
            classes: ["htbah", "sheet", "item"],
            width: 530,
            height: 340
        });
    }

    getData() {
        const baseData = super.getData();
        console.log(baseData);
        let sheetData = {};
        sheetData.config = CONFIG.htbah;
        sheetData.isGM = game.user.isGM;
        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (this.isEditable) {
            html.find('a.stack-toggle').on("click", this._onStackToggle.bind(this));
        }
    }

    _onStackToggle(event) {
        event.preventDefault();
        return this.item.update({ ["data.stackable"]: !this.item.data.data.stackable });
    }
}