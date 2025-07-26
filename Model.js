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
        this.description = description;
        this.name = name
    }
}

export class Relationship {
    constructor(id, sourceElement, targetElement) {
        this.id = id
        this.sourceElement = sourceElement
        this.targetElement = targetElement
        this.description = ''
    }
}

// SystemContextModel?
export class DiagramModel {

    constructor() {
        // Map of all elements is convenient, for keeping names unique
        this.elements = new Map()
        this.relationships = new Map()
        // Maintaining the count manually is convenient for now, but may be cumbersome later.
        this.softwareSystemCount = 0
        this.personCount = 0
        this.containerCount = 0
        this.relationshipCount = 0
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

        if (!this.elements.has(element.displayName)) {
            element.displayName = newDisplayName
            this.elements.set(newDisplayName, element)
            this[`${element.name}Count`] = updatedCount

            return element
        } else {
            console.log("DUPLICATE ELEMENT ERROR")
        }
    }

    /**
     * Adds a new relationship between two existing elements.
     *
     * The relationship id is composed as
     * `${sourceElementId}:${targetElementId}` and must be unique.
     * If a relationship with that id already exists the call logs a duplicate
     * error and returns `undefined`.
     *
     * @param {string} sourceElementId - Identifier of the source element.
     * @param {string} targetElementId - Identifier of the target element.
     * @returns {Map|undefined} The `relationships` map after insertion, or `undefined` on failure.
     */
    addRelationshipBetween(sourceElementId, targetElementId) {
        const sourceElement = this.elements.get(sourceElementId)
        const targetElement = this.elements.get(targetElementId)

        const relationshipId = `${sourceElementId}:${targetElementId}`
        if(!this.relationships.has(relationshipId)) {
            this.relationshipCount++
            const newRelationship = new Relationship(relationshipId, sourceElement, targetElement)

            return this.relationships.set(relationshipId, newRelationship)
        } else {
            console.log("DUPLICATE RELATIONSHIP ERROR")
        }
    }

    /**
     * Renames an existing element ensuring the new display name is unique.
     *
     * @param {string} oldDisplayName - Current display name of the element.
     * @param {string} newDisplayName - Desired new, unique display name.
     * @returns {boolean} True if the rename succeeded, false otherwise.
     */
    renameElement(oldDisplayName, newDisplayName) {
        // Reject if the desired name is already taken
        if (this.elements.has(newDisplayName)) {
            return false
        }
        const element = this.elements.get(oldDisplayName)
        if (!element) {
            return false
        }
        this.elements.delete(oldDisplayName)
        element.displayName = newDisplayName
        this.elements.set(newDisplayName, element)
        return true
    }

}

