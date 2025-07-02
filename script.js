const softwareSystemBtn = document.getElementById("placeSoftwareSystem")

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

document.addEventListener("placingEvent", (e) => {
    console.log("Selected system:", e.detail.object.name);
    console.log("Description:", e.detail.object.description);
});
