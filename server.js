// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({extended: true}))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express());
app.set('view engine', 'liquid');

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

app.get('/', async function (request, response) {
  try {
    const apiResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products/');
    const data = await apiResponse.json();
    const products = data.data;

    const likesResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products?filter[milledoni_users_id][_eq]=3');
    const likesData = await likesResponse.json();

    const likedProductIds = likesData.data.map(item => item.milledoni_products_id);

    response.render('index.liquid', { products: data.data }); 

  } catch (error) {
    console.error('Fout bij ophalen van data:', error);
    response.status(500).send('Er ging iets mis met het ophalen van de data.');
  }
});

app.post('/like/:id', async function (request, response) {
  const getId = request.params.id
  
  console.log(request.params.id)
 
  await fetch('https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products', {
    method: 'POST',
    body: JSON.stringify({
        milledoni_products_id: getId,
        milledoni_users_id: 3
    }),
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
});
 

  // Redirect naar de homepage
  response.redirect(303, '/');
});

app.get('/detail', async function (request, response) {
  const productsResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products');
  const productsJSON = await productsResponse.json();

  response.render('detail.liquid', { products: productsJSON.data });
});

app.get('/detail/:id', async function (request, response) {
  try {
      const productDetailResponse = await fetch('https://fdnd-agency.directus.app/items/milledoni_products/' + request.params.id);
      const productDetailResponseJSON = await productDetailResponse.json();

      console.log("Opgehaalde data:", productDetailResponseJSON); 

      if (!productDetailResponseJSON.data) {
          return response.status(404).send("Product niet gevonden.");
      }

      response.render('detail.liquid', { product: productDetailResponseJSON.data });
  } catch (error) {
      console.error("Fout bij ophalen product:", error);
      response.status(500).send("Er is iets misgegaan.");
  }

});
app.get('/favorieten-lijsten', (req, res) => {
    res.render('favorieten-lijsten'); 
  });


//   test
//   app.get('/favorieten-leeg-test', (req, res) => {
//     res.render('favorieten.liquid', {
//       products: [] 
//     });
//   });
  
  
  app.get('/favorieten', async function (req, res) {
    const userId = 3;
  
    console.log("Favorieten route aangeroepen");
  
    try {
      const response = await fetch(`https://fdnd-agency.directus.app/items/milledoni_users_milledoni_products?filter[milledoni_users_id][_eq]=${userId}&fields=milledoni_products_id.*`);
  
      if (!response.ok) {
        console.error("Fetch mislukt met status:", response.status);
        return res.status(500).send("Fout bij ophalen favorieten");
      }
  
      const json = await response.json();
      console.log("Favorieten response:", json);
  
      const favoriteProducts = json.data.map(item => item.milledoni_products_id);
  
      res.render('favorieten', {
        products: favoriteProducts
      });
  
    } catch (err) {
      console.error("Fout in /favorieten route:", err);
      res.status(500).send("Interne serverfout");
    }
  });
  
  

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 8012)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get('port')}/ jouw interactieve website bekijken.\n\nThe Web is for Everyone. Maak mooie dingen 🙂`)
})
