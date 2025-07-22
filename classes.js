/**
 * DiagramElement represents an entity that can be placed on the canvas.
 *
 *  displayName –
 *  description – Optional longer description.
 *  name        – Identifier also used as a CSS class.
 */
export class DiagramElement {
    constructor(displayName, description = '', name) {
        this.displayName = displayName;
        this.description  = description;
        this.name = name
    }
}

export class DiagramModel {
    
    constructor() {
        this.elements = []
        this.softwareSystemCount = 0
        this.personCount = 0
        this.containerCount = 0
    }

    addElement(element) {
        // let count = this[`${element.name}Count`] + 1
        // let newDisplayName = `${element.displayName} ${count}`
        this.elements.push(element)
    }

}
 