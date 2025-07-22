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
        this.elements = new Map()
        this.softwareSystemCount = 0
        this.personCount = 0
        this.containerCount = 0
    }

    
/**
 * Adds an element ensuring unique display names.
 * 
 * Note: The method mutates the element’s displayName and returns the updated element.
 * For safety, always use the returned element rather than the original reference,
 * as it may be modified or replaced internally.
 * 
 * @param {DiagramElement} element - The element to add.
 * @returns {DiagramElement|undefined} The updated element if added; otherwise undefined.
 */
    addElement(element) {
        let updatedCount = this[`${element.name}Count`] + 1
        let newDisplayName = `${element.displayName} ${updatedCount}`

        if(!this.elements.has(element.displayName)) {
            element.displayName = newDisplayName
            this.elements.set(newDisplayName, element)
            this[`${element.name}Count`] = updatedCount

            return element
        } else {
            console.log("DUPLICATE ERROR")
        }
    }

}
 