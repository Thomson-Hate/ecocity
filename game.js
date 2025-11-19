// =================== Город ===================
class City {
    constructor() {
        this.money = 1000;
        this.population = 50;
        this.happiness = 80;
        this.resources = {
            electricity: 100,
            water: 100,
            food: 50
        };
        this.buildings = [];
    }

    addBuilding(building) {
        if(this.money < building.cost) {
            logEvent("Недостаточно денег!");
            return false;
        }
        this.money -= building.cost;
        this.buildings.push(building);
        logEvent(`Построено: ${building.name}`);
        this.updateResources();
        return true;
    }

    updateResources() {
        // Сброс ресурсов
        this.resources.electricity = 100;
        this.resources.water = 100;
        this.resources.food = 50;

        let pop = 50;
        let happinessPenalty = 0;

        this.buildings.forEach(b => {
            if(b.type === 'residential') pop += 10;
            if(b.type === 'industrial') this.money += 5; // доход
            if(b.type === 'power') this.resources.electricity += 50;
            if(b.type === 'farm') this.resources.food += 30;
        });

        this.population = pop;

        // Счастье падает если ресурсы низкие
        if(this.resources.electricity < 50) happinessPenalty += 10;
        if(this.resources.water < 50) happinessPenalty += 10;
        if(this.resources.food < this.population/2) happinessPenalty += 10;

        this.happiness = Math.max(0, 100 - happinessPenalty);
        updateUI();
    }

    collectTaxes() {
        let income = this.population * 2;
        this.money += income;
        logEvent(`Собраны налоги: ${income}$`);
    }
}

// =================== Здания ===================
class Building {
    constructor(name, type, cost) {
        this.name = name;
        this.type = type;
        this.cost = cost;
    }
}

// =================== UI ===================
const city = new City();
const map = document.getElementById('city-map');
const eventsDiv = document.getElementById('events');

function createMap() {
    map.innerHTML = '';
    for(let i=0;i<100;i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        map.appendChild(cell);
    }
}
createMap();

function updateUI() {
    document.getElementById('money').innerText = city.money;
    document.getElementById('population').innerText = city.population;
    document.getElementById('happiness').innerText = city.happiness;
    document.getElementById('electricity').innerText = city.resources.electricity;
    document.getElementById('water').innerText = city.resources.water;
    document.getElementById('food').innerText = city.resources.food;
}

// =================== Постройка ===================
function build(type) {
    let b;
    if(type === 'residential') b = new Building('Жилой дом','residential',100);
    if(type === 'industrial') b = new Building('Фабрика','industrial',200);
    if(type === 'power') b = new Building('Электростанция','power',150);
    if(type === 'farm') b = new Building('Ферма','farm',120);

    if(city.addBuilding(b)) {
        // отобразить на карте случайную пустую клетку
        const emptyCells = Array.from(document.querySelectorAll('.cell')).filter(c => c.innerText==='');
        if(emptyCells.length>0) {
            const cell = emptyCells[Math.floor(Math.random()*emptyCells.length)];
            cell.innerText = b.type==='residential'?'🏠':b.type==='industrial'?'🏭':b.type==='power'?'⚡':'🌾';
        }
    }
}

// =================== События ===================
function logEvent(text) {
    const div = document.createElement('div');
    div.innerText = text;
    eventsDiv.prepend(div);
}

// =================== Игровой цикл ===================
setInterval(() => {
    city.collectTaxes();
    city.updateResources();

    // случайные события
    if(Math.random()<0.01) {
        logEvent("Произошло событие: экономический кризис!");
        city.money = Math.max(0, city.money-100);
    }
}, 5000);

updateUI();
