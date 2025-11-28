const express = require('express');
const bodyParser = require('body-parser');
const rental = require('./rentalPrice');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/pictures', express.static('images'));

const formHtml = fs.readFileSync('form.html', 'utf8');
const resultHtml = fs.readFileSync('result.html', 'utf8');

app.post('/', (req, res) => {
  const formData = req.body;

  const result = rental.price(
    // formData.pickup,
    // formData.dropoff,
    new Date(formData.pickupdate),
    new Date(formData.dropoffdate),
    formData.type,
    Number(formData.age),
    formData.isLicense === 'on',
    formData.licenseData
  );

  // Format the result w some info
  let parsResult;
  if (typeof result === 'number') {
    parsResult = `
            <div class="car-item">
                <div class="car-type">${formData.type || 'Selected Car'}</div>
                <div class="price">$${Math.round(result).toLocaleString()}</div>
                <div>Total rental price for you~</div>
            </div>
        `;
  } else {
    parsResult = `<div class="error">${result}</div>`;
  }

  const responseHtml = resultHtml.replaceAll('%RESULT%', parsResult);
  res.send(responseHtml);
});

app.get('/', (req, res) => {
  res.send(formHtml);
});

const startServer = () => {
  try {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
