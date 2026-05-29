const map=L.map('map').setView([61.0042,69.0019],13)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:''
}).addTo(map)

async function enableWakeLock(){
try{
await navigator.wakeLock.request('screen')
}catch(e){
console.log(e)
}
}

enableWakeLock()

let playerMarker=null
let playMode=false
let currentClan='SP'
let adminMode=false
let transferMode=false
let selectedClan=null

const clans={
SP:{color:'#00ff88',money:0},
RED:{color:'#ff4444',money:0},
BLUE:{color:'#4488ff',money:0}
}

const CELL_SIZE=50

const owners={}
const upgrades={}
const cells={}

let capturedCells=0

function saveWorld(){
localStorage.setItem('mapperhm_world',JSON.stringify({
owners,
upgrades,
clans
}))
}

function loadWorld(){

const save=localStorage.getItem('mapperhm_world')

if(!save)return

const data=JSON.parse(save)

Object.assign(owners,data.owners||{})
Object.assign(upgrades,data.upgrades||{})
Object.assign(clans,data.clans||{})
}

loadWorld()

function latStep(m){
return m/111320
}

function lngStep(m,lat){
return m/(111320*Math.cos(lat*Math.PI/180))
}

function getCell(lat,lng){

const stepLat=latStep(CELL_SIZE)
const stepLng=lngStep(CELL_SIZE,lat)

const x=Math.floor(lat/stepLat)
const y=Math.floor(lng/stepLng)

return `${x}_${y}`
}

function updateLeaderboard(){

document.getElementById('leaderboardContent').innerHTML=`

SP — ${clans.SP.money.toFixed(1)}💰<br>
RED — ${clans.RED.money.toFixed(1)}💰<br>
BLUE — ${clans.BLUE.money.toFixed(1)}💰

`
}

updateLeaderboard()

function renderVisibleGrid(){

Object.values(cells).forEach(c=>map.removeLayer(c))

for(const key in cells){
delete cells[key]
}

const bounds=map.getBounds()

const north=bounds.getNorth()
const south=bounds.getSouth()
const east=bounds.getEast()
const west=bounds.getWest()

const centerLat=map.getCenter().lat

const stepLat=latStep(CELL_SIZE)
const stepLng=lngStep(CELL_SIZE,centerLat)

const startX=Math.floor(south/stepLat)
const endX=Math.floor(north/stepLat)

const startY=Math.floor(west/stepLng)
const endY=Math.floor(east/stepLng)

for(let x=startX;x<=endX;x++){

for(let y=startY;y<=endY;y++){

const lat1=x*stepLat
const lng1=y*stepLng

const id=`${x}_${y}`

let color='#444'

if(owners[id]){
color=clans[owners[id]].color
}

let weight=0.25

if(upgrades[id]===1)weight=1.2
if(upgrades[id]===2)weight=2

const rect=L.rectangle([
[lat1,lng1],
[lat1+stepLat,lng1+stepLng]
],{
color,
weight,
fillOpacity:owners[id]?0.35:0
}).addTo(map)

rect.on('click',()=>{

if(adminMode&&transferMode&&selectedClan){

owners[id]=selectedClan

saveWorld()

renderVisibleGrid()

return
}

if(owners[id]===currentClan){

if(!upgrades[id]){

if(clans[currentClan].money>=10){

clans[currentClan].money-=10

upgrades[id]=1

saveWorld()

updateLeaderboard()

renderVisibleGrid()
}

}else if(upgrades[id]===1){

if(clans[currentClan].money>=30){

clans[currentClan].money-=30

upgrades[id]=2

saveWorld()

updateLeaderboard()

renderVisibleGrid()
}
}
}
})

cells[id]=rect
}
}
}

map.on('moveend',()=>{
renderVisibleGrid()
})

function captureCell(lat,lng){

if(!playMode)return

const id=getCell(lat,lng)

if(owners[id]!==currentClan){

owners[id]=currentClan

capturedCells++

if(capturedCells>=10){

capturedCells=0

clans[currentClan].money+=0.5

updateLeaderboard()
}

saveWorld()
}
}

navigator.geolocation.watchPosition(

pos=>{

const lat=pos.coords.latitude
const lng=pos.coords.longitude

if(!playerMarker){

playerMarker=L.circleMarker([lat,lng],{
radius:7,
color:clans[currentClan].color,
fillColor:clans[currentClan].color,
fillOpacity:1
}).addTo(map)

}else{

playerMarker.setLatLng([lat,lng])
}

captureCell(lat,lng)

renderVisibleGrid()

},

err=>{
alert('GPS ERROR')
},

{
enableHighAccuracy:true
}
)

const playBtn=document.getElementById('playBtn')

playBtn.onclick=()=>{

playMode=!playMode

if(playMode){

playBtn.innerText='⏸ STOP'
playBtn.style.background='#ff4444'

}else{

playBtn.innerText='▶ PLAY'
playBtn.style.background='#00ff88'
}
}

const adminBtn=document.getElementById('adminBtn')
const adminPanel=document.getElementById('adminPanel')

adminBtn.onclick=()=>{

const code=prompt('ADMIN CODE')

if(code==='tinyxen12zov'){

adminMode=true

adminPanel.style.display='block'

alert('ADMIN ENABLED')

}else{

alert('WRONG CODE')
}
}

document.getElementById('wipeBtn').onclick=()=>{

for(const key in owners){
delete owners[key]
}

for(const key in upgrades){
delete upgrades[key]
}

clans.SP.money=0
clans.RED.money=0
clans.BLUE.money=0

saveWorld()

updateLeaderboard()

renderVisibleGrid()

alert('WORLD WIPED')
}

document.getElementById('giveMoneyBtn').onclick=()=>{

const clan=prompt('SP / RED / BLUE')

const amount=parseFloat(prompt('AMOUNT'))

if(clans[clan]){

clans[clan].money+=amount

saveWorld()

updateLeaderboard()
}
}

document.getElementById('transferBtn').onclick=()=>{

const clan=prompt('SP / RED / BLUE')

if(clans[clan]){

transferMode=true

selectedClan=clan

alert('Нажми на клетку')
}
}

document.getElementById('searchBtn').onclick=async()=>{

const query=document.getElementById('searchInput').value

if(!query)return

const url=`https://nominatim.openstreetmap.org/search?format=json&q=${query}`

const res=await fetch(url)

const data=await res.json()

if(data.length>0){

const place=data[0]

map.setView([place.lat,place.lon],17)

L.marker([place.lat,place.lon]).addTo(map)
}
  }
