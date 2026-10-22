const solarSystem = (await import('npm-solarsystem')).default;

import express from 'express';
import fetch from 'node-fetch';
import sanitizeHtml from 'sanitize-html';

//express is an API engine
//it lets you make your own APIs
const app = express();

//EJS is a way to dynamically build html pages
//and easily substitute data into them
app.set("view engine", "ejs");

//public folder
app.use(express.static("public"));

app.get('/', async (req, res) => {
   var images = [];
   try {
      // Get 4 random planet images
      const result = await fetch("https://pixabay.com/api/?key=20426927-497d14db9c234faf7d0df8317&per_page=50&orientation=horizontal&q=solar%20system");
      if (!result.ok) {
         throw new Error("Pixabay request failed: " + result.status);
      }
      const json = await result.json();
      if (!Array.isArray(json.hits) || json.hits.length < 4) {
         throw new Error("Pixabay returned fewer than four images");
      }
      const availableImages = json.hits;
      for (let i = 0; i < 4; i++) {
         const randomIndex = Math.floor(Math.random() * availableImages.length);
         const selectedImage = availableImages.splice(randomIndex, 1)[0];
         images.push(selectedImage.largeImageURL);
      }
   } catch (error) {
      console.error("Pixabay request failed:", error.message);
      images = [];
   }
   res.render('home.ejs', { images: images });
});


app.get('/planetInfo', (req, res) => {
   let planet = req.query.planet;
   let picture = "";
   var data;
   switch (planet) {
      case "Mercury":
         data = solarSystem.getMercury();
         break;
      case "Venus":
         data = solarSystem.getVenus();
         break;
      case "Earth":
         data = solarSystem.getEarth();
         break;
      case "Mars":
         data = solarSystem.getMars();
         break;
      case "Jupiter":
         data = solarSystem.getJupiter();
         break;
      case "Saturn":
         data = solarSystem.getSaturn();
         break;
      case "Uranus":
         data = solarSystem.getUranus();
         break;
      case "Neptune":
         data = solarSystem.getNeptune();
         break;
      case "Pluto":
         data = solarSystem.getPluto();
         break;
      default:
         break;
   }
   data.name = planet;
   res.render("planet.ejs", data);
   // if (planet === 'Jupiter') {
   //    //render the planetInfo view with jupiter information
   // } else (planet === 'Mars') {
   //    //render the planetInfo view with mars information
   // }
});

app.get('/asteroids', (req, res) => {
   const data = solarSystem.getAsteroids();

   res.render('planet.ejs', {
      name: "Asteroids",
      image: data.image,
      description: data.def,
      websiteLink: data.link
   });
});

app.get('/comets', (req, res) => {
   const data = solarSystem.getComets();

   res.render('planet.ejs', {
      name: "Comets",
      image: data.image,
      description: data.def,
      websiteLink: data.link
   });
});

app.get('/nasa-pod', async (req, res) => {
   try {
      const today = new Date();
      const year = String(today.getFullYear());
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateCode = year.slice(-2) + month + day;
      const expectedDate = year + "-" + month + "-" + day;
      const result = await fetch(
         "https://science.nasa.gov/wp-json/wp/v2/apod-basic/" + dateCode);

      if (!result.ok) {
         throw new Error("NASA request failed: " + result.status);
      }
      const json = await result.json();
      let data = json;
      if (Array.isArray(json)) {
         data = json[0];
      }
      if (!data) {
         throw new Error("NASA returned no picture information");
      }
      if (data.date !== expectedDate) {
         throw new Error("NASA did not return the requested date");
      }
      data.explanation = sanitizeHtml(data.explanation, {
         allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'a'],
         allowedAttributes: {
            a: ['href']
         }
      });
      res.render('nasa.ejs', {
         pod: data,
         error: ""
      });
   } catch (error) {
      console.error("NASA request failed:", error.message);
      res.status(502).send("Could not request NASA's picture of the day");
   }
});

app.listen(3001, (error) => {
   if (error) {
      console.error("Server could not start: " + error.message);
      return;
   }
   console.log("SolarSystem running at http://localhost:3001");
   console.log("Running file: " + import.meta.url);
});