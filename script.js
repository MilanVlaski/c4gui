const softwareSystemBtn = document.getElementById("placeSoftwareSystem")
const canvas = document.getElementById("canvas");

softwareSystemBtn.addEventListener("click", function () {
    const softwareSystem = {
        name: "Software System 1",
        description: "",
    };

    console.log(`Placing ${softwareSystem.name}`);

    const placingEvent = new CustomEvent("placingEvent", {
        detail: {
            element: this,
            object: softwareSystem,
        },
        bubbles: true
    });

    this.dispatchEvent(placingEvent);
});

let canvasState = { name: "DEFAULT"}

document.addEventListener("placingEvent", (e) => {
    const object = e.detail.object
    console.log("Selected system:", object.name);
    
    canvasState = {
        name: "PLACING",
        object: object,
        click: function(e, canvas) {
            const objectDiv = document.createElement('div')
            objectDiv.style.position = "absolute"
            objectDiv.style.width = 100 + 'px'
            objectDiv.style.height = 100 + 'px'
            objectDiv.style.left = e.clientX + 'px'
            objectDiv.style.top = e.clientY + 'px'
            objectDiv.style.backgroundColor = "red"

            const nameDiv = document.createElement('div')
            nameDiv.textContent = object.name

            objectDiv.appendChild(nameDiv)

            canvas.appendChild(objectDiv);

            canvasState = {name: "DEFAULT"}
        },
    }
});

canvas.addEventListener("click", (e) => {
    canvasState.click(e, canvas)
})