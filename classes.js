/**
 * DiagramElement represents an entity that can be placed on the canvas.
 *
 *  displayName –
 *  description – Optional longer description.
 *  name        – Identifier also used as a CSS class.
 */
export class DiagramElement {
    constructor(displayName, description = '', name = null) {
        this.displayName = displayName;
        this.description  = description;
        // Derive a css-class-friendly name when not supplied
        this.name = name || displayName.replace(/\s+/g, '');
        this.name = this.name.charAt(0).toLowerCase() + this.name.slice(1);
    }
}
