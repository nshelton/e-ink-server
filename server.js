const express = require('express');
let Dither = require('canvas-dither');
const app = express();
let fetch = require('node-fetch');

const { createCanvas, registerFont } = require('canvas');
const { setMaxListeners } = require('events');
let starChart = require("./starChart.js")
let secrets = require("./secrets.js")
const port = 1337;
 

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})


registerFont('FFFFORWA.TTF', { family: 'arcadeclassic' })

function compressArray(array) {
  var result = []; d
  if (array.length > 0) {
    var count = 1;
    var value = array[0];
    for (var i = 1; i < array.length; ++i) {
      var entry = array[i];
      if (entry == value) {
        count += 1;
      } else {
        result.push(count);
        result.push(value);
        count = 1;
        value = entry;
      }
    }
    result.push(count);
    result.push(value);
  }
  return result;
}

 lastWeatherUpdate = 0

currentWeather = {
  coord: { lon: -118.261, lat: 34.0743 },
  weather: [ { id: 721, main: 'Haze', description: 'haze', icon: '50d' } ],
  base: 'stations',
  main: {
    temp: 69.39,
    feels_like: 69.75,
    temp_min: 63.03,
    temp_max: 76.8,
    pressure: 1014,
    humidity: 79
  },
  visibility: 8047,
  wind: { speed: 5.75, deg: 160 },
  clouds: { all: 100 },
  dt: 1658851684,
  sys: {
    type: 2,
    id: 2009067,
    country: 'US',
    sunrise: 1658840400,
    sunset: 1658890731
  },
  timezone: -25200,
  id: 5368361,
  name: 'Los Angeles',
  cod: 200
}

getWeather = true
autoReload = false

function getTimeString(date) {
  const options = {
    hour: 'numeric', minute: 'numeric',
    timeZone: 'America/Los_Angeles'
  };

  return date.toLocaleTimeString('en-US', options);

  // let min = date.getMinutes()
  // min = min < 10 ? "0" + min : min
  // let hour = date.getHours() % 12
  // hour = hour < 10 ? "0" + hour : hour
  // let seconds = date.getSeconds()
  // seconds = seconds < 10 ? "0" + seconds : seconds
  // // return hour + ":" + min + ":" + seconds;
  // return hour + ":" + min + " " + (date.getHours() < 12 ? "a" : "p");
}

async function createDrawing() {

  const canvas = createCanvas(800, 480)
  let ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 800, 480)

  ctx = starChart.render(ctx) 

  ctx.font = '20px arcadeclassic'

  ctx.fillStyle = 'black'
  ctx.strokeStyle = 'black'

  ctx.lineWidth = 4


  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  // let date_ob = new Date(1634149314984 + (Date.now() - 1656189614984) * 50000);
  let date_ob = new Date();
  

  let datestr = months[date_ob.getMonth()] + " " + date_ob.getDate() + " " + date_ob.getFullYear() 


  if (getWeather) {
    let weatherurl = secrets.WeatherURL
    lastWeatherUpdate = Date.now()
    currentWeather = await fetch(weatherurl).then(res => res.json())
    console.log(currentWeather)
  }

  var yOffs = 40
  ctx.fillText(datestr, 10, yOffs)
  yOffs += 40
  ctx.fillText(getTimeString(date_ob), 10, yOffs)
  yOffs += 40
  ctx.fillText(Math.round(currentWeather.main.temp), 45,yOffs)
  ctx.strokeRect(80, yOffs-25, 8, 8) // degree sign
  ctx.font = '15px arcadeclassic'
  ctx.fillText(Math.round(currentWeather.main.temp_min), 10, yOffs)
  ctx.fillText(Math.round(currentWeather.main.temp_max), 100, yOffs)

  var lineheight = 20
  yOffs += 20
  ctx.fillText(Math.round(currentWeather.main.humidity) + " % ", 10, yOffs)
  ctx.fillText(Math.round(currentWeather.main.pressure/10) + " kPa", 55, yOffs)
  yOffs += 30
  ctx.fillText(getTimeString(new Date(currentWeather.sys.sunrise * 1000)) + "", 10, yOffs)
  yOffs += lineheight
  ctx.fillText(getTimeString(new Date(currentWeather.sys.sunset * 1000)) + "", 10, yOffs)
  yOffs += lineheight
  ctx.font = '15px arcadeclassic'

  // var yOffs = 40
  // ctx.fillText(datestr, 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(getTimeString(date_ob), 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(currentWeather.weather[0].main, 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(currentWeather.main.temp + "°", 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(currentWeather.wind.speed + " mph", 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(currentWeather.main.feels_like + "°", 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(currentWeather.main.humidity + "%", 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(currentWeather.weather[0].description, 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(Math.round(currentWeather.main.pressure/10) + " kPa", 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(getTimeString(new Date(currentWeather.sys.sunrise)) + "", 10, yOffs)
  // yOffs += lineheight
  // ctx.fillText(getTimeString(new Date(currentWeather.sys.sunset)) + "", 10, yOffs)
  // yOffs += lineheight


  // try {
  //   const img = await loadImage('rosie.jpg')
  //   ctx.drawImage(img, 400, 0, 380, 480)
  // } catch (e) {
  //   console.log(e)
  // }
  
  doDithering = true

  if (doDithering) {
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imgData = Dither.threshold(imgData,138);
    // imgData = Dither.bayer(imgData,140);
    // imgData = Dither.floydsteinberg(imgData);
    ctx.putImageData(imgData, 0, 0);
  }
  return canvas
}

app.get('/image', async (_, res) => {
  console.log("requesting image")
  try {
    let canvas = await createDrawing();
    const ctx = canvas.getContext('2d')
    var reloadscript = autoReload ?"<script> window.setTimeout( function() { window.location.reload(); }, 1000); </script>" : ""
    res.send('<body style="background-color:#ddd"><img src="' + canvas.toDataURL() + '" /> ' + reloadscript + '</body>');
  } catch (e) {
    console.log(e)
  }
})

app.get('/data', async (_, res) => {

  let canvas = await createDrawing();
  const ctx = canvas.getContext('2d')
  imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  bytes = []
  console.log(imgData)

  bytes = ""

  for (let i = 0; i < imgData.data.length; i += 4 * 8) {
    var val = 255
    val -= imgData.data[i + 4 * 0] > 0 ? 1 << 7 : 0
    val -= imgData.data[i + 4 * 1] > 0 ? 1 << 6 : 0
    val -= imgData.data[i + 4 * 2] > 0 ? 1 << 5 : 0
    val -= imgData.data[i + 4 * 3] > 0 ? 1 << 4 : 0
    val -= imgData.data[i + 4 * 4] > 0 ? 1 << 3 : 0
    val -= imgData.data[i + 4 * 5] > 0 ? 1 << 2 : 0
    val -= imgData.data[i + 4 * 6] > 0 ? 1 << 1 : 0
    val -= imgData.data[i + 4 * 7] > 0 ? 1 << 0 : 0

    bytes += String.fromCharCode(val)
  }
  console.log(bytes.length);

  // for(let i = 0; i < bytes.length; i ++) {
  //   console.log(bytes[i].charCodeAt(0))
  // }

  res.send(Buffer.from(bytes, 'binary'));

});
