C4 modelling app that exports to Structurizr DSL
## Try it out

Clone the repository and serve the files over a small local web server,
then open the provided URL in your browser.

### Option 1 – Python’s built-in server

```bash
# Python 3
python3 -m http.server 8000
# Python 2
python -m SimpleHTTPServer 8000
```

Browse to: http://localhost:8000

### Option 2 – Node.js http-server

```bash
npm install -g http-server
http-server -p 8080
```

Browse to: http://localhost:8080

### Option 3 – VS Code Live Server

1. Install the “Live Server” extension in VS Code.  
2. Right-click `index.html` → “Open with Live Server”.

It will open automatically at http://localhost:5500
### Index
- [C4GUI Architecture Baseline](docs/C4GUI%20Architecture%20Baseline.md)
- [To do](TODO.md)
### Glossary
- [C4 Model](https://c4model.com/introduction) - represents software systems in 4 views: system Context, Container, Component, Code.
- [Structurizr](https://structurizr.com/) - a project that allows drawing C4 models with a DSL, as well as exporting between formats like the ones used by PlantUML or Mermaid.
## High level plan
- [x] Do a little model with Structurizr to familiarize with the usage
	- [x] Modelling
	- [ ] Understand how custom Structurizr styling works.
- [ ] C4 modelling webapp
	- [ ] Demo 1 - can draw some elements, but never export or share.
	- [ ] Demo 2 - can draw some diagrams as well as share with magic link. Demo 1 + backend with storage
	- [ ] Demo 3 - can draw diagrams, import export PlantUML, and share via magic link + Demo 2 + export logic, using Structurizr libraries.
