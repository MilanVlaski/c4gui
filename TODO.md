### To do
- [ ] Hover over relationship arrow and enable adding text on top of it
- [ ] Have a fixed thing at the top which has a "Pan" button, to move the canvas around.
- [ ] Have a button on the fixed thing that lets you move items around. (Strictly visual. Don't want to go layout intensive.) This will lead to a "arranging state" which will prevent "connecting" behavior, which occurs in the default state. 
	- [ ] Draggable elements
- [ ] Don't draw leaderline while pointer is down over the pointered down element.
- [ ] Copy styling of structurizr (use a ruler to find out proportions)
#### Model
- [ ] Add elements to an in memory model
	- [ ] Enforce name uniqueness by taking the name of the element, and adding a number.
		- [ ] Number should be counted, probably by the "model"
		- [ ] Each HTML element should have same id as model name 
	- [ ] Prevent duplicates. Elements should have unique names.
- [ ] Tree on the left with currently existing elements
	- [ ] Drag and drop elements. Important, to promote reuse.
	- [ ] Delete an element.
- [ ] Right click delete an element.
- [ ] Editing the contentEditable name of an element should propagate to the model, and a rename should be attempted. It's best that html elements have ids that are equal to their model counterparts.
- [ ] Double click on a software system leads to a container view.
#### GUI Improvements Graveyard
- [ ] Cursor changes when button to add an element is clicked
- [ ] Connecting doesn't work on mobile. Events don't propagate correctly.
	- [ ] Fix the mobile connecting problem by having the same handler for both mouse and touch.
#### Solved
- [x] Put structurizr example on this laptop
- [x] See what types of elements there are at the "context" level
- [x] Display a header signifying that this is the System Context view
- [x] When an element pressed is being pressed, ie being connected to another element, draw a simple dotted line from the element to the pointer
	- [x] Either do this with leaderline and a Draggable invisible element
	- [x] Or with a primitive dotted line
	- [x] Should be visible while in "ConnectingState"
- [x] Create a person, shaped with CSS.
	- [x]Add button to add a user
- [ ] Stop drawing temp arrow while pointer is inside the element 
- [x] Connect person with software system
- [x] Connect two software systems
    - [x] Go into connecting state on pointerdown
- [x] Have a leaderline between mouse pointer and the object that was clicked. Good for UX, but don't know how to do.
